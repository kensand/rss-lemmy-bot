FROM docker.io/node:20-alpine
LABEL authors="kensand"

WORKDIR "/rss-lemmy-bot"

COPY . /rss-lemmy-bot

RUN npm install --production && npm run buildImage

USER node
CMD ["node", "./dist/cjs/main.js"]
