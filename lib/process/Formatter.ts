import Mustache from "mustache";
import { Feed, PostFormat } from "../config";
import { PostContext } from "./PostContext";
import { Post } from "./Post";

import { FeedItem } from "../read/FeedItem";
import { DEFAULT_FORMAT } from "../const";

export class Formatter {
  private readonly postFormat: PostFormat;

  constructor(private readonly feed: Feed) {
    this.postFormat = { ...DEFAULT_FORMAT, ...feed.format };
  }

  format(items: FeedItem[]): Post[] {
    return items.flatMap((item) => {
      const val = this.formatContext({
        ...item,
        nsfw: this.feed.nsfw ?? false,
        linkPrefix: this.feed.linkPrefix,
      });
      return val ? [val] : [];
    });
  }

  private formatContext(context: PostContext): Post | undefined {
    const title = this.postFormat.title
      ? Mustache.render(this.postFormat.title, context)
      : undefined;
    if (!title) {
      return undefined;
    }
    return {
      title: title,
      body: this.postFormat.body
        ? Mustache.render(this.postFormat.body, context)
        : undefined,
      url: this.postFormat.url
        ? Mustache.render(this.postFormat.url, context)
        : undefined,
    };
  }
}
