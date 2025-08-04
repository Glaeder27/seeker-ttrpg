/*v1.5 2025-08-04T14:08:18.460Z*/

const firebaseConfig = {
  apiKey: "AIzaSyCZu-da02W-5Q4gd5N7mhwx_UReEu8QSfE",
  authDomain: "seeker-ttrpg.firebaseapp.com",
  projectId: "seeker-ttrpg",
  storageBucket: "seeker-ttrpg.firebasestorage.app",
  messagingSenderId: "762210490643",
  appId: "1:762210490643:web:a2b3893b9e4cfbdc8862e6",
  measurementId: "G-F3HS8JCNLT"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Definisci i servizi di Firebase come variabili globali
const auth = firebase.auth();
const db = firebase.firestore();