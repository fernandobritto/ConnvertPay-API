# ConnvertPay API

> ### Esta é uma API Rest desenvolvida em Nodejs para controle e registro de dividas de clientes.

&nbsp;&nbsp;&nbsp;

## 🛠 Tecnologia

Principais ferramentas utilizadas neste projeto:

- [Typescript][typescript]
- [Node.js][nodejs]
- [ExpressJS][express]
- [PostgreSQL][postgresql]
- [TypeORM][typeorm]
- [ESLint][eslint]
- [JWT][jsonwebtoken]



[typescript]: https://www.typescriptlang.org/
[nodejs]: https://nodejs.org/
[express]: https://expressjs.com/pt-br/
[postgresql]: https://www.postgresql.org/
[typeorm]: https://typeorm.io
[eslint]: https://eslint.org/
[jsonwebtoken]: https://jwt.io/


[license]: https://opensource.org/licenses/MIT


&nbsp;&nbsp;

## Como executar o projeto em seu ambiente


```bash
# clone o repositório digitando o seguinte comando em seu terminal
git clone https://github.com/fernandobritto/ConnvertPay-API.git

# entre na pasta do projeto
cd ConnvertPay-API

# instale todas as dependências necessárias
yarn install

# preencha as seguintes variáveis de ambiente no arquivo .env
TOKEN_SECRET
TOKEN_EXPIRATION

# preencha o arquivo ormconfig com as informações do seu banco de dados
ormconfig.json

# migre as tabelas para o seu banco de dados com o seguinte comando
yarn typeorm migration:run

# execute o projeto com o comando
yarn dev
```
&nbsp;&nbsp;&nbsp;

# Desenvolvedores(as)

Fernando Britto

https://fernandobritto.github.io/

https://br.linkedin.com/in/fernando-britto-web-developer
