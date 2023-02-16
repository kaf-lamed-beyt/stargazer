import { createNodeMiddleware, createProbot } from "probot";

const app = require("../../../index");

module.exports = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});
