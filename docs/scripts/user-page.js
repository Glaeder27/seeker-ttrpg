/*v2.4 2025-08-28T09:19:28.383Z*/

import { auth, firestore } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Ottieni riferimenti agli elementi HTML
const userProfileDiv = document.getElementById('userProfile');
const notLoggedInP = document.getElementById('notLoggedIn');
const profileForm = document.getElementById('profileForm');
const pageTitleSpan = document.getElementById('userName');

// Campi form
const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
// ... altri campi
const logoutButton = document.getElementById('logoutButton');

// Ascolta cambiamenti di stato utente
onAuthStateChanged(auth, user => {
    if (user) {
        userProfileDiv.style.display = 'block';
        notLoggedInP.style.display = 'none';

        loadUserProfile(user.uid);

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile(user);
        });

        logoutButton.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '/auth.html';
        });

    } else {
        userProfileDiv.style.display = 'none';
        notLoggedInP.style.display = 'block';
    }
});

/**
 * Carica i dati del profilo utente da Firestore e li visualizza nel form.
 * @param {string} userId L'ID dell'utente autenticato.
 */
async function loadUserProfile(userId) {
    const userDocRef = doc(firestore, 'users', userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            // Popola i campi del form con i dati esistenti
            pageTitleSpan.textContent = userData.name || 'Seeker';
            nameInput.value = userData.name || '';
            bioInput.value = userData.bio || '';
            languagesInput.value = userData.languages || '';
            socialLinkInput.value = userData.socialLink || '';
            factionSelect.value = userData.faction || '';
            preferredRoleInput.value = userData.preferredRole || '';
            preferredPlaystyleInput.value = userData.preferredPlaystyle || '';
            experienceSelect.value = userData.experience || '';
            timezoneInput.value = userData.timezone || '';
            availabilityInput.value = userData.availability || '';
            preferredPlatformInput.value = userData.preferredPlatform || '';
        } else {
            // Se l'utente non ha ancora un profilo, imposta un name predefinito
            pageTitleSpan.textContent = 'Seeker';
        }
    } catch (error) {
        console.error("Error loading the profile:", error);
        // Potresti mostrare un messaggio di errore all'utente
    }
}

/**
 * Salva i dati del profilo utente su Firestore.
 * @param {object} user L'oggetto utente di Firebase.
 */
async function saveUserProfile(user) {
    const userId = user.uid;
    const userData = {
        name: nameInput.value,
        bio: bioInput.value,
        languages: languagesInput.value,
        socialLink: socialLinkInput.value,
        faction: factionSelect.value,
        preferredRole: preferredRoleInput.value,
        preferredPlaystyle: preferredPlaystyleInput.value,
        experience: experienceSelect.value,
        timezone: timezoneInput.value,
        availability: availabilityInput.value,
        preferredPlatform: preferredPlatformInput.value,
    };

    // Salva i dati su Cloud Firestore
    const userDocRef = doc(firestore, 'users', userId);
    try {
        await setDoc(userDocRef, userData, { merge: true });
        pageTitleSpan.textContent = userData.name || 'Seeker';
        alert('Profile saved successfully!');
    } catch (error) {
        console.error("Error saving profile:", error);
        alert('Error saving profile. Please try again.');
    }
}