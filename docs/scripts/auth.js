/*v1.4 2025-08-04T14:44:31.932Z*/

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

// Gestione della visualizzazione dei form
switchToRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registrationForm.style.display = 'block';
    switchToRegisterLink.style.display = 'none';
    switchToLoginLink.style.display = 'block';
    formTitle.textContent = 'Registrati';
    messageDisplay.textContent = '';
});

switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registrationForm.style.display = 'none';
    switchToRegisterLink.style.display = 'block';
    switchToLoginLink.style.display = 'none';
    formTitle.textContent = 'Accedi';
    messageDisplay.textContent = '';
});

// Gestione del form di Registrazione
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = regEmailInput.value;
    const password = regPasswordInput.value;
    
    messageDisplay.textContent = '';
    messageDisplay.className = 'message';

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        messageDisplay.textContent = 'Registrazione avvenuta con successo! Puoi accedere ora.';
        messageDisplay.classList.add('success');
    } catch (error) {
        handleAuthError(error);
    }
});

// Gestione del form di Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    
    messageDisplay.textContent = '';
    messageDisplay.className = 'message';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        messageDisplay.textContent = 'Accesso avvenuto con successo!';
        messageDisplay.classList.add('success');
        
        // Reindirizza l'utente dopo il login
        window.location.href = '/user-page.html';
        
    } catch (error) {
        handleAuthError(error);
    }
});

function handleAuthError(error) {
    let errorMessage = "Errore. Riprova.";
    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = 'Questa email è già in uso.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'L\'indirizzo email non è valido.';
            break;
        case 'auth/weak-password':
            errorMessage = 'La password è troppo debole (minimo 6 caratteri).';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            errorMessage = 'Email o password non validi.';
            break;
        default:
            errorMessage = `Errore sconosciuto: ${error.message}`;
            break;
    }
    messageDisplay.textContent = errorMessage;
    messageDisplay.classList.add('error');
}