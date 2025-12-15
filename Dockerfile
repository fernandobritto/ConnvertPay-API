# Etapa 1: Build da aplicação
FROM node:22.14.0-alpine AS builder

# Instala dependências necessárias para compilação
RUN apk add --no-cache python3 make g++ wget

# Define o diretório de trabalho
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia os arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o código fonte
COPY . .

# Compila a aplicação TypeScript
RUN pnpm build

# Remove dependências de desenvolvimento
RUN pnpm prune --prod

# Etapa 2: Imagem de produção
FROM node:22.14.0-alpine AS production

# Instala wget para health checks
RUN apk add --no-cache wget

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Define o diretório de trabalho
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia dependências de produção do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Muda para o usuário não-root
USER nodejs

# Expõe a porta da aplicação
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main"]
