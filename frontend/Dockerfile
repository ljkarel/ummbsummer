FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json .
RUN npm ci

EXPOSE 5173

CMD ["npm", "run", "dev"]
