# rss-lemmy-bot

A (quick and dirty) bot intended to scan RSS feeds and post them to Lemmy communities.

## Usage

### Prerequisites

If running locally, ensure NodeJS >= 20 is installed.
Otherwise, docker and docker-compose may be desired.

### Configuration

Copy `config.template.json` to `config.json` and configure it.

### Run Locally

One time setup: `npm install && npm run build`
Startup: `npm run start`

### Docker

`docker run -v './config.json:/rss-lemmy-bot/config.json' -t kensand/rss-lemmy-bot`

### Docker Compose

See [docker-compose.yml](./docker-compose.yml)
