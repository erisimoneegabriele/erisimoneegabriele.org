const Dettatura = (function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let inAscolto = false;
  let testoAccumulato = "";
  let timerSilenzio = null;

  function fermaEInvia(onRisultato, onStato, onFine) {
    if (!inAscolto) return;
    inAscolto = false;
    if (timerSilenzio) {
      clearTimeout(timerSilenzio);
      timerSilenzio = null;
    }
    if (rec) {
      try { rec.abort(); } catch (e) {}
    }
    const pulito = testoAccumulato.trim();
    if (pulito.length > 0) {
      onRisultato(pulito);
    } else {
      onStato("Nessuna parola rilevata");
    }
    onFine();
  }

  function avvia(onRisultato, onStato, onFine) {
    if (!SpeechRec) {
      onStato("Microfono non supportato");
      return;
    }

    if (inAscolto) {
      fermaEInvia(onRisultato, onStato, onFine);
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
        fermaEInvia(onRisultato, onStato, onFine);
      }, 4000);
    };

    rec.onerror = function(err) {
      if (err.error !== "aborted" && inAscolto) {
        onStato("Errore: " + err.error);
      }
    };

    rec.onend = function() {
      if (inAscolto) {
        fermaEInvia(onRisultato, onStato, onFine);
      }
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
