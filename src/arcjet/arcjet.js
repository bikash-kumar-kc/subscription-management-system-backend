import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { config } from "../config/config.js";

const aj = arcjet({
  key: config.ARCJET_TOKEN,
  rules: [
    shield({ mode: "LIVE" }), // protect form sql injection

    // protect from bot
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),

    // apply rate limiting
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;
