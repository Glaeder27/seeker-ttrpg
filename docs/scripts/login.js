// *** MOLTO IMPORTANTE: Sostituisci questo oggetto con la TUA configurazione Firebase effettiva! ***
// La trovi nella console Firebase: Project settings (icona ingranaggio) -> "Your apps"
// Seleziona la tua app web (o aggiungine una) e copia il "Firebase SDK snippet" (Config)
const firebaseConfig = {
  apiKey: "AIzaSyDY6xDCady9D1j7k27vApWCkbv0O1ST6yA",
  authDomain: "seeker-ttrpg.firebaseapp.com",
  projectId: "seeker-ttrpg",
  storageBucket: "seeker-ttrpg.firebasestorage.app",
  messagingSenderId: "762210490643",
  appId: "1:762210490643:web:a2b3893b9e4cfbdc8862e6",
  measurementId: "G-F3HS8JCNLT"
};

// Inizializza Firebase nella tua app
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Ottieni una referenza al servizio di autenticazione
const auth = firebase.auth();

// Ottieni le referenze agli elementi HTML
const registrationForm = document.getElementById('registrationForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message');

// Aggiungi un listener per l'invio del modulo
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previeni il comportamento predefinito di invio del modulo

    const email = emailInput.value;
    const password = passwordInput.value;

    // Pulisci i messaggi precedenti
    messageDisplay.textContent = '';
    messageDisplay.className = 'message';

    try {
        // Crea un nuovo utente con email e password usando Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("Utente registrato con successo:", user);
        messageDisplay.textContent = `Registrazione avvenuta con successo per: ${user.email}!`;
        messageDisplay.classList.add('success');
        // A questo punto l'utente è registrato e loggato.
        // Potresti reindirizzarlo a una pagina di benvenuto o al profilo utente.
        // Esempio: window.location.href = "/profilo-utente.html";

    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        let errorMessage = "Errore durante la registrazione. Riprova.";
        // Gestisci errori specifici di Firebase Authentication
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Questa email è già in uso. Prova ad accedere o usa un\'altra email.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'L\'indirizzo email non è valido.';
                break;
            case 'auth/weak-password':
                errorMessage = 'La password è troppo debole. Deve essere di almeno 6 caratteri.';
                break;
            default:
                errorMessage = `Errore sconosciuto: ${error.message}`;
                break;
        }
        messageDisplay.textContent = errorMessage;
        messageDisplay.classList.add('error');
    }
});
