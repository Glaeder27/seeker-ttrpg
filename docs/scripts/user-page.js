/*v2.3 2025-08-04T14:08:30.755Z*/

// Ottieni riferimenti agli elementi HTML
const userProfileDiv = document.getElementById('userProfile');
const notLoggedInP = document.getElementById('notLoggedIn');
const profileForm = document.getElementById('profileForm');
const pageTitleSpan = document.getElementById('userName');

// Nuovi riferimenti per i campi del form
const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
const languagesInput = document.getElementById('languages');
const socialLinkInput = document.getElementById('socialLink');
const factionSelect = document.getElementById('faction');
const preferredRoleInput = document.getElementById('preferredRole');
const preferredPlaystyleInput = document.getElementById('preferredPlaystyle');
const experienceSelect = document.getElementById('experience');
const timezoneInput = document.getElementById('timezone');
const availabilityInput = document.getElementById('availability');
const preferredPlatformInput = document.getElementById('preferredPlatform');

const logoutButton = document.getElementById('logoutButton');

// Ascolta i cambiamenti di stato dell'utente (login/logout)
auth.onAuthStateChanged(user => {
    if (user) {
        // Utente loggato
        userProfileDiv.style.display = 'block';
        notLoggedInP.style.display = 'none';

        // Carica i dati utente esistenti
        loadUserProfile(user.uid);

        // Aggiungi un listener per salvare il profilo
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserProfile(user);
        });

        // Aggiungi un listener per il pulsante di logout
        logoutButton.addEventListener('click', async () => {
            await auth.signOut();
            window.location.href = '/auth.html'; // Reindirizza alla pagina di login
        });

    } else {
        // Utente non loggato
        userProfileDiv.style.display = 'none';
        notLoggedInP.style.display = 'block';
    }
});

/**
 * Carica i dati del profilo utente da Firestore e li visualizza nel form.
 * @param {string} userId L'ID dell'utente autenticato.
 */
async function loadUserProfile(userId) {
    const userDocRef = db.collection('users').doc(userId);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            const userData = doc.data();
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
    const userDocRef = db.collection('users').doc(userId);
    try {
        await userDocRef.set(userData, { merge: true }); // 'merge: true' per non sovrascrivere l'intero documento
        pageTitleSpan.textContent = userData.name || 'Seeker';
        alert('Profile saved successfully!');
    } catch (error) {
        console.error("Error saving profile:", error);
        alert('Error saving profile. Please try again.');
    }
}