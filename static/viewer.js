// Bronnen:
// - threejs.org (01/04/2026)
// - github.com/mrdoob/three.js (01/04/2026)

const viewerEl = document.getElementById('viewer');
const glbPath = viewerEl.dataset.glbPath;

// Tweak this to adjust how close the camera starts.
// Lower = closer. 1.0 is very tight, 3.0 is far out.
const ZOOM = 1.1;

function initViewer() {
    const width = viewerEl.clientWidth;
    const height = viewerEl.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    viewerEl.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x1e6fff, 0.6);
    rimLight.position.set(-5, 1, -4);
    scene.add(rimLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;
    controls.enablePan = false;
    controls.enableZoom = false;

    let rotateTimeout;
    let resetting = false;
    let initialCamPos = new THREE.Vector3();
    let initialTarget = new THREE.Vector3();

    renderer.domElement.addEventListener('pointerdown', () => {
        controls.autoRotate = false;
        resetting = false;
        clearTimeout(rotateTimeout);
    });
    renderer.domElement.addEventListener('pointerup', () => {
        rotateTimeout = setTimeout(() => {
            resetting = true;
        }, 2000);
    });

    const loader = new THREE.GLTFLoader();
    loader.load(
        glbPath,
        (gltf) => {
            scene.add(gltf.scene);

            // Auto-fit camera to entire scene
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            controls.target.copy(center);
            controls.minDistance = maxDim * 0.5;
            controls.maxDistance = maxDim * 10;

            camera.position.set(
                center.x + maxDim * ZOOM,
                center.y + maxDim * 0.3,
                center.z + maxDim * ZOOM
            );
            camera.near = maxDim * 0.01;
            camera.far = maxDim * 100;
            camera.updateProjectionMatrix();
            controls.update();
            initialCamPos.copy(camera.position);
            initialTarget.copy(controls.target);

            document.getElementById('viewer-loading').style.display = 'none';
        },
        (xhr) => {
            if (xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                const el = document.getElementById('viewer-loading');
                if (el) {
                    el.textContent = `Loading... ${pct}%`;
                }
            }
        },
        (err) => {
            console.error('GLB load error:', err);
            document.getElementById('viewer-loading').textContent = 'Failed to load model.';
        }
    );

    window.addEventListener('resize', () => {
        const w = viewerEl.clientWidth;
        const h = viewerEl.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    function animate() {
        requestAnimationFrame(animate);

        if (resetting) {
            // Disable controls so OrbitControls doesn't fight the lerp
            controls.enabled = false;
            camera.position.lerp(initialCamPos, 0.05);
            controls.target.lerp(initialTarget, 0.05);
            camera.lookAt(controls.target);

            if (camera.position.distanceTo(initialCamPos) < 0.8) {
                resetting = false;
                controls.enabled = true;
                controls.autoRotate = true;
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

initViewer();