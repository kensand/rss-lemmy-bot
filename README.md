# rss-lemmy-bot

A Lemmy bot intended to scan RSS feeds and post them to Lemmy communities.

## How it works

This bot takes in a mapping of RSS feeds to sets of Lemmy Communities (Map<Feed, List<Community>>), will scan the RSS feeds at intervals, and post new items in those feeds to their respective Lemmy communities.

The bot does its best to avoid posting the same item from a feed twice. It does this by recording its start time and only posting items that are after it. Any time it posts an item for a given feed, it records the timestamp for that item, and will not post any other items older than that timestamp for that feed. Items will be posted in order of their published dates. All aforementioned timestamps are volatile and will be lost at exit. You may override the start time using the `START_TIME` environment variable - see [Configuration](#configuration) for format.

## Usage

### Prerequisites

If running locally, ensure `NodeJS >= 20` is installed.

Otherwise, docker and docker-compose may be desired.

After creating your Lemmy bot account on the server, go into the settings for the user and check
the "bot account" checkbox.

### Configuration

Copy `config.template.json` to `config.json` and configure it.

The `defaultSchedule` and per-feed `schedule` are optional. The default is 1 hour.

The `START_TIME` environment variable may be used to override the bots start time for back-filling or testing purposes. This should take the format of a string that can be parsed by the [JavaScript Date constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), such as `2023-06-27T14:48:53.123+00:00`.

The `CONFIG_PATH` environment variable may be used to set the path to the configuration file. The default is `./config.json`. In the docker container, the working directory is `/rss-lemmy-bot`, so the default absolute path is `/rss-lemmy-bot/config.json`.

You may override the `defaultSchedule` and the feed-specific `schedule` using a [toad-scheduler](https://github.com/kibertoad/toad-scheduler/tree/main) [SimpleIntervalSchedule](https://github.com/kibertoad/toad-scheduler/blob/main/lib/engines/simple-interval/SimpleIntervalSchedule.ts). See [config.ts](./lib/config.ts) for the exact format.

### Run Locally

One time setup:

```
npm install && npm run build
```

Startup:

```
npm run start
```

### Docker

`docker run -v './config.json:/rss-lemmy-bot/config.json' -t kensand/rss-lemmy-bot`

### Docker Compose

See [docker-compose.yml](./docker-compose.yml)
