FROM bitnami/node:latest

COPY . /app
WORKDIR /app

CMD ["npm", "start"]