let contatti = typeof CONTATTI !== 'undefined' ? CONTATTI : [];
let indice = 0;

const elNome = document.getElementById('nome-contatto');
const elAvatar = document.getElementById('avatar');
const elStato = document.getElementById('stato-msg');
const elBoxTesto = document.getElementById('anteprima-testo');

function init() {
  if (contatti.length > 0) {
    contatti.sort((a, b) => a.nome.localeCompare(b.nome));
    aggiornaSchermo();
  } else {
    elNome.textContent = "Manca rubrica.js";
  }
}

function aggiornaSchermo() {
  const c = contatti[indice];
  elNome.textContent = c.nome;
  elAvatar.textContent = c.nome.charAt(0).toUpperCase();
  elAvatar.style.backgroundColor = c.colore;
  elStato.textContent = "Contatto " + (indice + 1) + " di " + contatti.length;
  elBoxTesto.textContent = "";
}

function apriWhatsApp(testo) {
  const numero = contatti[indice].telefono;
  let url = "https:" + String.fromCharCode(47, 47) + "wa.me/" + numero;
  if (testo) {
    url += "?text=" + encodeURIComponent(testo);
  }
  window.open(url, '_blank');
}

document.getElementById('btn-su').addEventListener('click', () => {
  indice = (indice - 1 + contatti.length) % contatti.length;
  aggiornaSchermo();
});

document.getElementById('btn-giu').addEventListener('click', () => {
  indice = (indice + 1) % contatti.length;
  aggiornaSchermo();
});

document.getElementById('btn-chat').addEventListener('click', () => {
  apriWhatsApp("");
});

init();
