import { createNodeMiddleware, createProbot } from "probot";
import { verifyAndReceive } from "@octokit/webhooks";

const app = require("../../../index");

module.exports = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",

  async onUnhandledRequest(req, res) {
    const { headers, method } = req;

    if (method !== "POST") {
      res.status(404).send("Not found");
      return;
    }

    const payload = await verifyAndReceive({
      secret: process.env.WEBHOOK_SECRET,
      headers,
      payload: req.body,
    });

    console.log(payload);
    res.status(200).send("OK");
  },
});
