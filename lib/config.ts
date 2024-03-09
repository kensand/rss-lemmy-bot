import { Login } from "lemmy-js-client";
import { SimpleIntervalSchedule } from "toad-scheduler";
export interface Community {
  readonly instanceUrl: string;
  readonly communityName: string;
}
export interface Feed {
  readonly feedUrl: string;
  readonly linkPrefix?: string;
  readonly lemmyCommunities: Community[];
  readonly schedule?: SimpleIntervalSchedule;
  readonly nsfw?: boolean;
}
export interface Lemmy {
  readonly login: Login;
  readonly instanceUrl: string;
}

export interface Config {
  readonly lemmy: Lemmy;
  readonly feeds: Feed[];
  readonly defaultSchedule?: SimpleIntervalSchedule;
}
