# BUILD
FROM node:23.8.0-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# PRODUCTION
FROM node:23.8.0-alpine AS production

WORKDIR /home/node/app

#RUN addgroup -g 4223 -S appgroup && adduser -S appuser -G appgroup -u 5000

#RUN mkdir ./uploads
RUN mkdir ./samples

#RUN chown -R appuser:appgroup /home/node/app

#USER appuser

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist .

CMD [ "npm", "run", "start" ]