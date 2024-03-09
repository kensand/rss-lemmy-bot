FROM docker.io/node:20-alpine
LABEL authors="kensand"
ENV NODE_ENV=production

WORKDIR "/rss-lemmy-bot"

COPY ./dist /rss-lemmy-bot/dist
COPY package.json /rss-lemmy-bot
COPY package-lock.json /rss-lemmy-bot

RUN npm i

USER node
CMD ["node", "./dist/cjs/main.js"]
