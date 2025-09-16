// main.js - Interactive functionality for Omnia landing page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system
    initializeLanguageSystem();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize smooth scrolling
    initializeSmoothScrolling();

    // Initialize animations
    initializeAnimations();
});

// Language System
function initializeLanguageSystem() {
    let currentLanguage = localStorage.getItem('omnia-lang') || 'en';

    // Apply translations on page load
    applyTranslations(currentLanguage);
    updateLanguageDisplay(currentLanguage);

    // Header language selector
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');

    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });

        // Language option clicks
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const newLang = this.dataset.lang;
                changeLanguage(newLang);
                langDropdown.classList.remove('show');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove('show');
            }
        });
    }

    // Footer language selector
    const footerLangSelect = document.getElementById('footerLangSelect');
    if (footerLangSelect) {
        footerLangSelect.value = currentLanguage;
        footerLangSelect.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }

    function changeLanguage(newLang) {
        currentLanguage = newLang;
        localStorage.setItem('omnia-lang', newLang);
        applyTranslations(newLang);
        updateLanguageDisplay(newLang);

        // Update footer selector
        if (footerLangSelect) {
            footerLangSelect.value = newLang;
        }
    }

    function applyTranslations(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.translations.getTranslation(lang, key);
            element.textContent = translation;
        });
    }

    function updateLanguageDisplay(lang) {
        const currentLangElement = document.getElementById('currentLang');
        if (currentLangElement) {
            currentLangElement.textContent = window.translations.getLanguageFlag(lang);
        }
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
            document.body.classList.toggle('menu-open');
        });

        // Close mobile menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                document.body.classList.remove('menu-open');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update active nav link
                updateActiveNavLink(href);
            }
        });
    });

    function updateActiveNavLink(activeHref) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === activeHref) {
                link.classList.add('active');
            }
        });
    }

    // Update active nav on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 100;
            const sectionHeight = section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });

        if (current) {
            updateActiveNavLink(current);
        }
    });
}

// Animations
function initializeAnimations() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');

    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Initial call

    // Typing animation for demo chat
    initializeTypingAnimation();

    // Intersection Observer for fade-in animations
    initializeFadeInAnimations();
}

// Typing Animation
function initializeTypingAnimation() {
    const typingIndicator = document.querySelector('.typing-indicator');

    if (typingIndicator) {
        // Add CSS class to control animation
        typingIndicator.classList.add('active');

        // Optional: Add periodic pulse to typing dots
        setInterval(() => {
            if (typingIndicator) {
                typingIndicator.classList.remove('active');
                setTimeout(() => {
                    if (typingIndicator) {
                        typingIndicator.classList.add('active');
                    }
                }, 100);
            }
        }, 3000);
    }
}

// Fade-in Animations
function initializeFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe sections for fade-in animation
    const sections = document.querySelectorAll('.features, .how-it-works, .pricing');
    sections.forEach(section => {
        section.classList.add('animate-fade');
        observer.observe(section);
    });

    // Observe cards for stagger animation
    const cards = document.querySelectorAll('.feature-card, .step, .pricing-card');
    cards.forEach((card, index) => {
        card.classList.add('animate-fade');
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize performance optimizations
(function() {
    // Debounce scroll events
    const debouncedScroll = debounce(() => {
        // Any heavy scroll operations go here
    }, 16); // ~60fps

    window.addEventListener('scroll', debouncedScroll, { passive: true });

    // Preload critical images
    const criticalImages = [
        // Add any critical image URLs here if needed
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
})();