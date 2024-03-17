import { LemmyHttp } from "lemmy-js-client";
import { Feed } from "./config";
import { DuplicateFilter } from "./process/DuplicateFilter";
import { Formatter } from "./process/Formatter";
import { Poster } from "./post/Poster";
import { Reader } from "./read/Reader";
import { AsyncTask } from "toad-scheduler";

export function mkFeedTask(startTime: Date, client: LemmyHttp, feed: Feed) {
  const duplicateFilter = new DuplicateFilter();
  const formatter = new Formatter(feed);
  const poster = new Poster(feed.nsfw ?? false, client);
  const reader = new Reader(startTime, feed);
  return new AsyncTask(feed.feedUrl, async () => {
    console.log(
      `Scanning feed ${feed.feedUrl}. Latest Item in feed is ${reader.getLastTimestamp()}.`,
    );
    const items = await reader.read();
    const filteredItems = duplicateFilter.filter(items);
    const posts = formatter.format(filteredItems);
    const postCount = await poster.postAllItems(feed.lemmyCommunities, posts);

    console.log(
      `Finished scanning ${feed.feedUrl}. Posted ${postCount} items. Latest item in feed is from ${reader.getLastTimestamp()}.`,
    );
  });
}
