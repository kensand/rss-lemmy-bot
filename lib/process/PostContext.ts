export interface PostContext {
  readonly link?: string;
  readonly guid?: string;
  readonly title?: string;
  readonly pubDate?: string;
  readonly creator?: string;
  readonly summary?: string;
  readonly content?: string;
  readonly isoDate?: string;
  readonly categories?: string[];
  readonly contentSnippet?: string;
  readonly timestamp: Date;
  readonly nsfw: boolean;
  readonly linkPrefix?: string;
}
