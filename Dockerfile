FROM node:12
RUN mkdir -p /usr/src/appWORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "app.js" ]
