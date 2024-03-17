import { Feed } from "../config";
import Parser from "rss-parser";

import { FeedItem } from "./FeedItem";

export class Reader {
  constructor(
    private lastTimestamp: Date,
    private feed: Feed,
  ) {}

  getLastTimestamp(): Date {
    return this.lastTimestamp;
  }

  private parser = new Parser<Record<string, never>, Record<string, never>>();

  async read() {
    const feedResults = await this.parser.parseURL(this.feed.feedUrl);
    const items = this.processFeedResults(
      this.lastTimestamp,
      feedResults,
    ).filter((it) => it.timestamp.getTime() > this.lastTimestamp.getTime());

    this.lastTimestamp = new Date(
      Math.max(
        this.lastTimestamp.getTime(),
        ...items.map((it) => it.timestamp.getTime()),
      ),
    );

    return items;
  }

  private processFeedResults(
    minTimestamp: Date,
    feedResults: Parser.Output<Record<string, never>>,
  ): FeedItem[] {
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
      .flatMap((it) => (it.title ? [it as FeedItem] : []))
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
}
