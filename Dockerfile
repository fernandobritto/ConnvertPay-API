FROM node:carbon

WORKDIR /usr/src/app
COPY ./package.json ./
RUN npm install

EXPOSE 3090
CMD ["npm", "run", "dev"]
