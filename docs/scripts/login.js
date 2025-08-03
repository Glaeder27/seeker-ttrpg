/*v1.1 2025-08-03T14:35:49.681Z*/

const firebaseConfig = {
  apiKey: "AIzaSyCZu-da02W-5Q4gd5N7mhwx_UReEu8QSfE",
  authDomain: "seeker-ttrpg.firebaseapp.com",
  projectId: "seeker-ttrpg",
  storageBucket: "seeker-ttrpg.firebasestorage.app",
  messagingSenderId: "762210490643",
  appId: "1:762210490643:web:a2b3893b9e4cfbdc8862e6",
  measurementId: "G-F3HS8JCNLT"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const registrationForm = document.getElementById('registrationForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message');

registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    messageDisplay.textContent = '';
    messageDisplay.className = 'message';

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("Utente registrato con successo:", user);
        messageDisplay.textContent = `Registrazione avvenuta con successo per: ${user.email}!`;
        messageDisplay.classList.add('success');

    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        let errorMessage = "Errore durante la registrazione. Riprova.";
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
