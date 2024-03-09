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

```shell
npm install && npm run build
```

Startup:

```shell
npm run start
```

### Docker

```shell
docker run -v './config.json:/rss-lemmy-bot/config.json' -t kensand/rss-lemmy-bot
```

### Docker Compose

See [docker-compose.yml](./docker-compose.yml)

## Development

### Harness

A docker-compose.yml file to act as a test harness is available in [./dev/docker](./dev/docker).

```shell
docker stack deploy -c dev/docker/docker-compose.yml rss-lemmy-bot-harness
```

This will start a lemmy server on your localhost available at [127.0.0.1:80](127.0.0.1:80).

You will need to create the relevant communities in the test harness. A utility script is provided for this:
```shell
CONFIG_PATH=./dev/config.json \
npm run setupHarness
```

### Running

If you are using the test harness, you can use a provided dev config [./dev/config.json](./dev/config.json)

```shell
CONFIG_PATH=./dev/config.json \
START_TIME=0 \
npm run start
```



