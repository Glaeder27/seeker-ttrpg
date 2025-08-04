// Aggiungi il tuo codice di configurazione Firebase in un file separato (es. config.js)
const firebaseConfig = {
  apiKey: "AIzaSyCZu-da02W-5Q4gd5N7mhwx_UReEu8QSfE",
  authDomain: "seeker-ttrpg.firebaseapp.com",
  projectId: "seeker-ttrpg",
  messagingSenderId: "762210490643",
  appId: "1:762210490643:web:a2b3893b9e4cfbdc8862e6"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const userProfileDiv = document.getElementById('userProfile');
const notLoggedInP = document.getElementById('notLoggedIn');
const profileForm = document.getElementById('profileForm');
const userNameSpan = document.getElementById('userName');
const nicknameInput = document.getElementById('nickname');
const factionSelect = document.getElementById('faction');

// Ascolta i cambiamenti di stato dell'utente
auth.onAuthStateChanged(user => {
    if (user) {
        // Utente loggato
        userProfileDiv.style.display = 'block';
        notLoggedInP.style.display = 'none';

        // Carica i dati utente esistenti (se ci sono)
        loadUserProfile(user.uid);

        // Gestisce il form
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile(user);
        });

    } else {
        // Utente non loggato
        userProfileDiv.style.display = 'none';
        notLoggedInP.style.display = 'block';
    }
});

async function loadUserProfile(userId) {
    const userDocRef = db.collection('users').doc(userId);
    const doc = await userDocRef.get();

    if (doc.exists) {
        const userData = doc.data();
        userNameSpan.textContent = userData.nickname || 'Utente';
        nicknameInput.value = userData.nickname || '';
        factionSelect.value = userData.faction || '';
    }
}

async function saveUserProfile(user) {
    const userId = user.uid;
    const nickname = nicknameInput.value;
    const faction = factionSelect.value;

    // Salva i dati su Cloud Firestore
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({
        nickname: nickname,
        faction: faction
    });

    // Aggiorna l'interfaccia utente con i nuovi dati
    userNameSpan.textContent = nickname;

    alert('Profilo salvato con successo!');
}