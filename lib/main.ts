import * as fs from "fs";
import { Config } from "./config";
import { LemmyHttp } from "lemmy-js-client";
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";
import Parser from "rss-parser";
import { NodeHtmlMarkdown } from "node-html-markdown";

const configPath = process.env["CONFIG_PATH"] ?? "./config.json";
const startTimeEnv = process.env["START_TIME"];
const startTime = startTimeEnv
  ? new Date(startTimeEnv).getTime()
  : new Date().getTime();

const config: Config = JSON.parse(fs.readFileSync(configPath).toString());

const client = new LemmyHttp(config.lemmy.instanceUrl);
client.login(config.lemmy.login).then((loginResponse) => {
  const token = loginResponse.jwt;
  if (!token) {
    throw "Failed to login";
  }
  const scheduler = new ToadScheduler();
  const parser = new Parser();

  const lastFeedItemTimes = Object.fromEntries(
    config.feeds.map((it) => [it.feedUrl, startTime])
  );

  config.feeds.forEach((feed) => {
    const task = new AsyncTask(feed.feedUrl, async () => {
      console.log(`Scanning feed ${feed.feedUrl}`);
      const feedResults = await parser.parseURL(feed.feedUrl);
      const items = feedResults.items
        .map((it) => {
          return {
            ...it,
            date: it.isoDate
              ? Date.parse(it.isoDate)
              : it.pubDate
              ? Date.parse(it.pubDate)
              : startTime,
          };
        })
        .sort((a, b) => {
          if (a.date < b.date) {
            return -1;
          } else if (a.date > b.date) {
            return 1;
          } else {
            return 0;
          }
        });
      await Promise.all(
        items.map(async (item) => {
          const itemDate = item.isoDate ? Date.parse(item.isoDate) : undefined;
          const lastTime = lastFeedItemTimes[feed.feedUrl];
          const title = item.title;
          if (title && itemDate && lastTime && itemDate > lastTime) {
            console.log(`Posting item ${title} from ${feed.feedUrl}`);
            await Promise.all(
              feed.lemmyCommunities.map(async (c) => {
                const communityId = (
                  await client.getCommunity({ name: c.communityName })
                ).community_view.community.id;
                const titleLink = item.title
                  ? item.link
                    ? `# [${item.title}](${item.link})\n`
                    : `# ${item.title}\n`
                  : "";
                await client.createPost({
                  community_id: communityId,
                  url: item.link,
                  name: title,
                  auth: token,
                  body: `${titleLink}${NodeHtmlMarkdown.translate(
                    item.content ?? item.contentSnippet ?? item.summary ?? "",
                    {},
                    undefined,
                    undefined
                  )}`,
                });
              })
            );
          }
        })
      );
      const lastTime =
        items.length > 0 ? items[items.length - 1]?.isoDate : undefined;
      lastFeedItemTimes[feed.feedUrl] = lastTime
        ? Date.parse(lastTime)
        : lastFeedItemTimes[feed.feedUrl] ?? startTime;
    });
    task.execute();
    const job = new SimpleIntervalJob({ minutes: 30 }, task, {});
    scheduler.addSimpleIntervalJob(job);
  });
});
