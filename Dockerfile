FROM node:11.15

WORKDIR /usr/src

COPY package*.json yarn* ./

RUN yarn

COPY . .

EXPOSE 4100

CMD ["npm", "run", "start:prod"]
