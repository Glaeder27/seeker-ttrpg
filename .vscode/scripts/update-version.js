#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node update-version.js <file>");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const versionRegex = /(?:\/\*|<!--)\s*v(\d+)\.(\d+)\s+([\d\-T:.Z+]+)\*?\s*(?:\*\/|-->)/i;

const match = content.match(versionRegex);
if (!match) {
  console.error("No version comment found in the file.");
  process.exit(1);
}

let [fullMatch, majorStr, minorStr, oldTimestamp] = match;

let major = parseInt(majorStr, 10);
let minor = parseInt(minorStr, 10);

minor++;  // incrementa minor di 1

const newVersion = `${major}.${minor}`;
const newTimestamp = new Date().toISOString();

let newComment = '';

// Mantieni tipo di commento originale
if (fullMatch.startsWith('<!--')) {
  newComment = `<!-- v${newVersion} ${newTimestamp} -->`;
} else {
  newComment = `/*v${newVersion} ${newTimestamp}*/`;
}

const updatedContent = content.replace(versionRegex, newComment);

fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log(`Updated ${path.basename(filePath)} to version v${newVersion} (${newTimestamp})`);