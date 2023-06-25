import Parser from "rss-parser";
import { Community, Feed } from "./config";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { LemmyHttp } from "lemmy-js-client";
import { AsyncTask } from "toad-scheduler";

export function processFeedResults(
  minTimestamp: Date,
  feedResults: Parser.Output<Record<string, never>>
): (Parser.Item & {
  epochMillisTimestamp: number;
})[] {
  return feedResults.items
    .map((it) => {
      return {
        ...it,
        epochMillisTimestamp: it.isoDate
          ? Date.parse(it.isoDate)
          : it.pubDate
          ? Date.parse(it.pubDate)
          : minTimestamp.getTime(),
      };
    })
    .sort((a, b) => {
      if (a.epochMillisTimestamp < b.epochMillisTimestamp) {
        return -1;
      } else if (a.epochMillisTimestamp > b.epochMillisTimestamp) {
        return 1;
      } else {
        return 0;
      }
    });
}

export async function postItem(
  client: LemmyHttp,
  c: Community,
  item: Parser.Item & {
    epochMillisTimestamp: number;
  },
  title: string,
  token: string
) {
  const communityId = (await client.getCommunity({ name: c.communityName }))
    .community_view.community.id;
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
}

export function mkFeedTask(
  startTime: Date,
  client: LemmyHttp,
  feed: Feed,
  parser: Parser<Record<string, never>, Record<string, never>>,
  lastFeedItemTimes: Record<string, number>,
  authToken: string
) {
  return new AsyncTask(feed.feedUrl, async () => {
    console.log(`Scanning feed ${feed.feedUrl}`);
    const feedResults = await parser.parseURL(feed.feedUrl);
    const items = processFeedResults(startTime, feedResults);
    await Promise.all(
      items.map(async (item) => {
        const itemDate = item.isoDate ? Date.parse(item.isoDate) : undefined;
        const lastTime = lastFeedItemTimes[feed.feedUrl];
        const title = item.title;
        if (title && itemDate && lastTime && itemDate > lastTime) {
          console.log(`Posting item ${title} from ${feed.feedUrl}`);
          await Promise.all(
            feed.lemmyCommunities.map(async (community) => {
              await postItem(client, community, item, title, authToken);
            })
          );
        }
      })
    );

    const lastTime =
      items.length > 0 ? items[items.length - 1]?.isoDate : undefined;
    lastFeedItemTimes[feed.feedUrl] = lastTime
      ? Date.parse(lastTime)
      : lastFeedItemTimes[feed.feedUrl] ?? startTime.getTime();
  });
}
