/* eslint 
@typescript-eslint/no-unsafe-assignment: 0, 
@typescript-eslint/no-unsafe-member-access: 0, 
@typescript-eslint/no-unsafe-call: 0, 
@typescript-eslint/restrict-template-expressions: 0, 
@typescript-eslint/no-unsafe-argument: 0, 
@typescript-eslint/no-unsafe-return: 0 */
import fs from "fs";

const listAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach((file) => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = listAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(`${dirPath}/${file}`);
    }
  });
  return arrayOfFiles;
};

const fetchExports = (name) => {
  console.log(`Fetching @${name}`);

  // Get all the files
  const files = listAllFiles(`./src/${name}`)
    .map((r) => r.replace(`./src/${name}`, ".").replace(`.ts`, ""))
    .filter((r) => !/index$/.test(r));
  // console.log(files);

  // Create the string to export
  let index = "";
  files.forEach((file, i) => {
    index += `${i != 0 ? "\n" : ""}export * from "${file}"`;
  });
  // console.log(index);

  // Write the index.ts for that folder
  console.log(`Writing to @${name}/index.ts`);
  fs.writeFileSync(`./src/${name}/index.ts`, index);
};

export const init = () => {
  fetchExports("modules");
};
