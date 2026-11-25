const Dettatura = (function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let inAscolto = false;

  function avvia(onRisultato, onStato, onFine) {
    if (!SpeechRec) {
      onStato("Microfono non supportato");
      return;
    }

    if (inAscolto && rec) {
      rec.stop();
      return;
    }

    rec = new SpeechRec();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = function() {
      inAscolto = true;
      onStato("Parla ora...");
    };

    rec.onresult = function(evento) {
      let testo = "";
      const tot = evento.results.length;
      for (let i = 0; i < tot; i++) {
        const riga = evento.results.item(i);
        const alt = riga.item(0);
        testo += alt.transcript + " ";
      }
      const pulito = testo.trim();
      if (pulito.length > 0) {
        onRisultato(pulito);
      } else {
        onStato("Nessuna parola rilevata");
      }
    };

    rec.onerror = function(err) {
      onStato("Errore: " + err.error);
    };

    rec.onend = function() {
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
