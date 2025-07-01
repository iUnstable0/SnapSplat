require("better-logging")(console);

// import Bun from "bun";
import clipboardy from "clipboardy";

const { Select, Input, Confirm } = require("enquirer");

const selectionPrompt = new Select({
  name: "selected-command",
  message: "Select a command to run",
  choices: [
    "prisma db seed",
    "prisma db push",
    "prisma db push && prisma db seed",
    "prisma db push --force-reset",
    "prisma db push --force-reset && prisma db seed",
    "prisma migrate dev --create-only --name <migration_name>",
    "prisma migrate dev",
    "prisma migrate reset",
  ],
});

const selectionPromptResult = await selectionPrompt.run();

let commandToRun = selectionPromptResult;

const prefix = "doppler run -- bunx";

if (selectionPromptResult.includes("<migration_name>")) {
  const namePrompt = new Input({
    name: "migration_name",
    message: "Enter the migration name",
    validate: (value: any) => {
      if (!value.trim()) {
        return "Migration name cannot be empty";
      }
      if (value.includes(" ")) {
        return "Migration name cannot contain spaces";
      }
      return true;
    },
  });

  const namePromptResult = await namePrompt.run();

  commandToRun = selectionPromptResult.replaceAll(
    "<migration_name>",
    namePromptResult
  );
}

const finalCommand = `${prefix} ${commandToRun.replaceAll("&&", `&& ${prefix}`)}`;

clipboardy.writeSync(finalCommand);

console.log(`Command copied to clipboard: ${finalCommand}`);

// Prisma requires interactive terminal, and pbcopy doesnt work + i want cross platform so using clipboardy instead ;P

//
// const confirmPrompt = new Confirm({
//   name: "confirm",
//   message: `Run command: ${finalCommand}?`,
// });
//
// const confirmPromptResult = await confirmPrompt.run();
//
// if (!confirmPromptResult) {
//   console.error("Command execution cancelled.");
//   process.exit(0);
// } else {
//   console.log(`Running command: ${finalCommand}`);
//
//   const proc = Bun.spawn(finalCommand.split(" "), {
//     cwd: process.cwd(),
//   });
//
//   const text = await new Response(proc.stdout).text();
//   console.log(text);
// }
