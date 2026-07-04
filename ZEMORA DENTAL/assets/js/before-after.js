document.addEventListener('DOMContentLoaded', () => {
    const sliderContainers = document.querySelectorAll('.ba-slider-container');

    sliderContainers.forEach(container => {
        const sliderHandle = container.querySelector('.ba-handle');
        const beforeWrapper = container.querySelector('.ba-before-wrapper');
        let isDragging = false;

        // Mouse Events
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault(); // Prevent text/image selection natively
            updateSlider(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch Events
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            // Don't prevent default on touchstart to allow vertical page scrolling,
            // but CSS touch-action: pan-y will handle scroll blocking horizontally.
            updateSlider(e.touches[0].clientX);
        }, {passive: true});

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        });

        function updateSlider(clientX) {
            const rect = container.getBoundingClientRect();
            // Calculate percentage
            let xPos = clientX - rect.left;
            
            // Constrain to container
            if (xPos < 0) xPos = 0;
            if (xPos > rect.width) xPos = rect.width;

            let percentage = (xPos / rect.width) * 100;
            
            // Apply to elements
            sliderHandle.style.left = percentage + '%';
            beforeWrapper.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        }
    });
});
