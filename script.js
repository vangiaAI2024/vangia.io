// Function to set language and persist to localStorage
function setLanguage(lang) {
    localStorage.setItem('preferred-language', lang);
    if (lang === 'vi') {
        document.body.classList.remove('lang-en');
        document.body.classList.add('lang-vi');
        document.querySelectorAll('.btn-en').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.btn-vi').forEach(el => el.classList.add('active'));
    } else {
        document.body.classList.remove('lang-vi');
        document.body.classList.add('lang-en');
        document.querySelectorAll('.btn-vi').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.btn-en').forEach(el => el.classList.add('active'));
    }
}

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Language switcher setup
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    setLanguage(savedLang);
});