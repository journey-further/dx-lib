const fs = require("fs");
const path = require("path");
const TYPE_PATH = "dist/declarations/types/defs.d.ts";
const RESOLVED_TYPE_PATH = path.resolve(__dirname, TYPE_PATH);

exports.default = function typeDefs({ orig, file }) {
  if (orig.split("")[0] === ".") return orig;
  //Add your custom logic for replacing text inside the file.
  const fileContents = fs.readFileSync(file, "utf8");
  if (/from "types\/defs";/g.test(fileContents)) {
    const relativePath = path.relative(file, RESOLVED_TYPE_PATH);
    const newContents = fileContents.replace(/from "types\/defs";/g, `from "${relativePath}";`);
    fs.writeFileSync(file, newContents);
    return `from "${relativePath}"`;
  }

  return orig;
};
