let mediaRecorder = null;
let audioChunks = [];
let staRegistrando = false;
let recognition = null;
let staDettando = false;

const btnTesto = document.getElementById('btn-testo');
const btnRec = document.getElementById('btn-rec');

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRec) {
  recognition = new SpeechRec();
  recognition.lang = 'it-IT';
  recognition.interimResults = true;

  recognition.onresult = (e) => {
    let frase = "";
    for (let i = 0; i < e.results.length; i++) {
      frase += e.results[i][0].transcript;
    }
    elBoxTesto.textContent = frase;
  };

  recognition.onend = () => {
    staDettando = false;
    btnTesto.textContent = "🗣️ DETTA TESTO";
    btnTesto.classList.remove('tasto-attivo');
    const testoFinale = elBoxTesto.textContent.trim();
    if (testoFinale) {
      elStato.textContent = "Apro WhatsApp...";
      apriWhatsApp(testoFinale);
    } else {
      elStato.textContent = "Nessuna parola rilevata";
    }
  };
}

btnTesto.addEventListener('click', () => {
  if (!recognition) {
    elStato.textContent = "Dettatura non supportata";
    return;
  }
  if (!staDettando) {
    elBoxTesto.textContent = "";
    recognition.start();
    staDettando = true;
    btnTesto.textContent = "⏹ INVIA TESTO";
    btnTesto.classList.add('tasto-attivo');
    elStato.textContent = "Parla ora...";
  } else {
    recognition.stop();
  }
});

btnRec.addEventListener('click', async () => {
  if (!staRegistrando) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = inviaAudio;
    mediaRecorder.start();
    staRegistrando = true;
    btnRec.textContent = "⏹ STOP AUDIO";
    btnRec.classList.add('tasto-attivo');
    elStato.textContent = "Registro vocale...";
  } else {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    staRegistrando = false;
    btnRec.textContent = "🎤 AUDIO";
    btnRec.classList.remove('tasto-attivo');
  }
});

async function inviaAudio() {
  const blob = new Blob(audioChunks, { type: 'audio/mp4' });
  const file = new File([blob], "vocale.m4a", { type: "audio/mp4" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file] });
  } else {
    elStato.textContent = "Share audio attivo solo su mobile";
  }
}
