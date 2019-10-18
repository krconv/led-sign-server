FROM node:12
WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm install

# build the project
COPY . .
RUN npm run build

ENV PORT=8080
EXPOSE ${PORT}

CMD ["npm", "run", "serve"]