#!/bin/bash

# Monitoring System Validation Script
# ConnvertPay API - Prometheus & Postgres Exporter

set -e  # Exit on any error

echo "🔍 Starting ConnvertPay monitoring system validation..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker and Docker Compose are installed
echo -e "\n${BLUE}1. Checking dependencies...${NC}"
command -v docker &> /dev/null
print_status $? "Docker is installed"

command -v docker-compose &> /dev/null
print_status $? "Docker Compose is installed"

# Check if services are running
echo -e "\n${BLUE}2. Checking service status...${NC}"

# PostgreSQL
postgres_status=$(docker-compose ps postgres | grep -c "Up" || echo "0")
print_status $postgres_status "PostgreSQL is running"

# Postgres Exporter
exporter_status=$(docker-compose ps postgres-exporter | grep -c "Up" || echo "0")
print_status $exporter_status "Postgres Exporter is running"

# Prometheus
prometheus_status=$(docker-compose ps prometheus | grep -c "Up" || echo "0")
print_status $prometheus_status "Prometheus is running"

# Check PostgreSQL connectivity
echo -e "\n${BLUE}3. Checking PostgreSQL connectivity...${NC}"
pg_connection=$(docker-compose exec -T postgres pg_isready -U root -d connvertpay-db 2>/dev/null | grep -c "accepting connections" || echo "0")
print_status $pg_connection "PostgreSQL accepts connections"

# Check PostgreSQL extensions
echo -e "\n${BLUE}4. Checking PostgreSQL extensions...${NC}"
pg_stat_statements=$(docker-compose exec -T postgres psql -U root -d connvertpay-db -c "SELECT count(*) FROM pg_extension WHERE extname = 'pg_stat_statements';" -t 2>/dev/null | tr -d ' ' || echo "0")
if [ "$pg_stat_statements" = "1" ]; then
    print_status 0 "pg_stat_statements extension is installed"
else
    print_status 1 "pg_stat_statements extension is NOT installed"
fi

# Check Postgres Exporter metrics
echo -e "\n${BLUE}5. Checking Postgres Exporter metrics...${NC}"

# Wait a moment for exporter to be ready
sleep 5

# Check if endpoint is responding
if curl -s -f http://localhost:9187/metrics > /dev/null 2>&1; then
    print_status 0 "Postgres Exporter endpoint is accessible"
    
    # Check pg_up metric
    pg_up=$(curl -s http://localhost:9187/metrics | grep "^pg_up " | grep -o "pg_up [0-1]" | cut -d' ' -f2 || echo "0")
    if [ "$pg_up" = "1" ]; then
        print_status 0 "pg_up metric indicates database is working"
    else
        print_status 1 "pg_up metric indicates database problem"
    fi
    
    # Check some basic metrics
    pg_database_metrics=$(curl -s http://localhost:9187/metrics | grep -c "pg_stat_database_" || echo "0")
    if [ $pg_database_metrics -gt 0 ]; then
        print_status 0 "Database metrics are being collected ($pg_database_metrics metrics)"
    else
        print_status 1 "Database metrics are NOT being collected"
    fi
    
    # Check custom metrics
    custom_metrics=$(curl -s http://localhost:9187/metrics | grep -c "pg_table_size\|pg_connection_stats\|pg_account_metrics" || echo "0")
    if [ $custom_metrics -gt 0 ]; then
        print_status 0 "Custom metrics are being collected ($custom_metrics metrics)"
    else
        print_warning "Custom metrics not found (may take a few minutes to appear)"
    fi
    
else
    print_status 1 "Postgres Exporter endpoint is NOT accessible"
fi

# Check Prometheus
echo -e "\n${BLUE}6. Checking Prometheus...${NC}"

# Wait a moment for Prometheus to be ready
sleep 5

if curl -s -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    print_status 0 "Prometheus is healthy"
    
    # Check targets
    targets_response=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null || echo "{}")
    postgres_target_up=$(echo $targets_response | grep -c '"health":"up".*postgres-exporter' || echo "0")
    
    if [ $postgres_target_up -gt 0 ]; then
        print_status 0 "postgres-exporter target is UP in Prometheus"
    else
        print_warning "postgres-exporter target is not UP (may take a few minutes)"
    fi
    
    # Check if basic query works
    query_response=$(curl -s "http://localhost:9090/api/v1/query?query=pg_up" 2>/dev/null | grep -c '"status":"success"' || echo "0")
    if [ $query_response -gt 0 ]; then
        print_status 0 "Prometheus can execute metric queries"
    else
        print_warning "Prometheus cannot execute queries yet (wait a few minutes)"
    fi
    
else
    print_status 1 "Prometheus is NOT healthy"
fi

# Check ports
echo -e "\n${BLUE}7. Checking ports...${NC}"

ports=("5432:PostgreSQL" "9090:Prometheus" "9187:Postgres Exporter")
for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    service=$(echo $port_info | cut -d: -f2)
    
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        print_status 0 "Port $port ($service) is listening"
    else
        print_status 1 "Port $port ($service) is NOT listening"
    fi
done

# Check configuration files
echo -e "\n${BLUE}8. Checking configuration files...${NC}"

config_files=(
    "monitoring/prometheus/prometheus.yml:Prometheus configuration"
    "monitoring/postgres-exporter/queries.yml:Custom queries"
    "monitoring/postgres-exporter/init-postgres.sql:Initialization script"
    "docker-compose.yml:Docker Compose"
)

for file_info in "${config_files[@]}"; do
    file=$(echo $file_info | cut -d: -f1)
    desc=$(echo $file_info | cut -d: -f2)
    
    if [ -f "$file" ]; then
        print_status 0 "$desc exists"
    else
        print_status 1 "$desc does NOT exist"
    fi
done

# Check logs for errors
echo -e "\n${BLUE}9. Checking logs for errors...${NC}"

postgres_errors=$(docker-compose logs postgres 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
if [ $postgres_errors -eq 0 ]; then
    print_status 0 "No critical errors found in PostgreSQL logs"
else
    print_warning "$postgres_errors error(s) found in PostgreSQL logs"
fi

exporter_errors=$(docker-compose logs postgres-exporter 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
if [ $exporter_errors -eq 0 ]; then
    print_status 0 "No critical errors found in Postgres Exporter logs"
else
    print_warning "$exporter_errors error(s) found in Postgres Exporter logs"
fi

prometheus_errors=$(docker-compose logs prometheus 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
if [ $prometheus_errors -eq 0 ]; then
    print_status 0 "No critical errors found in Prometheus logs"
else
    print_warning "$prometheus_errors error(s) found in Prometheus logs"
fi

# Final summary
echo -e "\n${BLUE}=================================================="
echo -e "🏁 VALIDATION SUMMARY${NC}"
echo "=================================================="

print_info "Access the following addresses to check the system:"
echo "   • PostgreSQL: localhost:5432 (user: root)"
echo "   • Postgres Exporter: http://localhost:9187/metrics"
echo "   • Prometheus: http://localhost:9090"

print_info "Useful queries in Prometheus:"
echo "   • pg_up - Database status"
echo "   • pg_stat_database_numbackends - Active connections"
echo "   • rate(pg_stat_database_xact_commit[1m]) - Commit rate"
echo "   • pg_database_size_bytes - Database size"

print_info "For troubleshooting:"
echo "   • Logs: docker-compose logs [service]"
echo "   • Status: docker-compose ps"
echo "   • Restart: docker-compose restart [service]"

echo -e "\n${GREEN}✅ Validation completed!${NC}"
echo "📖 Check monitoring/README.md for more details."