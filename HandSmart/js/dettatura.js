const Dettatura = (function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let inAscolto = false;
  let testoAccumulato = "";
  let timerSilenzio = null;

  function fermaEInvia(onRisultato, onStato) {
    if (timerSilenzio) {
      clearTimeout(timerSilenzio);
      timerSilenzio = null;
    }
    inAscolto = false;
    if (rec) {
      try { rec.stop(); } catch (e) {}
    }
    const pulito = testoAccumulato.trim();
    if (pulito.length > 0) {
      onRisultato(pulito);
    } else {
      onStato("Nessuna parola rilevata");
    }
  }

  function avvia(onRisultato, onStato, onFine) {
    if (!SpeechRec) {
      onStato("Microfono non supportato");
      return;
    }

    if (inAscolto && rec) {
      fermaEInvia(onRisultato, onStato);
      return;
    }

    testoAccumulato = "";
    rec = new SpeechRec();
    rec.lang = "it-IT";
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = function() {
      inAscolto = true;
      onStato("Parla con calma...");
    };

    rec.onresult = function(evento) {
      if (timerSilenzio) clearTimeout(timerSilenzio);
      let frase = "";
      const tot = evento.results.length;
      for (let i = evento.resultIndex; i < tot; i++) {
        const riga = evento.results.item(i);
        if (riga.isFinal) {
          frase += riga.item(0).transcript + " ";
        }
      }
      testoAccumulato += frase;
      if (testoAccumulato.trim().length > 0) {
        onStato("Dettato: " + testoAccumulato.trim());
      }
      timerSilenzio = setTimeout(function() {
        if (inAscolto) fermaEInvia(onRisultato, onStato);
      }, 4000);
    };

    rec.onerror = function(err) {
      if (err.error !== "aborted") {
        onStato("Errore: " + err.error);
      }
    };

    rec.onend = function() {
      if (timerSilenzio) clearTimeout(timerSilenzio);
      inAscolto = false;
      onFine();
    };

    try {
      rec.start();
    } catch (e) {
      inAscolto = false;
      onStato("Riprova a toccare");
    }
  }

  return { avvia: avvia };
})();
