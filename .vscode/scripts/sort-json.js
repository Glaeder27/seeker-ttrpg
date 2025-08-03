const fs = require('fs');

// Carica il file JSON originale
const data = JSON.parse(fs.readFileSync('original.json', 'utf8'));

// Ordina le chiavi (funziona solo se è un oggetto)
const sorted = Object.fromEntries(
  Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
);

// Salva il risultato in un nuovo file (o sovrascrive)
fs.writeFileSync('sorted.json', JSON.stringify(sorted, null, 2), 'utf8');

console.log('JSON ordinato con successo!');