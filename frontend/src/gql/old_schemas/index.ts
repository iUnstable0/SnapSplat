// import * as z from "zod/v4";

// import fs from "node:fs";
// import path from "node:path";

// type Tree = {
//   [key: string]: Tree | string;
// };

// const schemasDir = "./src/gql/schemas";

// // console.log("THIS IS THE SCHEMA DIR:", schemasDir);

// const schemasParser = z.object({
//   query: z.object({
//     user: z.object({
//       getAuthenticatedInfo: z.string(),
//     }),
//     platform: z.object({
//       getInfo: z.string(),
//     }),
//   }),
//   mutation: z.object({
//     user: z.object({
//       login: z.string(),
//       register: z.string(),
//       refreshToken: z.string(),
//     }),
//   }),
// });

// function buildTree(dir: string): Tree {
//   const tree: Tree = {};
//   const files = fs.readdirSync(dir, { withFileTypes: true });

//   for (const file of files) {
//     const fullPath = path.join(dir, file.name);

//     if (file.isDirectory()) {
//       tree[file.name] = buildTree(fullPath);
//     } else if (file.isFile() && file.name.endsWith(".gql")) {
//       const fileContent = fs.readFileSync(fullPath, "utf-8").trim();
//       const baseName = file.name.replace(/\.gql$/, "");

//       tree[baseName] = fileContent;
//     }
//   }

//   return tree;
// }

// const schemas = buildTree(schemasDir);

// const result = schemasParser.safeParse(schemas);

// if (!result.success) {
//   console.error(
//     "[gql.schemas] Schema validation failed:",
//     result.error.issues.map((issue) => issue.message).join(". ")
//   );

//   throw new Error("Schema validation failed");
// }

// export default result.data;
