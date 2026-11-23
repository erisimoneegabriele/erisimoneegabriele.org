document.addEventListener("DOMContentLoaded", function() {
  let indice = 0;
  const doppiaBarra = String.fromCharCode(47, 47);

  const boxScheda = document.querySelector(".scheda-contatto");
  const elNome = document.getElementById("nome-contatto");
  const elAvatar = document.getElementById("avatar-box");
  const elStato = document.getElementById("stato-azione");
  const btnTts = document.getElementById("btn-tts");
  const btnDetta = document.getElementById("btn-detta");

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
    if (leggi) {
      VoceTTS.parla(c.nome);
    }
  }

  function pulisciNumero(num) {
    return String(num).replace(/[^0-9]/g, "");
  }

  btnTts.addEventListener("click", function() {
    VoceTTS.alterna(btnTts);
  });

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
    setTimeout(function() {
      window.location.href = "tel:+" + num;
    }, 1200);
  });

  btnDetta.addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    btnDetta.classList.add("ascolto");
    btnDetta.textContent = "🔴 PARLA ORA...";
    boxScheda.classList.add("in-registrazione");

    Dettatura.avvia(
      function(testo) {
        elStato.textContent = "Invio: " + testo;
        const url = "https:" + doppiaBarra + "wa.me/" + num + "?text=" + encodeURIComponent(testo);
        window.location.href = url;
      },
      function(msg) {
        elStato.textContent = msg;
      },
      function() {
        btnDetta.classList.remove("ascolto");
        btnDetta.textContent = "🗣️ DETTA TESTO";
        boxScheda.classList.remove("in-registrazione");
      }
    );
  });

  aggiornaScheda(false);
});
