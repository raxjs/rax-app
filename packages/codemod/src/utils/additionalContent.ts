import * as fs from 'fs-extra';

export default function (filePath, addContent, templatePath) {
  if (fs.existsSync(filePath)) {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    if (!fileContent.includes(addContent)) {
      fileContent += `\n${addContent}\n`;
      fs.writeFileSync(filePath, fileContent);
    }
  } else {
    const fileContent = fs.readFileSync(templatePath);
    fs.writeFileSync(filePath, fileContent);
  }
  console.log(`${filePath} was successfully processed.`);
}
