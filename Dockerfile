FROM node:latest
LABEL authors="kensand"

WORKDIR "/rss-lemmy-bot"

COPY . /rss-lemmy-bot

RUN npm install && npm run build

CMD ["node", "./dist/cjs/main.js"]