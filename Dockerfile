FROM node:24-alpine
WORKDIR /app

COPY . .
RUN npm ci && npm run build

ENV NODE_ENV=production
VOLUME ["/app/data"]
EXPOSE 3001

CMD ["node", "server/index.js"]
