const Dettatura = (function() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  let inAscolto = false;
  let testoTotale = "";
  let cbRisultato = null;
  let cbStato = null;
  let cbFine = null;

  function fineDefinitiva() {
    inAscolto = false;
    const pulito = testoTotale.trim();
    if (pulito.length > 0 && cbRisultato) {
      cbRisultato(pulito);
    } else if (cbStato) {
      cbStato("Nessuna parola rilevata");
    }
    if (cbFine) cbFine();
  }

  function avviaSessione() {
    rec = new SpeechRec();
    rec.lang = "it-IT";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = function(evento) {
      let testo = "";
      const tot = evento.results.length;
      for (let i = 0; i < tot; i++) {
        const riga = evento.results.item(i);
        const alt = riga.item(0);
        testo += alt.transcript + " ";
      }
      if (testo.trim().length > 0) {
        testoTotale += testo.trim() + " ";
        if (cbStato) cbStato("Dettato: " + testoTotale.trim());
      }
    };

    rec.onerror = function(err) {
      if (err.error === "not-allowed" || err.error === "service-not-allowed") {
        inAscolto = false;
        if (cbStato) cbStato("Permesso microfono negato");
        if (cbFine) cbFine();
      }
    };

    rec.onend = function() {
      if (inAscolto) {
        try { avviaSessione(); } catch (e) { fineDefinitiva(); }
      } else {
        fineDefinitiva();
      }
    };

    rec.start();
  }

  function avvia(onRisultato, onStato, onFine) {
    if (!SpeechRec) {
      onStato("Microfono non supportato");
      onFine();
      return;
    }

    if (inAscolto) {
      inAscolto = false;
      if (rec) {
        try { rec.stop(); } catch (e) { fineDefinitiva(); }
      }
      return;
    }

    testoTotale = "";
    cbRisultato = onRisultato;
    cbStato = onStato;
    cbFine = onFine;
    inAscolto = true;
    onStato("Parla ora...");

    try {
      avviaSessione();
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
