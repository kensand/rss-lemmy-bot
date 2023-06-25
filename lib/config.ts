import { Login } from "lemmy-js-client";
export interface Community {
  readonly instanceUrl: string;
  readonly communityName: string;
}
export interface Feed {
  readonly feedUrl: string;
  readonly lemmyCommunities: Community[];
}
export interface Lemmy {
  readonly login: Login;
  readonly instanceUrl: string;
}

export interface Config {
  readonly lemmy: Lemmy;
  readonly feeds: Feed[];
}
