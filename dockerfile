#base image
#set working directory
#copy package.json files
#install dependencies
#install the rest of source code
#app settings and environment varialbles
#expose port
# CDM ["npm" , "start"]



FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]