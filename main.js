import * as THREE from 'three';

// 1. シーン、カメラ、レンダラーの準備
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#webgl'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. アートなオブジェクト（光が漏れる複雑な形状の例）
const geometry = new THREE.IcosahedronGeometry(1, 2);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
const orb = new THREE.Mesh(geometry, material);
scene.add(orb);

// 3. アニメーション（回転・浮遊）
function animate() {
    requestAnimationFrame(animate);
    orb.rotation.x += 0.01;
    orb.rotation.y += 0.01;
    orb.position.y = Math.sin(Date.now() * 0.002) * 0.5; // 浮遊
    renderer.render(scene, camera);
}
animate();

// 4. クリック（掴む）判定
window.addEventListener('click', (e) => {
    // ここでクリック座標とオブジェクトの衝突判定を行い、
    // 写真を表示する処理を呼び出す
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal-img').src = 'photo1.jpg';
});