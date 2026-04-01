// Bronnen:
// - threejs.org (01/04/2026)
// - github.com/mrdoob/three.js (01/04/2026)

const viewerEl = document.getElementById('viewer');
const glbPath = viewerEl.dataset.glbPath;

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
    const rimLight = new THREE.DirectionalLight(0xf5c518, 0.5);
    rimLight.position.set(-5, 1, -4);
    scene.add(rimLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;
    controls.enablePan = false;

    let rotateTimeout;
    renderer.domElement.addEventListener('pointerdown', () => {
        controls.autoRotate = false;
        clearTimeout(rotateTimeout);
    });
    renderer.domElement.addEventListener('pointerup', () => {
        rotateTimeout = setTimeout(() => { controls.autoRotate = true; }, 2000);
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
                center.x + maxDim * 2.2,
                center.y + maxDim * 0.3,
                center.z + maxDim * 2.2
            );
            camera.near = maxDim * 0.01;
            camera.far = maxDim * 100;
            camera.updateProjectionMatrix();
            controls.update();

            document.getElementById('viewer-loading').style.display = 'none';
        },
        (xhr) => {
            if (xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                const el = document.getElementById('viewer-loading');
                if (el) el.textContent = `Laden... ${pct}%`;
            }
        },
        (err) => {
            console.error('GLB load error:', err);
            document.getElementById('viewer-loading').textContent = 'Model kon niet worden geladen.';
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
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

initViewer();
