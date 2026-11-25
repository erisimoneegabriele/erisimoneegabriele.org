document.addEventListener("DOMContentLoaded", function() {
  let indice = 0;
  const sl = String.fromCharCode(47);
  const doppiaBarra = sl + sl;

  const boxScheda = document.querySelector(".scheda-contatto");
  const elNome = document.getElementById("nome-contatto");
  const elAvatar = document.getElementById("avatar-box");
  const elStato = document.getElementById("stato-azione");
  const btnTts = document.getElementById("btn-tts");
  const btnDetta = document.getElementById("btn-detta");

  const linkWa = document.createElement("a");
  linkWa.id = "link-wa";
  linkWa.target = "_blank";
  linkWa.rel = "noopener";
  linkWa.style.cssText = "display:none;margin-top:12px;padding:24px;background:#16a34a;color:#fff;font-size:1.5rem;font-weight:bold;border-radius:16px;text-align:center;text-decoration:none";
  linkWa.textContent = "📨 INVIA SU WHATSAPP";
  btnDetta.parentNode.appendChild(linkWa);

  linkWa.addEventListener("click", function() {
    setTimeout(function() {
      linkWa.style.display = "none";
      elStato.textContent = "Pronto";
    }, 800);
  });

  function controllaBrowser() {
    const ua = navigator.userAgent || "";
    const isAndroid = ua.indexOf("Android") !== -1;
    const isWebView = ua.indexOf("wv") !== -1 || ua.indexOf("WhatsApp") !== -1 || ua.indexOf("GSA") !== -1;
    const isChrome = ua.indexOf("Chrome") !== -1 && !isWebView;
    if (isAndroid && !isChrome) {
      const link = "intent:" + doppiaBarra + location.host + location.pathname + "#Intent;scheme=https;package=com.android.chrome;end";
      document.body.innerHTML = "<div style='padding:24px;text-align:center'><h1 style='color:#ffd60a;margin-bottom:20px'>Apri con Google Chrome</h1><a href='" + link + "' style='display:block;padding:28px;background:#16a34a;color:#fff;font-size:1.6rem;font-weight:bold;border-radius:16px;text-decoration:none'>🌐 APRI IN CHROME</a></div>";
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

  function aggiornaScheda(leggi) {
    linkWa.style.display = "none";
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
    linkWa.style.display = "none";
    const c = prendiContatto(indice);
    const num = pulisciNumero(c.telefono);
    btnDetta.classList.add("ascolto");
    btnDetta.textContent = "🔴 PARLA ORA...";
    boxScheda.classList.add("in-registrazione");
    Dettatura.avvia(
      function(testo) {
        elStato.textContent = "Pronto: " + testo;
        const u = new URL("https:" + doppiaBarra + "://whatsapp.com" + sl + "send");
        u.searchParams.set("phone", num);
        u.searchParams.set("text", testo);
        linkWa.href = u.toString();
        linkWa.style.display = "block";
        VoceTTS.parla("Premi il tasto verde per inviare");
      },
      function(msg) { elStato.textContent = msg; },
      function() {
        btnDetta.classList.remove("ascolto");
        btnDetta.textContent = "🗣️ DETTA TESTO";
        boxScheda.classList.remove("in-registrazione");
      }
    );
  });

  aggiornaScheda(false);
});
