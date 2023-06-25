import * as fs from "fs";
import { Config } from "./config";
import { LemmyHttp } from "lemmy-js-client";
import { SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import Parser from "rss-parser";
import { mkFeedTask } from "./util";

const configPath = process.env["CONFIG_PATH"] ?? "./config.json";
const startTimeEnv = process.env["START_TIME"];
const startTime = startTimeEnv ? new Date(startTimeEnv) : new Date();

const config: Config = JSON.parse(fs.readFileSync(configPath).toString());
const defaultSchedule = config.defaultSchedule ?? { hours: 1 };

const client = new LemmyHttp(config.lemmy.instanceUrl);

client.login(config.lemmy.login).then((loginResponse) => {
  const token = loginResponse.jwt;

  if (!token) {
    throw "Failed to login";
  }

  const scheduler = new ToadScheduler();
  const parser = new Parser<Record<string, never>, Record<string, never>>();

  const lastFeedItemTimes = Object.fromEntries(
    config.feeds.map((it) => [it.feedUrl, startTime.getTime()])
  );

  config.feeds.forEach((feed) => {
    const task = mkFeedTask(
      startTime,
      client,
      feed,
      parser,
      lastFeedItemTimes,
      token
    );
    task.execute();
    const job = new SimpleIntervalJob(
      feed.schedule ?? defaultSchedule,
      task,
      {}
    );
    scheduler.addSimpleIntervalJob(job);
  });
});
