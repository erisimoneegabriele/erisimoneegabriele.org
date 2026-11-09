// MENU A tendina 

const menuBtn = document.getElementById('menuBtn');
const siteMenu = document.getElementById('siteNavMenu');
let isOpen = false;

// Su desktop il menu è visibile, su mobile è nascosto
if (window.innerWidth > 768) {
  siteMenu.style.display = 'none';
} else {
  siteMenu.style.display = 'none';
}

menuBtn.addEventListener('click', function() {
  isOpen = !isOpen;

  // Su desktop: togglio la classe active e mostro/nascondi menu con CSS
  if (window.innerWidth > 768) {
    menuBtn.classList.toggle('active', isOpen);
    siteMenu.classList.toggle('active', isOpen);
	 siteMenu.style.display = isOpen ? 'flex' : 'none';
  } else {
    // Su mobile: toggle visibilità menu e aggiungo la classe active al bottone
    siteMenu.style.display = isOpen ? 'block' : 'none';
    menuBtn.classList.toggle('active', isOpen);
  }

  // Chiudo il menu se clicco fuori su mobile
  if (window.innerWidth <= 768) {
    document.addEventListener('click', function(e) {
      if (!menuBtn.contains(e.target) && !siteMenu.contains(e.target) && isOpen) {
        isOpen = false;
        siteMenu.style.display = 'none';
        menuBtn.classList.remove('active');
      }
    });
  }
});

// Attiva lo stato attivo nelle voci quando cambia l'URL (hash)
window.addEventListener('hashchange', function() {
  const current = location.hash.substring(1) || '';
  const links = siteMenu.querySelectorAll('a');
  links.forEach(link => {
    link.classList.toggle('active', link.hash === current);
  });
});

// Al caricamento iniziale, attiva la voce corrente
window.addEventListener('DOMContentLoaded', function() {
  const current = location.hash.substring(1) || '';
  const links = siteMenu.querySelectorAll('a');
  links.forEach(link => {
    link.classList.toggle('active', link.hash === current);
  });
});

// Opzionale: chiude il menu quando si ridimensiona lo schermo (passaggio desktop<->mobile)
window.addEventListener('resize', function() {
  if (siteMenu.style.display === 'block') {
    siteMenu.style.display = 'none';
    menuBtn.classList.remove('active');
    isOpen = false;
  }
  // Aggiorna lo stato visuale in base alla larghezza
  if (window.innerWidth > 768) {
    siteMenu.style.display = 'block';
  } else {
    siteMenu.style.display = 'none';
  }
});
