import { parseConfig, parseStartTime } from "./config";
import { LemmyHttp } from "lemmy-js-client";
import { SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import { mkFeedTask } from "./util";

const config = parseConfig();
const startTime = parseStartTime();
const defaultSchedule = config.defaultSchedule ?? { hours: 1 };

const client = new LemmyHttp(config.lemmy.instanceUrl);

client.login(config.lemmy.login).then((loginResponse) => {
  const token = loginResponse.jwt;

  if (!token) {
    throw "Failed to login";
  }

  client.setHeaders({
    Authorization: `Bearer ${token}`,
  });

  const scheduler = new ToadScheduler();

  config.feeds.forEach((feed) => {
    const task = mkFeedTask(startTime, client, feed);
    const job = new SimpleIntervalJob(
      { ...(feed.schedule ?? defaultSchedule), runImmediately: true },
      task,
      {},
    );
    scheduler.addSimpleIntervalJob(job);
  });
});
