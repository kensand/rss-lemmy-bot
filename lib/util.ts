import Parser from "rss-parser";
import { Community, Feed } from "./config";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { LemmyHttp } from "lemmy-js-client";
import { AsyncTask } from "toad-scheduler";
import { LRUCache } from "lru-cache";

export function processFeedResults(
  minTimestamp: Date,
  feedResults: Parser.Output<Record<string, never>>,
): (Parser.Item & {
  readonly timestamp: Date;
})[] {
  return feedResults.items
    .map((it) => {
      return {
        ...it,
        timestamp: it.isoDate
          ? new Date(it.isoDate)
          : it.pubDate
            ? new Date(it.pubDate)
            : minTimestamp,
      };
    })
    .sort((a, b) => {
      if (a.timestamp.getTime() < b.timestamp.getTime()) {
        return -1;
      } else if (a.timestamp.getTime() > b.timestamp.getTime()) {
        return 1;
      } else {
        return 0;
      }
    });
}

export async function postItem(
  client: LemmyHttp,
  c: Community,
  item: Parser.Item,
  urlPrefix: string | undefined,
  title: string,
  nsfw: boolean | undefined,
) {
  try {
    const communityId = (await client.getCommunity({ name: c.communityName }))
      .community_view.community.id;
    const link = item.link ? `${urlPrefix ?? ""}${item.link}` : undefined;
    const titleLink = item.title
      ? link
        ? `# [${item.title}](${link})\n`
        : `# ${item.title}\n`
      : "";

    if (title.length > 200) {
      title = title.slice(0, 197) + "...";
    }
    const postResponse = await client.createPost({
      community_id: communityId,
      url: link,
      name: title,
      nsfw: nsfw,
      body: `${titleLink}${NodeHtmlMarkdown.translate(
        item.content ?? item.contentSnippet ?? item.summary ?? "",
        {},
        undefined,
        undefined,
      )}`,
    });
    if (!postResponse.post_view.post.ap_id) {
      throw new Error(`Failed to post ${postResponse}`);
    }
    return;
  } catch (error) {
    console.log(`An error occurred during the post creation process.
      It is uncertain whether the post was successfully created. ${error}`);
  }
}

export function mkFeedTask(
  startTime: Date,
  client: LemmyHttp,
  feed: Feed,
  parser: Parser<Record<string, never>, Record<string, never>>,
) {
  let lastItemTime = startTime;
  const duplicateCache = new LRUCache<string, boolean>({ max: 1000 });

  return new AsyncTask(feed.feedUrl, async () => {
    console.log(
      `Scanning feed ${feed.feedUrl}. Latest Item in feed is ${lastItemTime}.`,
    );
    const feedResults = await parser.parseURL(feed.feedUrl);
    const items = processFeedResults(startTime, feedResults);
    const filteredItems = items.filter(
      (it) =>
        it.title &&
        !duplicateCache.has(it.title) &&
        (!it.link || !duplicateCache.has(it.link)),
    );
    items.forEach((it) => {
      it.title && duplicateCache.set(it.title, true);
      it.link && duplicateCache.set(it.link, true);
    });
    const postCount = (
      await Promise.all(
        filteredItems.map(async (item) => {
          const title = item.title;
          if (
            title &&
            item.timestamp &&
            item.timestamp.getTime() > lastItemTime.getTime()
          ) {
            console.log(
              `Posting item ${title} from ${feed.feedUrl} published at ${item.timestamp}`,
            );
            await Promise.all(
              feed.lemmyCommunities.map(async (community) => {
                await postItem(
                  client,
                  community,
                  item,
                  feed.linkPrefix,
                  title,
                  feed.nsfw,
                );
              }),
            );
            return true;
          } else {
            return false;
          }
        }),
      )
    ).reduce((acc, curr) => acc + (curr ? 1 : 0), 0);

    const newLastTime =
      items.length > 0 ? items[items.length - 1]?.timestamp : undefined;

    lastItemTime = new Date(
      Math.max(
        newLastTime?.getTime() ?? 0,
        lastItemTime.getTime(),
        startTime.getTime(),
      ),
    );

    console.log(
      `Finished scanning ${feed.feedUrl}. Posted ${postCount} items. Latest item in feed is from ${lastItemTime}.`,
    );
  });
}
