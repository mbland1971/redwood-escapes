// Shared navigation behaviour: sticky-navbar shading and the mobile menu toggle.
// Kept in an external file so every page can ship a Content-Security-Policy
// that forbids inline script.
(() => {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    if (!hamburger || !navLinks) return;

    const closeMenu = () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    };

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
})();
