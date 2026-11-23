const VoceTTS = (function() {
  let abilitato = false;

  function alterna(bottone) {
    abilitato = !abilitato;
    if (abilitato) {
      bottone.textContent = "🔊 Voce ON";
      bottone.classList.add("attivo");
      bottone.setAttribute("aria-pressed", "true");
      parla("Lettura vocale attivata");
    } else {
      bottone.textContent = "🔇 Voce OFF";
      bottone.classList.remove("attivo");
      bottone.setAttribute("aria-pressed", "false");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  function parla(testo) {
    if (!abilitato) return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const frase = new SpeechSynthesisUtterance(testo);
    frase.lang = "it-IT";
    frase.rate = 0.95;
    window.speechSynthesis.speak(frase);
  }

  return {
    alterna: alterna,
    parla: parla
  };
})();
