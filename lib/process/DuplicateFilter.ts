import { LRUCache } from "lru-cache";

import { FeedItem } from "../read/FeedItem";

export class DuplicateFilter {
  private duplicateCache = new LRUCache<string, boolean>({ max: 1000 });

  filter(items: FeedItem[]): FeedItem[] {
    const res = items.filter((it) => !this.duplicateCache.has(it.title));
    items.forEach((it) => {
      this.duplicateCache.set(it.title, true);
    });
    return res;
  }
}
