// Codegen is so broken :skull:

require("better-logging")(console);

import Bun, { spawn } from "bun";

const codegenTemplate = await Bun.file("./codegen-template.yml").text(); // relative to cwd

const processedCodegen = codegenTemplate.replace(
  /\${([^}]+)}/g,
  (match, key) => {
    const value = process.env[key];

    if (value === undefined) {
      console.warn(`[Codegen] Environment variable ${key} not found.`);

      return match;
    }

    return value;
  },
);

await Bun.write("./codegen.yml", processedCodegen);

console.log("[Codegen] Codegen configuration file generated at ../codegen.yml");

const proc = spawn(["bunx", "graphql-codegen"], {
  cwd: process.cwd(),
  stdout: "inherit",
  stderr: "inherit",
});
