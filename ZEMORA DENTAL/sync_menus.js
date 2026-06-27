const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
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

    // Replace Dropdown columns
    const dropdownRegex = /<div class="navbar-dropdown_wrapper">([\s\S]*?)<\/nav>/;
    const dropdownMatch = html.match(dropdownRegex);
    if (dropdownMatch) {
        const newDropdown = `<div class="navbar-dropdown_wrapper">\n                                            <div class="navbar-dropdown_column">\n${buildDropdownCol(navLinks, currentPage)}\n                                        </div>\n                                        <div class="navbar-dropdown_column">\n${buildDropdownCol(legalLinks, currentPage)}\n                                        </div>\n                                        </div>\n                                    </nav>`;
        html = html.replace(dropdownMatch[0], newDropdown);
    }

    // Replace Footer Navigation column
    const footerNavRegex = /<div class="footer-menu_title">Navigation<\/div>\s*<div class="footer-menu_link-wrap">([\s\S]*?)<\/div>\s*<\/div>/;
    const footerNavMatch = html.match(footerNavRegex);
    if (footerNavMatch) {
        const newFooterNav = `<div class="footer-menu_title">Navigation</div>\n                                    <div class="footer-menu_link-wrap">\n${buildFooterCol(navLinks, currentPage)}\n                                    </div>\n                                </div>`;
        html = html.replace(footerNavMatch[0], newFooterNav);
    }

    // Replace Footer Legal column
    const footerLegalRegex = /<div class="footer-menu_title">Legal<\/div>\s*<div class="footer-menu_link-wrap">([\s\S]*?)<\/div>\s*<\/div>/;
    const footerLegalMatch = html.match(footerLegalRegex);
    if (footerLegalMatch) {
        const newFooterLegal = `<div class="footer-menu_title">Legal</div>\n                                    <div class="footer-menu_link-wrap">\n${buildFooterCol(legalLinks, currentPage)}\n                                    </div>\n                                </div>`;
        html = html.replace(footerLegalMatch[0], newFooterLegal);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Synced menus in ' + file);
    }
});
