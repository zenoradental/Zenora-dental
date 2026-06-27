const html = require('fs').readFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html', 'utf8');
const start = html.indexOf('<div id="w-node-_90aa065e-2d95-4aa8-f2ac-04b04859c2d0-4af74ce9" class="footer_menu">');
if (start !== -1) {
    const section = html.substring(start, start + 3500);
    const skeleton = section.replace(/>[^<]+</g, '><'); // remove text content
    const cleanSkeleton = skeleton.replace(/<a[^>]*><\/a>/g, ''); // remove links
    console.log(section.match(/<div[^>]*class="[^"]*footer-links-column[^"]*"[^>]*>/g));
}
