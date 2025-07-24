FROM node:20

WORKDIR /app
COPY backend/package*.json ./
COPY frontend/ ./frontend

RUN npm install

COPY backend/ .

CMD ["node", "index.js"]
