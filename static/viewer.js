// Bronnen:
// - threejs.org (01/04/2026)
// - github.com/mrdoob/three.js (01/04/2026)

const viewerEl = document.getElementById('viewer');
const carNodeName = viewerEl.dataset.carNode;
const glbPath = viewerEl.dataset.glbPath;

function fitCameraToNode(node, camera, controls) {
    const box = new THREE.Box3().setFromObject(node);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    controls.target.copy(center);
    camera.position.set(
        center.x + maxDim * 1.8,
        center.y + maxDim * 0.7,
        center.z + maxDim * 1.8
    );
    camera.near = maxDim * 0.01;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();
    controls.update();
}

function initViewer() {
    const width = viewerEl.clientWidth;
    const height = viewerEl.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    viewerEl.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Accent rim light matching the CSS yellow
    const rimLight = new THREE.DirectionalLight(0xf5c518, 0.5);
    rimLight.position.set(-5, 1, -4);
    scene.add(rimLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    // Stop auto-rotate on user interaction, resume after 2s idle
    let rotateTimeout;
    renderer.domElement.addEventListener('pointerdown', () => {
        controls.autoRotate = false;
        clearTimeout(rotateTimeout);
    });
    renderer.domElement.addEventListener('pointerup', () => {
        rotateTimeout = setTimeout(() => {
            controls.autoRotate = true;
        }, 2000);
    });

    const loader = new THREE.GLTFLoader();

    loader.load(
        glbPath,
        (gltf) => {
            const root = gltf.scene;
            scene.add(root);

            let targetNode = null;

            root.traverse((node) => {
                if (node.name === 'RootNode') {
                    node.children.forEach((child) => {
                        child.visible = child.name === carNodeName;
                        if (child.name === carNodeName) {
                            targetNode = child;
                        }
                    });
                }
            });

            if (targetNode) {
                fitCameraToNode(targetNode, camera, controls);
            }

            document.getElementById('viewer-loading').style.display = 'none';
        },
        (xhr) => {
            // Update loading progress
            if (xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                const loadingEl = document.getElementById('viewer-loading');
                if (loadingEl) {
                    loadingEl.textContent = `Laden... ${pct}%`;
                }
            }
        },
        (error) => {
            console.error('GLB load error:', error);
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
