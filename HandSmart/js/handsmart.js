document.addEventListener("DOMContentLoaded", function() {
  let indice = 0;
  let urlPronto = "";
  const sl = String.fromCharCode(47);
  const doppiaBarra = sl + sl;
  const rxNonCifre = new RegExp("\\D", "g");

  const boxScheda = document.querySelector(".scheda-contatto");
  const elNome = document.getElementById("nome-contatto");
  const elAvatar = document.getElementById("avatar-box");
  const elStato = document.getElementById("stato-azione");
  const btnTts = document.getElementById("btn-tts");
  const btnDetta = document.getElementById("btn-detta");
  const btnVocale = document.getElementById("btn-vocale");

  function prendiContatto(pos) {
    return Array.prototype.slice.call(CONTATTI, pos, pos + 1).pop();
  }

  function resetDetta() {
    urlPronto = "";
    btnDetta.style.backgroundColor = "";
    btnDetta.textContent = "💬 TESTO WHATSAPP";
  }

  function aggiornaScheda(leggi) {
    resetDetta();
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

  btnVocale.addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    elStato.textContent = "Apro chat vocale...";
    VoceTTS.parla("Vocale a " + c.nome);
    setTimeout(function() {
      window.location.href = "https:" + doppiaBarra + "wa.me" + sl + num;
    }, 900);
  });

  btnDetta.addEventListener("click", function() {
    if (typeof CONTATTI === "undefined" || CONTATTI.length === 0) return;
    if (urlPronto.length > 0) {
      const dest = urlPronto;
      resetDetta();
      elStato.textContent = "Apro WhatsApp...";
      window.location.href = dest;
      return;
    }
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    btnDetta.classList.add("ascolto");
    btnDetta.textContent = "🔴 PARLA ORA...";
    boxScheda.classList.add("in-registrazione");
    Dettatura.avvia(
      function(testo) {
        elStato.textContent = "Pronto: " + testo;
        urlPronto = "https:" + doppiaBarra + "wa.me" + sl + num + "?text=" + encodeURIComponent(testo);
      },
      function(msg) { elStato.textContent = msg; },
      function() {
        btnDetta.classList.remove("ascolto");
        boxScheda.classList.remove("in-registrazione");
        if (urlPronto.length > 0) {
          btnDetta.style.backgroundColor = "#2e7d32";
          btnDetta.textContent = "📨 INVIA SU WHATSAPP";
        } else { resetDetta(); }
      }
    );
  });

  aggiornaScheda(false);
});
