FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
# השורה הזו פותרת את שגיאת ה-ENOENT מהלוגים שלך
RUN mkdir -p /app/src/1-assets/images
COPY package*.json ./
RUN npm install --production --legacy-peer-deps
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/app.js"]