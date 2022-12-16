const fs = require("fs");
exports.default = function typeDefs({ orig, file }) {
  if (orig.split("")[0] === ".") return orig;
  const fileContents = fs.readFileSync(file, "utf8");
  //Add your custom logic for replacing text inside the file.
  if (/from "types\/defs"/g.test(fileContents)) {
    console.log("SHOULD CHANGE");
    console.log(`ORIG: ${orig}`);
    console.log(`FILE: ${file}`);
    const newContents = fileContents.replace(/from "types\/defs";/g, 'from "../types/defs.d.ts";');
    const output = fs.writeFileSync(file, newContents);
    console.log(`RESULT: ${output}`);
    return 'from "../types/defs.d.ts";';
  }

  return orig;
};
