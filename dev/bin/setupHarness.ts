import { LemmyHttp } from "lemmy-js-client";
import DEFAULT_CONFIG from "../config.json";
import { Config } from "../../lib/config";
import fs from "fs";

(async () => {
  const configPath = process.env["CONFIG_PATH"];
  const config: Config = configPath
    ? JSON.parse(fs.readFileSync(configPath).toString())
    : DEFAULT_CONFIG;
  const client = new LemmyHttp(config.lemmy.instanceUrl);

  const token = (await client.login(config.lemmy.login)).jwt;

  client.setHeaders({
    Authorization: `Bearer ${token}`,
  });

  await Promise.all(
    config.feeds.flatMap((feed) => {
      feed.lemmyCommunities.map(async (community) => {
        try {
          await client.createCommunity({
            title: community.communityName,
            name: community.communityName,
          });
          console.log(`Created community ${community.communityName}`);
        } catch (e) {
          console.log(
            `Failed to create community ${community.communityName}: ${e}`
          );
        }
      });
    })
  );
})();
