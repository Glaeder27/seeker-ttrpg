/*v2.6 2025-08-28T14:15:10.397Z*/

import { auth, firestore } from "/scripts/config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Riferimenti agli elementi HTML
const userProfileDiv = document.getElementById('userProfile');
const notLoggedInP = document.getElementById('notLoggedIn');
const profileForm = document.getElementById('profileForm');
const pageTitleSpan = document.getElementById('userName');

// Campi form
const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
const languagesInput = document.getElementById('languages');
const socialLinkInput = document.getElementById('socialLink');
const languageSelect = document.getElementById('language');
const factionSelect = document.getElementById('faction');
const preferredRoleInput = document.getElementById('preferredRole');
const preferredPlaystyleInput = document.getElementById('preferredPlaystyle');
const experienceSelect = document.getElementById('experience');
const logoutButton = document.getElementById('logoutButton');

// Listener autenticazione
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
 * Carica i dati del profilo utente da Firestore
 */
async function loadUserProfile(userId) {
    const userDocRef = doc(firestore, 'users', userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            // Popola il form
            pageTitleSpan.textContent = userData.name || 'Seeker';
            nameInput.value = userData.name || '';
            bioInput.value = userData.bio || '';
            languagesInput.value = userData.languages || '';
            socialLinkInput.value = userData.socialLink || '';
            languageSelect.value = userData.language || 'en';
            factionSelect.value = userData.faction || '';
            preferredRoleInput.value = userData.preferredRole || '';
            preferredPlaystyleInput.value = userData.preferredPlaystyle || '';
            experienceSelect.value = userData.experience || '';
        } else {
            pageTitleSpan.textContent = 'Seeker';
        }
    } catch (error) {
        console.error("Error loading the profile:", error);
    }
}

/**
 * Salva i dati del profilo utente su Firestore
 */
async function saveUserProfile(user) {
    const userId = user.uid;
    const userData = {
        name: nameInput.value,
        bio: bioInput.value,
        languages: languagesInput.value,
        socialLink: socialLinkInput.value,
        language: languageSelect.value,
        faction: factionSelect.value,
        preferredRole: preferredRoleInput.value,
        preferredPlaystyle: preferredPlaystyleInput.value,
        experience: experienceSelect.value
    };

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