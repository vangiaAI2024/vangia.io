// Basic script for smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Dropdown toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const submenu = document.querySelector('.submenu');

    // Click functionality
    dropdown.addEventListener('click', function(e) {
        // Only prevent default if clicking on the dropdown trigger itself, not on links
        if (e.target.tagName !== 'A') {
            e.preventDefault();
            submenu.classList.toggle('show');
        }
    });

    // Hover functionality as backup
    dropdown.addEventListener('mouseenter', function() {
        submenu.classList.add('show');
    });

    dropdown.addEventListener('mouseleave', function() {
        submenu.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            submenu.classList.remove('show');
        }
    });
});

// Add any additional interactivity here