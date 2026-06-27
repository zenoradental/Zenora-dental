const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/licenses.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/licenses.html'
];

const navLinks = [
    { href: 'index.html', text: 'Home' },
    { href: 'about.html', text: 'About' },
    { href: 'service.html', text: 'Services' },
    { href: 'blog.html', text: 'Blogs' },
    { href: 'contact.html', text: 'Contact' }
];

const legalLinks = [
    { href: 'terms.html', text: 'Terms &amp; Conditions' },
    { href: 'privacy.html', text: 'Privacy Policy' },
    { href: 'cookies.html', text: 'Cookies' },
    { href: 'licenses.html', text: 'Licenses' }
];

function buildDropdownCol(links, currentPage) {
    return links.map(link => {
        const isCurrent = (link.href === currentPage) ? ' aria-current="page" class="navbar-dropdown_link w-inline-block w--current"' : ' class="navbar-dropdown_link w-inline-block"';
        return `                                            <a href="${link.href}" data-animation="text-flip"${isCurrent}>\n                                                <div>${link.text.replace('&amp;', '&')}</div>\n                                            </a>`;
    }).join('\n');
}

function buildFooterCol(links, currentPage) {
    return links.map(link => {
        const isCurrent = (link.href === currentPage) ? ' aria-current="page" class="footer-menu_link w-inline-block w--current"' : ' class="footer-menu_link w-inline-block"';
        return `                                        <a href="${link.href}"${isCurrent}>\n                                            <div>${link.text}</div>\n                                        </a>`;
    }).join('\n');
}

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;
    
    const currentPage = path.basename(file);

    // 1. Repair dropdown list
    const cleanDropdownList = `<nav class="navbar-dropdown_list w-dropdown-list">
                                        <div class="navbar-dropdown_wrapper">
                                            <div class="navbar-dropdown_column">
${buildDropdownCol(navLinks, currentPage)}
                                            </div>
                                            <div class="navbar-dropdown_column">
${buildDropdownCol(legalLinks, currentPage)}
                                            </div>
                                        </div>
                                    </nav>`;
    
    const dropdownRegex = /<nav class="navbar-dropdown_list w-dropdown-list">[\s\S]*?<\/nav>/;
    html = html.replace(dropdownRegex, cleanDropdownList);

    // 2. Repair footer menu columns (Navigation & Legal)
    const cleanFooterCols = `<div class="footer-links-column">
                                    <div class="footer-menu_title">Navigation</div>
                                    <div class="footer-menu_link-wrap">
${buildFooterCol(navLinks, currentPage)}
                                    </div>
                                </div>
                                <div class="footer-links-column">
                                    <div class="footer-menu_title">Legal</div>
                                    <div class="footer-menu_link-wrap">
${buildFooterCol(legalLinks, currentPage)}
                                    </div>
                                </div>
                                <div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">`;

    // We match from the start of the first footer-links-column inside footer_menu, up to the Follow us column.
    const footerRegex = /<div class="footer-links-column">\s*<div class="footer-menu_title">Navigation<\/div>[\s\S]*?<div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">/;
    html = html.replace(footerRegex, cleanFooterCols);

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Repaired HTML in ' + file);
    }
});
