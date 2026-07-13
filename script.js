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
    updateContactEmailLink(lang);
    // Dispatch custom event so other scripts (like events.html) can update dynamically
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

// Helper function to update the contact email link with a draft signup letter
function updateContactEmailLink(lang) {
    const contactLink = document.getElementById('contact-email-link');
    if (!contactLink) return;

    let subject = '';
    let body = '';

    if (lang === 'vi') {
        subject = 'Đăng ký học tại Vangia Innovations';
        body = 'Kính gửi Ban tuyển sinh Vangia Innovations,\r\n\r\n' +
               'Tôi muốn đăng ký tham gia khóa học tiếp theo. Dưới đây là thông tin đăng ký của tôi:\r\n\r\n' +
               '- Họ và tên: \r\n' +
               '- Số điện thoại: \r\n' +
               '- Nền tảng học vấn / nghề nghiệp: \r\n' +
               '- Mục tiêu khi tham gia khóa học: \r\n' +
               '- Câu hỏi hoặc ý kiến khác (nếu có): \r\n\r\n' +
               'Tôi xin chân thành cảm ơn và mong sớm nhận được phản hồi từ Vangia Learn.\r\n\r\n' +
               'Trân trọng,';
    } else {
        subject = 'Application for Vangia Innovations Program';
        body = 'Dear Vangia Innovations Team,\r\n\r\n' +
               'I am interested in joining the upcoming cohort. Please find my signup details below:\r\n\r\n' +
               '- Full Name: \r\n' +
               '- Phone Number: \r\n' +
               '- Educational / Professional Background: \r\n' +
               '- Goals for joining the cohort: \r\n' +
               '- Questions or comments (if any): \r\n\r\n' +
               'Thank you, and I look forward to your response.\r\n\r\n' +
               'Best regards,';
    }

    const mailtoUrl = `mailto:contact.vangiainnovations@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    contactLink.setAttribute('href', mailtoUrl);
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

    // Platform Screenshots Carousel Logic
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextButton = document.querySelector('.carousel-btn.next-btn');
    const prevButton = document.querySelector('.carousel-btn.prev-btn');
    const dots = Array.from(document.querySelectorAll('.carousel-dot'));

    if (track && slides.length > 0) {
        let currentIndex = 0;

        const updateCarousel = (index) => {
            // Update active classes on slides
            slides.forEach((slide, idx) => {
                if (idx === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Slide the track
            track.style.transform = `translateX(-${index * (100 / slides.length)}%)`;

            // Update active dots
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            currentIndex = index;
        };

        // Next Button Click
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                let nextIndex = currentIndex + 1;
                if (nextIndex >= slides.length) {
                    nextIndex = 0; // Wrap around to first slide
                }
                updateCarousel(nextIndex);
            });
        }

        // Prev Button Click
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                let prevIndex = currentIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = slides.length - 1; // Wrap around to last slide
                }
                updateCarousel(prevIndex);
            });
        }

        // Dots click
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                updateCarousel(idx);
            });
        });

        // Initialize state
        updateCarousel(0);
    }
});