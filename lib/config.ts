import { Login } from "lemmy-js-client";
import { SimpleIntervalSchedule } from "toad-scheduler";
import fs from "fs";

export interface Community {
  readonly instanceUrl: string;
  readonly communityName: string;
}

export interface PostFormat {
  title?: string;
  url?: string;
  body?: string;
}

export interface Feed {
  readonly feedUrl: string;
  readonly linkPrefix?: string;
  readonly lemmyCommunities: Community[];
  readonly schedule?: SimpleIntervalSchedule;
  readonly nsfw?: boolean;
  readonly format: PostFormat;
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

export function parseConfig(): Config {
  const configPath = process.env["CONFIG_PATH"] ?? "./config.json";
  return JSON.parse(fs.readFileSync(configPath).toString());
}

export function parseStartTime(): Date {
  const startTimeEnv = process.env["START_TIME"];
  const startTime = startTimeEnv ? new Date(startTimeEnv) : new Date();
  if (startTimeEnv) {
    console.log("START_TIME found and translated to:", startTime.toString());
  } else {
    console.log(
      "START_TIME not set. Starting tracking at current date:",
      startTime.toString(),
    );
  }
  return startTime;
}
