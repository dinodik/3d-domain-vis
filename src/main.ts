import * as THREE from 'three';
import { Visualiser } from './Axis';
import { BoundsXZ } from './Utils';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function f(x: number, z: number): number {
    return Math.cos(Math.sqrt(x**2 + z**2)) + 2;
}

function g(x: number, z: number): number {
    return -2;
}

function g1(x: number): number {
    return 0.1*x**2 - 4;
}

function g2(x: number): number {
    return Math.sin(x) + 4;
}

const bounds: BoundsXZ = {
    back: g1,
    front: g2,
    left: -3,
    right: 5,
}

const vis = new Visualiser(bounds);

let [width, height] = [400, 300];
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
camera.zoom = 0.8 * Math.min(width / (vis.maxX - vis.minX), height / (vis.maxY - vis.minY));
camera.updateProjectionMatrix();
camera.updateMatrix();

scene.add( camera );
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(width, height);
scene.frustumCulled = false;
document.body.appendChild(renderer.domElement);

vis.getMeshes().map((mesh) => scene.add(mesh));

vis.getMeshes().forEach((info) => {
    scene.add(info);
});

// const cube = new THREE.BoxGeometry(1, 1, 1);
// const mat = new THREE.MeshBasicMaterial({color: 0xff0000})
// const mesh = new THREE.Mesh(cube, mat);
// scene.add(mesh);

// LIGHTING
// const ambientLight = new THREE.AmbientLight(0xffffff, 5);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 100);
// pointLight.position.x = 0;
// pointLight.position.y = 5;
// pointLight.position.z = 0;
// scene.add(pointLight);

camera.position.y = 3;
camera.position.z = 15;

function animate() {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
// animate();