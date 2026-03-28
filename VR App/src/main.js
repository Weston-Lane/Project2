import * as THREE from 'three';
import {Engine} from './Core/Engine.js'


const engine = new Engine();
engine.Init();



// 1. The Scene (The Container)
// const scene = new THREE.Scene();

// // 2. The Camera (The Viewpoint)
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;

// // 3. The Renderer (The "Painter")
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // 4. The Object (Geometry + Material = Mesh)
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// // 5. Lighting (Essential for MeshStandardMaterial)
// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(1, 1, 2);
// scene.add(light);

// // 6. Animation Loop
// function animate() {
//     requestAnimationFrame(animate);
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     renderer.render(scene, camera);
// }
// animate();



