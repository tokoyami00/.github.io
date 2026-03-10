import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// ブルーム効果（光の漏れ）の設定
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

// 代替オブジェクト（3Dモデルがない場合の球体）
const geometry = new THREE.IcosahedronGeometry(1.5, 2);
const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true, emissive: 0x005555 });
const orb = new THREE.Mesh(geometry, material);
scene.add(orb);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    orb.rotation.x += 0.005;
    orb.rotation.y += 0.01;
    orb.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    composer.render();
}
animate();

// クリック判定
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];

window.addEventListener('click', () => {
    if (modal.classList.contains('hidden')) {
        modalImg.src = photos[Math.floor(Math.random() * photos.length)];
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
});
