// copy-header.js
const fs = require('fs');
const path = require('path');

const HEADER_PATH = './includes/header.html';
const TARGETS = ['index.html', 'missione.html', 'volontari.html'];

fs.readFile(HEADER_PATH, 'utf8', (err, header) => {
  if (err) {
    console.error('Errore nel leggere il file header:', err);
    return;
  }

  const insertHeaderIntoHead = (content, newHeader) => {
    // Cerca il primo <head> ... </head>
    const headRegex = /(<head>[\s\S]*?<\/head>)/gi;
    let newContent = content;
    let headMatch;
    if ((headMatch = headRegex.exec(content)) !== null) {
      // Prende tutto prima e dopo il <head>
      const before = content.slice(0, headMatch.index);
      const after = content.slice(headMatch.index + headMatch[0].length);
      // Costruisci il nuovo <head> con il vecchio contenuto + il nuovo header
      const newHead = `<head>
        ${headMatch[1].replace(/<\/head>/gi, '')} <!-- Contenuto originale head -->
        ${newHeader}
      </head>`;
      newContent = before + newHead + after;
    } else {
      // Se non c'è <head>, lo aggiungi all'inizio (non consigliato ma sicuro)
      newContent = `<head>
        ${newHeader}
      </head>` + content;
    }
    return newContent;
  };

  TARGETS.forEach(target => {
    fs.readFile(target, 'utf8', (err, content) => {
      if (err) {
        console.error('Errore nel leggere', target, err);
        return;
      }
      const updatedContent = insertHeaderIntoHead(content, header);
      fs.writeFile(target, updatedContent, (err) => {
        if (err) console.error('Errore durante scrittura su', target, err);
        else console.log(`Aggiornato ${target}`);
      });
    });
  });
})