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
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (e) => {
    let frase = "";
    for (let i = 0; i < e.results.length; i++) {
      frase += e.results[i].transcript;
    }
    elBoxTesto.textContent = frase;
  };

  recognition.onerror = (e) => {
    elStato.textContent = "Errore dettatura: " + e.error;
  };

  recognition.onend = () => {
    staDettando = false;
    btnTesto.textContent = "🗣️ DETTA TESTO";
    btnTesto.classList.remove('tasto-attivo');
    const testoFinale = elBoxTesto.textContent.trim();
    if (testoFinale) {
      elStato.textContent = "Apro WhatsApp...";
      apriWhatsApp(testoFinale);
    }
  };
}

btnTesto.addEventListener('click', () => {
  if (staRegistrando) return;
  if (!recognition) {
    elStato.textContent = "Dettatura non supportata qui";
    return;
  }
  if (!staDettando) {
    elBoxTesto.textContent = "";
    try {
      recognition.start();
      staDettando = true;
      btnTesto.textContent = "⏹ INVIA TESTO";
      btnTesto.classList.add('tasto-attivo');
      elStato.textContent = "Parla ora...";
    } catch (e) {
      elStato.textContent = "Riprova tra un attimo";
    }
  } else {
    recognition.stop();
  }
});

btnRec.addEventListener('click', async () => {
  if (staDettando) return;
  if (!staRegistrando) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = inviaAudio;
      mediaRecorder.start();
      staRegistrando = true;
      btnRec.textContent = "⏹ STOP AUDIO";
      btnRec.classList.add('tasto-attivo');
      elStato.textContent = "Sto registrando audio...";
    } catch (err) {
      elStato.textContent = "Errore mic: " + err.name;
    }
  } else {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    staRegistrando = false;
    btnRec.textContent = "🎤 AUDIO";
    btnRec.classList.remove('tasto-attivo');
    elStato.textContent = "Preparo invio...";
  }
});

async function inviaAudio() {
  const mimeType = mediaRecorder.mimeType || 'audio/webm';
  const estensione = mimeType.includes('mp4') ? 'm4a' : 'ogg';
  const blob = new Blob(audioChunks, { type: mimeType });
  const urlAudio = URL.createObjectURL(blob);
  const file = new File([blob], "vocale." + estensione, { type: mimeType });
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      elStato.textContent = "Audio condiviso!";
    } catch (e) {
      elStato.textContent = "Condivisione annullata";
    }
  } else {
    elStato.textContent = "Registrato! Riascolta qui sotto:";
    elBoxTesto.innerHTML = '<audio controls autoplay src="' + urlAudio + '"></audio>';
  }
}

