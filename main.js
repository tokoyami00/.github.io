import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- 1. シーン、カメラ、レンダラーのセットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5; // カメラを少し後ろに引く

// --- 2. 光源 ---
// 環境光 (全体の明るさ)
const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
scene.add(ambientLight);

// オブジェクト内部から光が漏れるような点光源
const pointLight = new THREE.PointLight(0x00ffff, 100, 50); // 青緑色の光
pointLight.position.set(0, 0, 0); // オブジェクトの中心に配置
scene.add(pointLight);

// --- 3. ポストエフェクト (ブルーム効果で光の漏れを強調) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0; // 光る閾値 (0にすると全体が光りやすい)
bloomPass.strength = 1.2; // 光の強さ
bloomPass.radius = 0.8; // 光の広がり

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- 4. 3Dオブジェクトのロード (または代替オブジェクトの生成) ---
let artObject; // ロードされた3Dモデル、または代替オブジェクトを保持する変数

const loader = new GLTFLoader();
// ★ここをご自身の3Dモデルのパスに置き換えてください (例: './assets/my_art_object.glb')
// この例では、Three.js公式のシンプルな球体モデルを使用します。
// よりアートなモデルを使いたい場合は、GLBまたはGLTF形式のファイルを準備し、
// 以下の一行をコメントアウトして、その下のloader.loadのパスを変更してください。
const useDefaultOrb = true; 

if (useDefaultOrb) {
    // デフォルトの抽象的な球体を作成
    const geometry = new THREE.IcosahedronGeometry(1.8, 3); // サイズと複雑度を調整
    const material = new THREE.MeshStandardMaterial({
        color: 0x8888ff, // オブジェクトの色
        emissive: 0x00ffff, // オブジェクト自体が光る色
        emissiveIntensity: 0.5, // 光る強さ
        roughness: 0.2, // 表面の粗さ
        metalness: 0.8, // 金属感
        wireframe: false // ワイヤーフレーム表示かどうか
    });
    artObject = new THREE.Mesh(geometry, material);
    scene.add(artObject);
} else {
    // ★ GLTFモデルを読み込む場合 (上記useDefaultOrbをfalseにする)
    loader.load(
        './assets/your_art_object.glb', // ★ここを実際のモデルパスに変更！
        function (gltf) {
            artObject = gltf.scene;
            artObject.scale.set(1.5, 1.5, 1.5); // オブジェクトのサイズ調整
            // 必要に応じてマテリアルを調整 (例: emissiveを強くするなど)
            artObject.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x00ffff);
                    child.material.emissiveIntensity = 0.5;
                }
            });
            scene.add(artObject);
        },
        undefined, // onProgress コールバック
        function (error) {
            console.error('GLTFモデルのロード中にエラーが発生しました:', error);
            // ロード失敗時のフォールバックとして、デフォルトの球体を表示
            const geometry = new THREE.IcosahedronGeometry(1.8, 3);
            const material = new THREE.MeshStandardMaterial({ color: 0x8888ff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
            artObject = new THREE.Mesh(geometry, material);
            scene.add(artObject);
        }
    );
}


// --- 5. アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (artObject) {
        artObject.rotation.x += 0.003; // ゆっくり回転
        artObject.rotation.y += 0.005; // ゆっくり回転
        artObject.position.y = Math.sin(Date.now() * 0.0008) * 0.5; // 浮遊アニメーション
    }
    
    composer.render(); // ポストエフェクトを適用してレンダリング
}
animate();

// --- 6. ウィンドウリサイズへの対応 ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // コンポーザーもリサイズ
});

// --- 7. クリック (オブジェクトを掴む) 判定とモーダル表示 ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');

// 表示したい写真のパスを配列で定義
const photoWorks = [
    'photo1.jpg', 
    'photo2.jpg', 
    'photo3.jpg', 
    'photo4.jpg', 
    'photo5.jpg', 
    'photo6.jpg'
];
let currentPhotoIndex = 0; // 次に表示する写真のインデックス

window.addEventListener('click', (event) => {
    // マウスのクリック位置をThree.jsの座標系に変換
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (artObject) {
        // オブジェクトとの交差判定
        // `artObject.children` を使うのは、読み込んだGLTFモデルが複数のメッシュで構成されている場合があるため
        const intersects = raycaster.intersectObjects(artObject.children.length ? artObject.children : [artObject], true);

        if (intersects.length > 0) {
            // オブジェクトがクリックされた場合
            if (modal.classList.contains('hidden')) {
                // モーダルが非表示なら、次の作品を表示してモーダルを開く
                modalImg.src = photoWorks[currentPhotoIndex];
                currentPhotoIndex = (currentPhotoIndex + 1) % photoWorks.length; // 次の写真へ
                modal.classList.remove('hidden');
            } else {
                // モーダルが表示中なら、閉じる
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

// モーダル自体をクリックしても閉じるようにする
modal.addEventListener('click', () => {
    modal.classList.add('hidden');
});
