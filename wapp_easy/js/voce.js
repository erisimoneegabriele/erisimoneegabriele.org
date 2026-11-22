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
      mediaRecorder.start(200);
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
  }
});

async function inviaAudio() {
  const rawType = mediaRecorder.mimeType || 'audio/webm';
  const cleanType = rawType.split(';').at(0);
  const est = cleanType.includes('mp4') ? 'm4a' : 'webm';
  const blob = new Blob(audioChunks, { type: cleanType });
  const urlAudio = URL.createObjectURL(blob);
  const file = new File([blob], "vocale." + est, { type: cleanType });

  elStato.textContent = "Registrato! Premi INVIA:";
  elBoxTesto.innerHTML =
    '<audio controls src="' + urlAudio + '" style="width:100%;margin-bottom:10px;"></audio>' +
    '<button id="btn-share-now" style="padding:16px;font-size:1.3rem;background:#ff9800;color:#000;border:none;border-radius:12px;font-weight:bold;width:100%;">📤 INVIA A WHATSAPP</button>';

  document.getElementById('btn-share-now').addEventListener('click', async () => {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        elStato.textContent = "Condiviso!";
      } catch (e) {
        if (e.name !== 'AbortError') elStato.textContent = "Err: " + e.message;
      }
    } else {
      const a = document.createElement('a');
      a.href = urlAudio;
      a.download = "vocale." + est;
      a.click();
      elStato.textContent = "Salvato! Allegalo su WhatsApp";
    }
  });
}
