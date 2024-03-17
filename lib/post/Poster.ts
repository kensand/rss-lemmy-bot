import { LemmyHttp } from "lemmy-js-client";
import { Community } from "../config";
import { Post } from "../process/Post";

export class Poster {
  constructor(
    private nsfw: boolean,
    private client: LemmyHttp,
  ) {}

  async postAllItems(c: Community[], items: Post[]) {
    return (
      await Promise.all(
        items.flatMap((post) =>
          c.map(
            async (communityId) =>
              await this.postItem(communityId, post).then(
                () => {
                  return 1;
                },
                (e) => {
                  console.error(
                    `Failed to post ${post} to ${communityId}: `,
                    e,
                  );
                  return 0;
                },
              ),
          ),
        ),
      )
    ).reduce((acc, it) => acc + it, 0);
  }

  private async postItem(c: Community, item: Post) {
    try {
      const communityId = (
        await this.client.getCommunity({ name: c.communityName })
      ).community_view.community.id;

      const postResponse = await this.client.createPost({
        community_id: communityId,
        url: item.url,
        name: item.title,
        nsfw: this.nsfw,
        body: item.body,
      });
      if (!postResponse.post_view.post.ap_id) {
        throw new Error(`Failed to post ${postResponse}`);
      }
      return;
    } catch (error) {
      console.log(`An error occurred during the post creation process.
      It is uncertain whether the post was successfully created. ${error}`);
    }
  }
}
