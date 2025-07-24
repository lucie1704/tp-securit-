FROM node:20

WORKDIR /app
COPY backend/ .
COPY frontend/ ./frontend

RUN npm install

CMD ["node", "index.js"]
