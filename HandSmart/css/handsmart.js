document.addEventListener("DOMContentLoaded", function() {
  let indice = 0;
  const sl = String.fromCharCode(47);
  const doppiaBarra = sl + sl;
  const rxNonCifre = new RegExp("\\D", "g");

  const elNome = document.getElementById("nome-contatto");
  const elAvatar = document.getElementById("avatar-box");
  const elStato = document.getElementById("stato-azione");
  const btnTts = document.getElementById("btn-tts");

  function prendiContatto(pos) {
    return Array.prototype.slice.call(CONTATTI, pos, pos + 1).pop();
  }

  function aggiornaScheda(leggi) {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) {
      elNome.textContent = "Rubrica vuota";
      return;
    }
    const c = prendiContatto(indice);
    elNome.textContent = c.nome;
    elAvatar.textContent = c.emoji || "👤";
    elStato.textContent = "Pronto";
    if (leggi) VoceTTS.parla(c.nome);
  }

  function pulisciNumero(num) {
    let n = String(num).replace(rxNonCifre, "");
    if (n.length === 10 && n.charAt(0) === "3") n = "39" + n;
    return n;
  }

  btnTts.addEventListener("click", function() { VoceTTS.alterna(btnTts); });

  document.getElementById("btn-su").addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    indice = (indice - 1 + CONTATTI.length) % CONTATTI.length;
    aggiornaScheda(true);
  });

  document.getElementById("btn-giu").addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    indice = (indice + 1) % CONTATTI.length;
    aggiornaScheda(true);
  });

  document.getElementById("btn-chiama").addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    elStato.textContent = "Chiamata...";
    VoceTTS.parla("Chiamo " + c.nome);
    setTimeout(function() { window.location.href = "tel:+" + num; }, 1200);
  });

  document.getElementById("btn-vocale").addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    elStato.textContent = "Apro chat vocale...";
    VoceTTS.parla("Vocale a " + c.nome);
    setTimeout(function() {
      window.location.href = "https:" + doppiaBarra + "wa.me" + sl + num;
    }, 900);
  });

  aggiornaScheda(false);
});
