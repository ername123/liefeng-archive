FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY patch-userinfo.cjs ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]