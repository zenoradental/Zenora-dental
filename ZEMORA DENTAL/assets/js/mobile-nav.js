document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.w-nav-button, .navbar-toggler-button');
    const navMenus = document.querySelectorAll('.w-nav-menu, .navbar_menu');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = btn.classList.contains('w--open');
            if (isOpen) {
                btn.classList.remove('w--open');
                navMenus.forEach(menu => menu.classList.remove('active'));
            } else {
                btn.classList.add('w--open');
                navMenus.forEach(menu => menu.classList.add('active'));
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.w-nav') && !e.target.closest('.navbar_wrap')) {
            navButtons.forEach(btn => btn.classList.remove('w--open'));
            navMenus.forEach(menu => menu.classList.remove('active'));
        }
    });

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
                    if (list.style.display === 'block') {
                        list.style.display = 'none';
                    } else {
                        list.style.display = 'block';
                    }
                }
            }
        });
    });
});
