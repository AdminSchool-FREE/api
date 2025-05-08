FROM bitnami/node:latest

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

EXPOSE 3333
CMD ["npm", "start"]