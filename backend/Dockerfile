# API Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
