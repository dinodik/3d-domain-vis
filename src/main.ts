import * as THREE from 'three';
import * as mathjs from "mathjs";
import * as dat from "dat.gui";
import { Visualiser } from './Visualiser';
import { BoundsXZ } from './Utils';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Axes from "./Axes"

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

let [width, height] = [window.innerWidth, window.innerHeight];
// let [width, height] = [400, 300];
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
camera.zoom = 0.6 * Math.min(width / (vis.maxX - vis.minX), height / (vis.maxY - vis.minY));
camera.updateProjectionMatrix();
camera.updateMatrix();

scene.add( camera );
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
renderer.setSize(width, height);
scene.frustumCulled = false;
document.querySelector("#canvas")?.appendChild(renderer.domElement);

vis.getMeshes().map((mesh) => scene.add(mesh));

vis.getMeshes().forEach((info) => {
    scene.add(info);
});

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

let gui = new dat.GUI({autoPlace: false});
document.querySelector("#gui")?.append(gui.domElement);

const Controller = {
    // left: bounds.left,
    // right: bounds.right,
    g2: "",
    g1: "",
}

gui.add(bounds, "left", -8.47, -0.01).onChange(() => vis.needsUpdate = true);
gui.add(bounds, "right", 0.01, 9.11).onChange(() => vis.needsUpdate = true);
gui.add(Controller, "g2").onFinishChange(() => {
    const node = mathjs.parse(Controller.g2);
    const code = node.compile()

    // const thingy = mathjs.evaluate("g2(x)=" + Controller.g2);
    bounds.front = (x: number) => code.evaluate({x: x});
    vis.needsUpdate = true;
    // console.log(thingy({x: 2}));
});
// gui.add(Controller, "g1")

const axes = new Axes()
axes.grids.forEach((grid) => {
    scene.add(grid);
});

function animate() {
    controls.update();
    renderer.render(scene, camera);

    // vis.bounds.right += 0.1;
    // vis.needsUpdate = true;
    vis.update();
}
renderer.setAnimationLoop(animate);
// animate();