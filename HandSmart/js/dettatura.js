const Dettatura = (function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let inAscolto = false;
  let testoConfermato = "";
  let testoBozza = "";
  let timerSilenzio = null;
  let cbRisultato = null;
  let cbStato = null;
  let cbFine = null;

  function chiudiDefinitivo() {
    if (!inAscolto) return;
    inAscolto = false;
    if (timerSilenzio) {
      clearTimeout(timerSilenzio);
      timerSilenzio = null;
    }
    if (rec) {
      rec.onend = null;
      rec.onresult = null;
      rec.onerror = null;
      try { rec.stop(); } catch (e) {}
      rec = null;
    }
    const pulito = (testoConfermato + " " + testoBozza).trim();
    if (pulito.length > 0 && cbRisultato) {
      cbRisultato(pulito);
    } else if (cbStato) {
      cbStato("Nessuna parola rilevata");
    }
    if (cbFine) cbFine();
  }

  function avvia(onRisultato, onStato, onFine) {
    if (!SpeechRec) {
      onStato("Microfono non supportato");
      onFine();
      return;
    }
    if (inAscolto) {
      chiudiDefinitivo();
      return;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    testoConfermato = "";
    testoBozza = "";
    cbRisultato = onRisultato;
    cbStato = onStato;
    cbFine = onFine;
    inAscolto = true;
    onStato("Parla con calma...");

    rec = new SpeechRec();
    rec.lang = "it-IT";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = function(evento) {
      if (!inAscolto) return;
      if (timerSilenzio) clearTimeout(timerSilenzio);
      let finale = "";
      let bozza = "";
      const tot = evento.results.length;
      for (let i = 0; i < tot; i++) {
        const riga = evento.results.item(i);
        const alt = riga.item(0).transcript;
        if (riga.isFinal) {
          finale += alt + " ";
        } else {
          bozza += alt + " ";
        }
      }
      testoConfermato = finale;
      testoBozza = bozza;
      const attuale = (testoConfermato + " " + testoBozza).trim();
      if (attuale.length > 0 && cbStato) {
        cbStato("Dettato: " + attuale);
      }
      timerSilenzio = setTimeout(chiudiDefinitivo, 4500);
    };

    rec.onerror = function(err) {
      if (err.error === "not-allowed" || err.error === "service-not-allowed") {
        if (cbStato) cbStato("Permesso microfono negato");
      }
      chiudiDefinitivo();
    };

    rec.onend = function() {
      if (inAscolto) chiudiDefinitivo();
    };

    timerSilenzio = setTimeout(chiudiDefinitivo, 9000);
    try {
      rec.start();
    } catch (e) {
      inAscolto = false;
      onStato("Riprova a toccare");
      onFine();
    }
  }

  function attiva() {
    return inAscolto;
  }

  return { avvia: avvia, attiva: attiva };
})();
