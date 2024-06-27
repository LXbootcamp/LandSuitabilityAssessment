const fs = require("fs");
const path = require("path");

const filesToUpdate = [
  path.join(__dirname, "dist", "index.html"),
  path.join(__dirname, "dist", "login.html"),
];

const findWord = 'defer="defer"'; // 바꾸려는 단어
const replaceWord = 'type="module"'; // 대체할 단어

filesToUpdate.forEach((filePath) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    const updatedData = data.replace(new RegExp(findWord, "g"), replaceWord);

    fs.writeFile(filePath, updatedData, "utf8", (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      } else {
        console.log(`Successfully updated ${filePath}`);
      }
    });
  });
});
