// flagwave.js
// Bronnen:
// - developer.mozilla.org/en-US/docs/Web/API/Canvas_API (02/04/2026)
// - flagcdn.com (02/04/2026)

function initFlagWave(canvasId, flagUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { return; }

    const ctx = canvas.getContext('2d');

    const STRIP_W       = 2;
    const AMPLITUDE     = 32;
    const FREQUENCY     = 0.022;
    const SPEED         = 0.055;
    const GLOSS_WIDTH   = 0.18;
    const GLOSS_OPACITY = 0.22;

    // How much extra flag we render beyond canvas edges to cover wave displacement
    const PAD = AMPLITUDE * 5;

    let time = 0;
    let offscreen = null;

    function buildOffscreen() {
        offscreen = document.createElement('canvas');
        offscreen.width  = canvas.width;
        // Taller than canvas by PAD on each side so displaced strips always have image content
        offscreen.height = canvas.height + PAD * 2;
        const oc = offscreen.getContext('2d');
        oc.drawImage(img, 0, 0, offscreen.width, offscreen.height);
    }

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (img.complete && img.naturalWidth > 0) { buildOffscreen(); }
    }

    function draw() {
        const W  = canvas.width;
        const H  = canvas.height;
        const OH = H + PAD * 2;

        ctx.clearRect(0, 0, W, H);

        const cols = Math.ceil(W / STRIP_W);

        for (let i = 0; i < cols; i++) {
            const x = i * STRIP_W;
            // Taper: left edge (pole) barely moves, right edge gets full amplitude
            const taper   = Math.pow(i / cols, 0.9);
            const sinVal  = Math.sin(i * FREQUENCY - time);
            const yOffset = sinVal * AMPLITUDE * taper;

            // Source from the oversized offscreen - always from the top.
            // Destination starts at yOffset - PAD so the strip is centred
            // correctly and the extra PAD pixels above/below cover the gaps.
            ctx.drawImage(
                offscreen,
                x, 0, STRIP_W, OH,
                x, yOffset - PAD, STRIP_W, OH
            );

            // Shading: light highlight on forward peaks, shadow in valleys
            if (sinVal > 0) {
                ctx.fillStyle = `rgba(255,255,255,${sinVal * 0.10 * taper})`;
            } else {
                ctx.fillStyle = `rgba(0,0,0,${-sinVal * 0.18 * taper})`;
            }
            // Cover only the visible strip on canvas (not the PAD extensions)
            ctx.fillRect(x, 0, STRIP_W, H);
        }

        // Moving gloss highlight
        const glossX = ((time * 28) % (W * (1 + GLOSS_WIDTH))) - W * GLOSS_WIDTH;
        const glossW = W * GLOSS_WIDTH;
        const gloss  = ctx.createLinearGradient(glossX, 0, glossX + glossW, 0);
        gloss.addColorStop(0,   'rgba(255,255,255,0)');
        gloss.addColorStop(0.4, `rgba(255,255,255,${GLOSS_OPACITY})`);
        gloss.addColorStop(0.6, `rgba(255,255,255,${GLOSS_OPACITY})`);
        gloss.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(0, 0, W, H);

        time += SPEED;
    }

    function loop() {
        draw();
        requestAnimationFrame(loop);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { resize(); loop(); };
    img.onerror = () => { console.warn('Flag failed to load:', flagUrl); };
    img.src = flagUrl;

    window.addEventListener('resize', resize);
}