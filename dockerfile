FROM node:22.14.0-slim AS app

# Variáveis de build
#ARG JWT_PRIVATE_KEY
#ARG JWT_PUBLIC_KEY
# ARG JWT_EXPIRES_IN

# Passa as variáveis de build como variáveis de ambiente
#ENV JWT_PRIVATE_KEY=$JWT_PRIVATE_KEY
#ENV JWT_PUBLIC_KEY=$JWT_PUBLIC_KEY
# ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN

# Cria um diretório de trabalho
WORKDIR /app

# Instala as dependências do package.json para acelerar o build
COPY package*.json ./

# Instala as dependências
RUN yarn install

# Copia os arquivos do projeto para o container
COPY . .

# Expõe a porta em que a aplicação será executada
EXPOSE 4001

# Comando para rodar a aplicação
CMD yarn migration:run && node dist/src/main
