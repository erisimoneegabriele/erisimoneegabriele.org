document.addEventListener("DOMContentLoaded", function() {
  let indice = 0;
  let urlPronto = "";
  const sl = String.fromCharCode(47);
  const doppiaBarra = sl + sl;

  const boxScheda = document.querySelector(".scheda-contatto");
  const elNome = document.getElementById("nome-contatto");
  const elAvatar = document.getElementById("avatar-box");
  const elStato = document.getElementById("stato-azione");
  const btnTts = document.getElementById("btn-tts");
  const btnDetta = document.getElementById("btn-detta");

  function controllaBrowser() {
    const ua = navigator.userAgent || "";
    const isAndroid = ua.indexOf("Android") !== -1;
    const isWebView = ua.indexOf("wv") !== -1 || ua.indexOf("WhatsApp") !== -1 || ua.indexOf("GSA") !== -1;
    const isChrome = ua.indexOf("Chrome") !== -1 && !isWebView;
    if (isAndroid && !isChrome) {
      const link = "intent:" + doppiaBarra + location.host + location.pathname + "#Intent;scheme=https;package=com.android.chrome;end";
      document.body.innerHTML = "<div style='padding:24px;text-align:center'><h1 style='color:#ffd54f;margin-bottom:20px'>Apri con Google Chrome</h1><a href='" + link + "' style='display:block;padding:28px;background:#2e7d32;color:#fff;font-size:1.6rem;font-weight:bold;border-radius:16px;text-decoration:none'>🌐 APRI IN CHROME</a></div>";
      return false;
    }
    return true;
  }

  if (!controllaBrowser()) return;

  function prendiContatto(pos) {
    return Array.prototype.slice.call(CONTATTI, pos, pos + 1).pop();
  }

  function pulisciNumero(num) {
    let n = String(num).replace(/[^0-9]/g, "");
    if (n.length === 10 && n.charAt(0) === "3") {
      n = "39" + n;
    }
    return n;
  }

  function resetDetta() {
    urlPronto = "";
    btnDetta.style.backgroundColor = "";
    btnDetta.textContent = "🗣️ DETTA TESTO";
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

  window.addEventListener("pageshow", function() {
    if (!Dettatura.attiva() && urlPronto.length === 0) {
      aggiornaScheda(false);
    }
  });

  btnTts.addEventListener("click", function() { VoceTTS.alterna(btnTts); });

  document.getElementById("btn-su").addEventListener("click", function() {
    if (!CONTATTI || CONTATTI.length === 0) return;
    indice = (indice - 1 + CONTATTI.length) % CONTATTI.length;
    aggiornaScheda(true);
  });

  document.getElementById("btn-giu").addEventListener("click", function() {
    if (!CONTATTI || CONTATTI.length === 0) return;
    indice = (indice + 1) % CONTATTI.length;
    aggiornaScheda(true);
  });

  document.getElementById("btn-chiama").addEventListener("click", function() {
    if (!CONTATTI || CONTATTI.length === 0) return;
    const c = prendiContatto(indice);
    elStato.textContent = "Chiamata...";
    VoceTTS.parla("Chiamo " + c.nome);
    setTimeout(function() { window.location.href = "tel:+" + pulisciNumero(c.telefono); }, 1200);
  });

  btnDetta.addEventListener("click", function() {
    if (!CONTATTI || CONTATTI.length === 0) return;
    if (urlPronto.length > 0) {
      const destinazione = urlPronto;
      resetDetta();
      elStato.textContent = "Apro WhatsApp...";
      window.location.href = destinazione;
      return;
    }
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    if (!Dettatura.attiva()) {
      btnDetta.classList.add("ascolto");
      btnDetta.textContent = "🔴 PARLA... (TOCCA PER FINE)";
      boxScheda.classList.add("in-registrazione");
    }
    Dettatura.avvia(
      function(testo) {
        elStato.textContent = "Pronto: " + testo;
        urlPronto = "https:" + doppiaBarra + "wa.me" + sl + num + "?text=" + encodeURIComponent(testo);
        VoceTTS.parla("Premi il tasto verde per inviare");
      },
      function(msg) { elStato.textContent = msg; },
      function() {
        btnDetta.classList.remove("ascolto");
        boxScheda.classList.remove("in-registrazione");
        if (urlPronto.length > 0) {
          btnDetta.style.backgroundColor = "#2e7d32";
          btnDetta.textContent = "📨 INVIA SU WHATSAPP";
        } else {
          resetDetta();
        }
      }
    );
  });

  aggiornaScheda(false);
});
