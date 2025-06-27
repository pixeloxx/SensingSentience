// these are functions that should be available to the backend

window.frontendFunctions = {
    // custom functions after this line
    start_party: function (command) {
    start_party: function (command) {
        console.log("Starting party mode");
        function createGlitter() {
            const glitter = document.createElement('div');
            glitter.style.position = 'absolute';
            glitter.style.width = '10px';
            glitter.style.height = '10px';
            glitter.style.background = `radial-gradient(circle, ${getRandomColor()}, rgba(255, 255, 255, 0))`;
            glitter.style.borderRadius = '50%';
            glitter.style.left = Math.random() * 100 + 'vw';
            glitter.style.top = '0';
            glitter.style.opacity = '1';
            glitter.style.transition = `transform ${Math.random() * 3 + 2}s linear, opacity ${Math.random() * 3 + 2}s linear`;
            document.body.appendChild(glitter);

            requestAnimationFrame(() => {
                glitter.style.transform = 'translateY(100vh)';
                glitter.style.opacity = '0';
            });

            setTimeout(() => {
                glitter.remove();
            }, 5000);
        }
        function getRandomColor() {
        function getRandomColor() {
            const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        let partyEffect = setInterval(createGlitter, 10);
        // stop after 10 seconds
        setTimeout(() => {
            clearInterval(partyEffect);
        }, 10000);
        // stop after 10 seconds
        setTimeout(() => {
            clearInterval(partyEffect);
        }, 10000);
    },
    get_value: function (command) {
    get_value: function (command) {
        console.log("Starting party mode");
        return (Math.random() * 100);
    },

showAnimalGUI: function (ID) {
    showLayout(ID);
},

showLayout: function (idx) {
       const layouts = ['layout1', 'layout2'];
 layouts.forEach((l, i) => {
        const el = document.getElementById(l);
        if (!el) return;
        // Always remove 'leaving' before toggling 'visible'
        el.classList.remove('leaving');
        if (i === idx) {
            el.classList.add('visible');
        } else if (el.classList.contains('visible')) {
            el.classList.remove('visible');
            el.classList.add('leaving');
            // Remove 'leaving' after transition
            el.addEventListener('transitionend', function handler(e) {
                // Only remove if the transition is for transform or opacity
                if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                    el.classList.remove('leaving');
                    el.removeEventListener('transitionend', handler);
                }
            });
        } else {
            el.classList.remove('visible', 'leaving');
        }
    });
}

}
