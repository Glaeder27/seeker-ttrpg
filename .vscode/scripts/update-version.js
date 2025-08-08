#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node update-version.js <file>");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

const baseRemoteURL = 'https://www.seekerttrpg.com'; // Cambia con il base URL corretto
// Calcola il percorso relativo del file locale rispetto alla root (qui assume cwd)
let relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
if (relativePath.startsWith('docs/')) {
  relativePath = relativePath.slice('docs/'.length);
}
relativePath = '/' + relativePath;

const versionRegex = /(?:\/\*|<!--)\s*v(\d+)\.(\d+)\s+([\d\-T:.Z+]+)\*?\s*(?:\*\/|-->)/i;

// Funzione per scaricare il contenuto remoto
function fetchRemoteFile(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        // console.error(`Failed to fetch remote file: ${url} - status: ${res.statusCode}`);
        return resolve(null);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      // console.error("Error fetching remote file:", err);
      resolve(null);
    });
  });
}

async function main() {
  const content = fs.readFileSync(filePath, 'utf8');
  const localMatch = content.match(versionRegex);
  if (!localMatch) {
    console.error("No version comment found in the local file.");
    process.exit(1);
  }

  let [fullMatch, localMajorStr, localMinorStr, localOldTimestamp] = localMatch;
  let localMajor = parseInt(localMajorStr, 10);
  let localMinor = parseInt(localMinorStr, 10);

  // Prendi la versione remota
  const remoteContent = await fetchRemoteFile(baseRemoteURL + relativePath);
  let remoteMajor = null;
  let remoteMinor = null;
  let remoteTimestamp = null;

  if (remoteContent) {
    const remoteMatch = remoteContent.match(versionRegex);
    if (remoteMatch) {
      [, remoteMajor, remoteMinor, remoteTimestamp] = remoteMatch;
      remoteMajor = parseInt(remoteMajor, 10);
      remoteMinor = parseInt(remoteMinor, 10);
    }
  }

  const newTimestamp = new Date().toISOString();

  let newMajor = localMajor;
  let newMinor = localMinor;

  console.log(`Local version: ${localMajor}.${localMinor}`);
  console.log(`Remote version: ${remoteMajor !== null ? remoteMajor : 'null'}.${remoteMinor !== null ? remoteMinor : 'null'}`);

  if (remoteMajor !== null && remoteMinor !== null) {
    if (localMajor === remoteMajor && localMinor === remoteMinor) {
      // Se versione locale = versione remota: incremento minor e aggiorno data
      newMinor = localMinor + 1;
      console.log('Versions match - incrementing minor and updating timestamp');
    } else if (
      localMajor > remoteMajor ||
      (localMajor === remoteMajor && localMinor > remoteMinor)
    ) {
      // Se versione locale > versione remota: aggiorno solo data
      console.log('Local version is newer than remote - updating timestamp only');
    } else {
      // Se versione locale < versione remota: warning, non modifico versione ma aggiorno data con WARNING!
      console.log('Remote version is newer - no update, WARNING added');
      let warningComment = '';
      if (fullMatch.startsWith('<!--')) {
        warningComment = `<!-- v${localMajor}.${localMinor} ${newTimestamp} WARNING! -->`;
      } else {
        warningComment = `/*v${localMajor}.${localMinor} ${newTimestamp} WARNING!*/`;
      }
      const updatedContent = content.replace(versionRegex, warningComment);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${path.basename(filePath)} to version v${localMajor}.${localMinor} (${newTimestamp}) with WARNING!`);
      process.exit(0);
    }
  } else {
    // Se versione remota non trovata, aggiorno solo data
    console.log('Remote version not found - updating timestamp only');
  }

  const newVersion = `${newMajor}.${newMinor}`;

  // Mantieni tipo di commento originale
  let newComment = '';
  if (fullMatch.startsWith('<!--')) {
    newComment = `<!-- v${newVersion} ${newTimestamp} -->`;
  } else {
    newComment = `/*v${newVersion} ${newTimestamp}*/`;
  }

  const updatedContent = content.replace(versionRegex, newComment);
  fs.writeFileSync(filePath, updatedContent, 'utf8');

  console.log(`Updated ${path.basename(filePath)} to version v${newVersion} (${newTimestamp})`);
}

main();
