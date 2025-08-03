// update-version.js
const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.error("Nessun file specificato");
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, "utf8");
const versionRegex = /\/\*v(\d+)\.(\d+)\s.*?\*\//;
const match = fileContent.match(versionRegex);

if (!match) {
  console.warn("Nessuna intestazione di versione trovata in", filePath);
  process.exit(0);
}

let [major, minor] = [parseInt(match[1]), parseInt(match[2])];
minor += 1;

const newTimestamp = new Date().toISOString();
const newHeader = `/*v${major}.${minor} ${newTimestamp}*/`;

const updatedContent = fileContent.replace(versionRegex, newHeader);
fs.writeFileSync(filePath, updatedContent, "utf8");

console.log(`Aggiornato ${filePath} → v${major}.${minor}`);
