let time = Date.now();

require("better-logging")(console);

import gql from "@/servers/gql";
import rest from "@/servers/rest";

import lib_logger from "@/modules/logger";

// @ts-ignore
process.send = process.send || function () {};

// (async () => {
console.log(`${lib_logger.formatPrefix("init")} Starting server...`);

await gql.start();

await rest.start();

console.log(
  `${lib_logger.formatPrefix("init")} Server online! Took ${Date.now() - time}ms`
);

process.send!("ready");
// })();

process.on("SIGINT", async () => {
  // const chalk = await import("chalk").then((module) => module.default);

  time = Date.now();

  console.log(`${lib_logger.formatPrefix("init")} Stopping server...`);

  await gql.stop();

  console.log(
    `${lib_logger.formatPrefix("init")} Ready to exit! Took ${Date.now() - time}ms`
  );

  process.exit(0);
});
