const fs = require("fs");
const path = require("path");

exports.default = function typeDefs({ orig, file }) {
  if (orig.split("")[0] === ".") return orig;
  //Add your custom logic for replacing text inside the file.
  const fileContents = fs.readFileSync(file, "utf8");
  if (/from "types\/defs";/g.test(fileContents)) {
    console.log("SHOULD CHANGE");
    console.log(`ORIG: ${orig}`);
    console.log(`FILE: ${file}`);
    const relativePath = path.relative(file, path.resolve(__dirname, "dist/declarations/types/defs.d.ts"));
    const newContents = fileContents.replace(/from "types\/defs";/g, `from "${relativePath}";`);
    const output = fs.writeFileSync(file, newContents);
    console.log(`RESULT: ${output}`);
    return 'from "../types/defs.d.ts"';
  }

  return orig;
};
