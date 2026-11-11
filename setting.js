// =========================
// SELECT HTML ELEMENTS
// =========================

const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const currencyInput = document.getElementById("currency");

const darkModeToggle = document.getElementById("darkMode");
const clearProfileButton = document.getElementById("clearProfile");

const profileMessage = document.getElementById("profileMessage");
const themeMessage = document.getElementById("themeMessage");

// =========================
// LOCAL STORAGE KEYS
// =========================

const PROFILE_KEY = "spendwiseProfile";
const THEME_KEY = "spendwiseTheme";

// =========================
// APPLY THEME
// =========================

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    localStorage.setItem(THEME_KEY, theme);

    if (darkModeToggle) {
        darkModeToggle.checked = theme === "dark";
    }
}

// Load saved theme when page opens
const savedTheme = localStorage.getItem(THEME_KEY) || "light";
applyTheme(savedTheme);

// =========================
// LOAD PERSONAL INFORMATION
// =========================

function loadProfile() {
    const savedProfile = localStorage.getItem(PROFILE_KEY);

    if (!savedProfile) {
        return;
    }

    try {
        const profile = JSON.parse(savedProfile);

        fullNameInput.value = profile.fullName || "";
        emailInput.value = profile.email || "";
        phoneInput.value = profile.phone || "";
        currencyInput.value = profile.currency || "KSh";

    } catch (error) {
        console.error("Could not load profile:", error);
    }
}

loadProfile();

// =========================
// SAVE PERSONAL INFORMATION
// =========================

profileForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const profile = {
        fullName: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        currency: currencyInput.value
    };

    if (!profile.fullName || !profile.email) {
        profileMessage.textContent = "Please enter your name and email.";
        return;
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    profileMessage.textContent = "Your personal information has been saved successfully.";
});

// =========================
// DARK MODE
// =========================

darkModeToggle.addEventListener("change", function() {
    const selectedTheme = darkModeToggle.checked ? "dark" : "light";

    applyTheme(selectedTheme);

    themeMessage.textContent =
        selectedTheme === "dark"
            ? "Dark mode is now enabled."
            : "Light mode is now enabled.";
});

// =========================
// CLEAR PERSONAL INFORMATION
// =========================

clearProfileButton.addEventListener("click", function() {

    const confirmation = confirm(
        "Are you sure you want to delete your saved personal information?"
    );

    if (confirmation) {

        localStorage.removeItem(PROFILE_KEY);

        profileForm.reset();
        currencyInput.value = "KSh";

        profileMessage.textContent = "Your personal information has been cleared.";
    }
});