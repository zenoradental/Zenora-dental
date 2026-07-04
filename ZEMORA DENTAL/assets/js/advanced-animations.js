document.addEventListener('DOMContentLoaded', () => {
    // Make sure GSAP is loaded
    if (typeof gsap === 'undefined') return;

    // 1. Magnetic Buttons
    const magneticButtons = document.querySelectorAll('.button_primary');
    
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: "power2.out"
            });
            
            // Move the inner text slightly more for a parallax effect
            const innerText = btn.querySelector('.button_inner');
            if (innerText) {
                gsap.to(innerText, {
                    x: x * 0.15,
                    y: y * 0.15,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.3)"
            });
            
            const innerText = btn.querySelector('.button_inner');
            if (innerText) {
                gsap.to(innerText, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)"
                });
            }
        });
    });

    // 2. Advanced Text Reveal (Staggered words)
    // We target hero headings and section titles
    const headings = document.querySelectorAll('.heading-style-h1, .home-about_title, .home-service_header-title');
    
    headings.forEach(heading => {
        // Only run if ScrollTrigger is available
        if (typeof ScrollTrigger === 'undefined') return;
        
        // Simple word split logic (since SplitText is premium)
        const text = heading.innerText;
        heading.innerHTML = '';
        
        const words = text.split(' ');
        words.forEach((word, i) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.overflow = 'hidden';
            span.style.paddingRight = '8px'; // keep space
            
            const innerSpan = document.createElement('span');
            innerSpan.innerText = word;
            innerSpan.style.display = 'inline-block';
            innerSpan.style.transform = 'translateY(100%)';
            
            span.appendChild(innerSpan);
            heading.appendChild(span);
        });

        const innerSpans = heading.querySelectorAll('span > span');
        gsap.to(innerSpans, {
            y: "0%",
            duration: 1,
            stagger: 0.05,
            ease: "power4.out",
            scrollTrigger: {
                trigger: heading,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    // 3. Image Parallax
    const parallaxImages = document.querySelectorAll('.home-about_image, .testimonial-author_image');
    parallaxImages.forEach(img => {
        if (typeof ScrollTrigger === 'undefined') return;
        
        gsap.fromTo(img, {
            y: -30
        }, {
            y: 30,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
});
