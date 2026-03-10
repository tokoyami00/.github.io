import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- 1. 基本セットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5;

// --- 2. 光源 ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 全体的な環境光
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffff, 100, 100); // 青白い光
pointLight.position.set(0, 0, 0); // オブジェクトの中心から
scene.add(pointLight);

// --- 3. ポストエフェクト（ブルーム効果で光の漏れを表現） ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0; // 光る閾値 (0にすると全体が光りやすい)
bloomPass.strength = 1.0; // 光の強さ
bloomPass.radius = 0.5; // 光の広がり

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- 4. 3Dモデルのロードと設定 ---
let loadedObject;
const loader = new GLTFLoader();
loader.load(
    // 'assets/your_art_object.gltf', // ★ここにあなたの3Dモデルのパスを指定
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb', // テスト用GLTF (Three.js公式サンプル)
    function (gltf) {
        loadedObject = gltf.scene;
        loadedObject.scale.set(1, 1, 1); // オブジェクトのサイズ調整
        scene.add(loadedObject);

        // モデルにマテリアルがない場合、ワイヤーフレームを設定
        loadedObject.traverse((child) => {
            if (child.isMesh) {
                // child.material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
                // もしモデルにテクスチャがある場合は上記をコメントアウト
            }
        });
    },
    undefined, // onProgress コールバック
    function (error) {
        console.error('An error happened while loading the GLTF model:', error);
        // エラー時のフォールバックとして、球体を表示
        const geometry = new THREE.IcosahedronGeometry(2, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0x8888ff, wireframe: true, transparent: true, opacity: 0.8 });
        loadedObject = new THREE.Mesh(geometry, material);
        scene.add(loadedObject);
    }
);


// --- 5. アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (loadedObject) {
        loadedObject.rotation.x += 0.005;
        loadedObject.rotation.y += 0.008;
        loadedObject.position.y = Math.sin(Date.now() * 0.0005) * 0.8; // 浮遊アニメーション
    }
    
    composer.render(); // ポストエフェクトを適用してレンダリング
}
animate();

// --- 6. リサイズ対応 ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- 7. クリック（掴む）判定とモーダル表示 ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');

const photoWorks = [
    'photo1.jpg', 'photo2.jpg', 'photo3.jpg', 
    'photo4.jpg', 'photo5.jpg', 'photo6.jpg'
];
let currentPhotoIndex = 0;

window.addEventListener('click', (event) => {
    // クリック位置を正規化
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    if (loadedObject) {
        // オブジェクトとの交差判定
        const intersects = raycaster.intersectObjects(loadedObject.children.length ? loadedObject.children : [loadedObject], true);

        if (intersects.length > 0) {
            // オブジェクトがクリックされた！
            if (modal.classList.contains('hidden')) {
                // 次の作品を表示
                modalImg.src = photoWorks[currentPhotoIndex];
                currentPhotoIndex = (currentPhotoIndex + 1) % photoWorks.length;
                modal.classList.remove('hidden');
            } else {
                // モーダルが開いている場合は閉じる
                modal.classList.add('hidden');
            }
        } else {
             // オブジェクト以外がクリックされた場合はモーダルを閉じる
             if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
             }
        }
    }
});

// モーダルをクリックで閉じる
modal.addEventListener('click', () => {
    modal.classList.add('hidden');
});
