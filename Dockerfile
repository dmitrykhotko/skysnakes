FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 8080
EXPOSE 8081

CMD [ "npm", "run", "start" ]