FROM node:14.17.3-alpine3.14

RUN addgroup -S group && adduser -S user -G group
# RUN user add -ms /bin/bash user
USER user

WORKDIR /home/user

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm","start"]
