/*v1.9 2025-08-28T13:35:36.049Z*/
import { auth } from "./config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } 
    from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

let messages = {};
let LANG = 'en';

// --- Carica lingua ---
async function loadLanguage(lang) {
    try {
        const res = await fetch(`/data/languages/${lang}.json`);
        if (!res.ok) throw new Error('Language file not found');
        messages = await res.json();
    } catch (err) {
        console.error("Errore caricando il file lingua:", err);
        messages = {};
    }
}

// --- Imposta persistence ---
await setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Persistenza login impostata su localStorage"))
    .catch(err => console.error("Errore impostando persistenza login:", err));

// --- Imposta Logout button ---
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      console.log("Utente disconnesso");
      window.location.href = "/login.html";
    } catch (err) {
      console.error("Errore durante logout:", err);
    }
  });
}

// --- Carica lingua e setup form ---
await loadLanguage(LANG);
setupForms();

function setupForms() {
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');

    const registrationForm = document.getElementById('registrationForm');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');

    const messageDisplay = document.getElementById('message');
    const formTitle = document.getElementById('form-title');
    const switchToLoginLink = document.getElementById('switchToLogin');
    const switchToRegisterLink = document.getElementById('switchToRegister');

    // Switch form
    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
        switchToRegisterLink.style.display = 'none';
        switchToLoginLink.style.display = 'block';
        formTitle.textContent = messages.register_title || 'Registrati';
        messageDisplay.textContent = '';
    });

    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
        switchToRegisterLink.style.display = 'block';
        switchToLoginLink.style.display = 'none';
        formTitle.textContent = messages.login_title || 'Accedi';
        messageDisplay.textContent = '';
    });

    // Registration
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = regEmailInput.value;
        const password = regPasswordInput.value;

        messageDisplay.textContent = '';
        messageDisplay.className = 'message';

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            messageDisplay.textContent = messages.registration_success || 'Registration successful! You can log in now.';
            messageDisplay.classList.add('success');
        } catch (error) {
            handleAuthError(error, messageDisplay);
        }
    });

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        messageDisplay.textContent = '';
        messageDisplay.className = 'message';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            messageDisplay.textContent = messages.login_success || 'Login successful!';
            messageDisplay.classList.add('success');

            window.location.href = '/user-page.html';
        } catch (error) {
            handleAuthError(error, messageDisplay);
        }
    });
}

// --- Gestione errori ---
function handleAuthError(error, displayElement) {
    let errorMessage = messages.login_error || "Error. Try again.";

    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = messages.email_in_use || errorMessage;
            break;
        case 'auth/invalid-email':
            errorMessage = messages.invalid_email || errorMessage;
            break;
        case 'auth/weak-password':
            errorMessage = messages.weak_password || errorMessage;
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            errorMessage = messages.user_not_found || errorMessage;
            break;
    }

    displayElement.textContent = errorMessage;
    displayElement.classList.add('error');
}