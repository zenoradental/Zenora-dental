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

const followUsHtml = `
                                <div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">
                                    <div class="footer-menu_title">Follow us</div>
                                    <div class="footer-menu_link-wrap is-social">
                                        <a href="#" target="_blank" class="footer-menu_link w-inline-block">
                                            <div class="footer-social_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                    <path d="M9.33464 8.9987H11.0013L11.668 6.33203H9.33464V4.9987C9.33464 4.31244 9.33464 3.66536 10.668 3.66536H11.668V1.42543C11.4508 1.3966 10.63 1.33203 9.76324 1.33203C7.95357 1.33203 6.66797 2.4366 6.66797 4.46517V6.33203H4.66797V8.9987H6.66797V14.6654H9.33464V8.9987Z" fill="currentColor"></path>
                                                </svg>
                                            </div>
                                            <div>Facebook</div>
                                        </a>
                                        <a href="#" target="_blank" class="footer-menu_link w-inline-block">
                                            <div class="footer-social_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                    <path d="M11.7929 2.04297L8.46177 5.8508L5.5816 2.04297H1.41016L6.39438 8.56044L1.67049 13.9596H3.69327L7.33917 9.7937L10.5255 13.9596H14.5936L9.39797 7.09077L13.8145 2.04297H11.7929ZM11.0834 12.7496L3.77088 3.18942H4.97294L12.2036 12.7496H11.0834Z" fill="currentColor"></path>
                                                </svg>
                                            </div>
                                            <div>Tweeter</div>
                                        </a>
                                        <a href="#" target="_blank" class="footer-menu_link w-inline-block">
                                            <div class="footer-social_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                    <path d="M8.00067 6.36637C8.61207 5.74185 9.40807 5.33301 10.334 5.33301C12.359 5.33301 14.0007 6.97461 14.0007 8.99967V13.9997H12.6673V8.99967C12.6673 7.71101 11.6227 6.66634 10.334 6.66634C9.04533 6.66634 8.00067 7.71101 8.00067 8.99967V13.9997H6.66733V5.66634H8.00067V6.36637ZM3.33398 4.33301C2.7817 4.33301 2.33398 3.88529 2.33398 3.33301C2.33398 2.78072 2.7817 2.33301 3.33398 2.33301C3.88626 2.33301 4.33398 2.78072 4.33398 3.33301C4.33398 3.88529 3.88626 4.33301 3.33398 4.33301ZM2.66732 5.66634H4.00065V13.9997H2.66732V5.66634Z" fill="currentColor"></path>
                                                </svg>
                                            </div>
                                            <div>LinkedIn</div>
                                        </a>
                                        <a href="#" target="_blank" class="footer-menu_link w-inline-block">
                                            <div class="footer-social_icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                    <path d="M8.00067 5.99967C6.89573 5.99967 6.00065 6.89507 6.00065 7.99967C6.00065 9.10454 6.89607 9.99967 8.00067 9.99967C9.10553 9.99967 10.0007 9.10427 10.0007 7.99967C10.0007 6.89481 9.10527 5.99967 8.00067 5.99967ZM8.00067 4.66634C9.84093 4.66634 11.334 6.15774 11.334 7.99967C11.334 9.84001 9.8426 11.333 8.00067 11.333C6.16034 11.333 4.66732 9.84161 4.66732 7.99967C4.66732 6.15936 6.15872 4.66634 8.00067 4.66634ZM12.334 4.49911C12.334 4.95918 11.9601 5.33245 11.5007 5.33245C11.0406 5.33245 10.6673 4.95861 10.6673 4.49911C10.6673 4.03961 11.0411 3.66634 11.5007 3.66634C11.9595 3.66576 12.334 4.03961 12.334 4.49911ZM8.00067 2.66634C6.351 2.66634 6.08212 2.67071 5.31484 2.70487C4.7921 2.72941 4.44168 2.79972 4.1161 2.92612C3.82677 3.03833 3.61806 3.17233 3.39568 3.39471C3.17244 3.61794 3.03869 3.82609 2.92693 4.11556C2.80024 4.44189 2.72995 4.79175 2.70585 5.31377C2.67135 6.04981 2.66732 6.30704 2.66732 7.99967C2.66732 9.64934 2.67168 9.91821 2.70584 10.6854C2.7304 11.2079 2.8008 11.5589 2.92689 11.8837C3.0394 12.1734 3.17366 12.3826 3.39497 12.6039C3.61908 12.8277 3.82786 12.9619 4.11458 13.0726C4.44412 13.2 4.79432 13.2704 5.31474 13.2945C6.05078 13.3289 6.30802 13.333 8.00067 13.333C9.65033 13.333 9.9192 13.3286 10.6864 13.2945C11.2078 13.27 11.559 13.1994 11.8847 13.0734C12.1736 12.9612 12.3835 12.8265 12.6049 12.6053C12.8291 12.3809 12.963 12.1726 13.0738 11.8852C13.2009 11.5569 13.2714 11.2062 13.2955 10.6856C13.3299 9.94954 13.334 9.69227 13.334 7.99967C13.334 6.35002 13.3296 6.08115 13.2955 5.31392C13.2709 4.79238 13.2003 4.44067 13.0742 4.11513C12.9623 3.82659 12.8278 3.61724 12.6056 3.39471C12.382 3.17111 12.1744 3.03763 11.8847 2.92595C11.5587 2.79937 11.2083 2.72898 10.6865 2.70488C9.95053 2.67037 9.69326 2.66634 8.00067 2.66634ZM8.00067 1.33301C9.81173 1.33301 10.0379 1.33967 10.749 1.37301C11.4584 1.40579 11.9423 1.51801 12.3673 1.68301C12.8067 1.85245 13.1779 2.08134 13.5484 2.45189C13.9184 2.82245 14.1473 3.19467 14.3173 3.63301C14.4817 4.05745 14.594 4.54189 14.6273 5.25134C14.659 5.96245 14.6673 6.18856 14.6673 7.99967C14.6673 9.81081 14.6607 10.0369 14.6273 10.748C14.5945 11.4575 14.4817 11.9413 14.3173 12.3663C14.1479 12.8058 13.9184 13.1769 13.5484 13.5475C13.1779 13.9175 12.8051 14.1463 12.3673 14.3163C11.9423 14.4808 11.4584 14.593 10.749 14.6263C10.0379 14.658 9.81173 14.6663 8.00067 14.6663C6.18954 14.6663 5.96342 14.6597 5.25232 14.6263C4.54287 14.5935 4.05954 14.4808 3.63398 14.3163C3.19509 14.1469 2.82342 13.9175 2.45287 13.5475C2.08232 13.1769 1.85398 12.8041 1.68398 12.3663C1.51898 11.9413 1.40732 11.4575 1.37398 10.748C1.34232 10.0369 1.33398 9.81081 1.33398 7.99967C1.33398 6.18856 1.34065 5.96245 1.37398 5.25134C1.40676 4.54134 1.51898 4.05801 1.68398 3.63301C1.85342 3.19412 2.08232 2.82245 2.45287 2.45189C2.82342 2.08134 3.19565 1.85301 3.63398 1.68301C4.05898 1.51801 4.54232 1.40634 5.25232 1.37301C5.96342 1.34134 6.18954 1.33301 8.00067 1.33301Z" fill="currentColor"></path>
                                                </svg>
                                            </div>
                                            <div>Instagram</div>
                                        </a>
                                    </div>
                                </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    if (html.includes('<div class="footer-menu_title">Follow us</div>')) return;

    // Find the end of the legal column, which should be the second footer-links-column in footer_menu
    // Usually footer_menu looks like:
    // <div id="w-node-_90aa065e-2d95-4aa8-f2ac-04b04859c2d0-4af74ce9" class="footer_menu">
    //    <div class="footer-links-column"> ... Navigation ... </div>
    //    <div class="footer-links-column"> ... Legal ... </div>
    // </div>
    
    // We match from footer_menu up to the closing div of the second footer-links-column
    const legalEndRegex = /(<div[^>]*class="footer_menu"[^>]*>[\s\S]*?<div class="footer-links-column">[\s\S]*?<\/div>\s*<div class="footer-links-column">[\s\S]*?<\/div>)\s*<\/div>/;
    
    const match = html.match(legalEndRegex);
    if (match) {
        html = html.replace(legalEndRegex, `$1${followUsHtml}\n                            </div>`);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Restored Follow us column in ' + file);
    }
});
