
# pull LTS standard node image
FROM node:10.13.0

# create dirs in app code in container to control permissions
RUN mkdir -p /home/node/app/node_modules

# set working dir of app
WORKDIR /home/node/app

# cache to skip reinstalling node modules/use existing image layer
COPY package*.json ./

RUN npm install

# copy app code to app dir on container
COPY . .

# to accept requests at port=8080
EXPOSE 8080

CMD [ "node", "app.js"]