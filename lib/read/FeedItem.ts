import Parser from "rss-parser";

export interface FeedItem extends Parser.Item {
  readonly timestamp: Date;
  readonly title: string;
}
