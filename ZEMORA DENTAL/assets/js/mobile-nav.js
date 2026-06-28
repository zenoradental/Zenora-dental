document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.w-nav-button, .navbar-toggler-button');
    const navMenus = document.querySelectorAll('.w-nav-menu, .navbar_menu');
    
    // Dynamically inject mobile CTA buttons into menu if not present
    navMenus.forEach(menu => {
        if (!menu.querySelector('.mobile-cta-wrapper')) {
            const ctaWrapper = document.createElement('div');
            ctaWrapper.className = 'mobile-cta-wrapper';
            ctaWrapper.innerHTML = `
                <a href="book-appointment.html" class="mobile-cta-btn">Book Appointment <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
                <a href="check-status.html" class="mobile-status-btn">Check Status <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></a>
            `;
            menu.appendChild(ctaWrapper);
        }
    });

    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = btn.classList.contains('w--open');
            if (isOpen) {
                btn.classList.remove('w--open');
                navMenus.forEach(menu => {
                    menu.classList.remove('active');
                    menu.style.display = 'none';
                });
                document.body.style.overflow = '';
            } else {
                btn.classList.add('w--open');
                navMenus.forEach(menu => {
                    menu.classList.add('active');
                    menu.style.display = 'flex';
                });
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.w-nav') && !e.target.closest('.navbar_wrap')) {
            navButtons.forEach(btn => btn.classList.remove('w--open'));
            navMenus.forEach(menu => {
                menu.classList.remove('active');
                menu.style.display = 'none';
            });
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking any navigation link
    const navLinks = document.querySelectorAll('.navbar_link, .navbar-dropdown_link, .mobile-cta-btn');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                navButtons.forEach(btn => btn.classList.remove('w--open'));
                navMenus.forEach(menu => {
                    menu.classList.remove('active');
                    menu.style.display = 'none';
                });
                document.body.style.overflow = '';
            }
        });
    });

    // Initialize mobile dropdowns to closed
    if (window.innerWidth <= 991) {
        document.querySelectorAll('.navbar-dropdown_list, .w-dropdown-list').forEach(list => {
            list.classList.remove('w--open');
            list.style.display = 'none';
        });
    }

    // Dropdown toggles inside mobile nav
    const dropdownToggles = document.querySelectorAll('.navbar-dropdown_toggle, .w-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                e.preventDefault();
                e.stopPropagation();
                toggle.classList.toggle('w--open');
                const list = toggle.nextElementSibling || toggle.parentElement.querySelector('.navbar-dropdown_list, .w-dropdown-list');
                if (list) {
                    list.classList.toggle('w--open');
                    if (list.classList.contains('w--open')) {
                        list.style.display = 'flex';
                    } else {
                        list.style.display = 'none';
                    }
                }
            }
        });
    });
});
