let time = Date.now();

require("better-logging")(console);

import gql from "@/servers/gql";

import lib_logger from "@/modules/logger";

// @ts-ignore
process.send = process.send || function () {};

// (async () => {
console.info(`${lib_logger.formatPrefix("init")} Starting server...`);

await gql.start();

console.info(
  `${lib_logger.formatPrefix("init")} Server online! Took ${Date.now() - time}ms`,
);

process.send!("ready");
// })();

process.on("SIGINT", async () => {
  // const chalk = await import("chalk").then((module) => module.default);

  time = Date.now();

  console.info(`${lib_logger.formatPrefix("init")} Stopping server...`);

  await gql.stop();

  console.info(
    `${lib_logger.formatPrefix("init")} Ready to exit! Took ${Date.now() - time}ms`,
  );

  process.exit(0);
});
