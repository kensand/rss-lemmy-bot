import { PostFormat } from "./config";

export const DEFAULT_FORMAT: PostFormat = {
  title: "{{{title}}}",
  body: "{{{summary}}}",
  url: "{{#linkPrefix}}{{{linkPrefix}}}{{/linkPrefix}}{{{link}}}",
};
