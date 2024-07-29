import * as THREE from 'three';
import * as mathjs from "mathjs";
import * as dat from "dat.gui";
import { Visualiser } from './Visualiser';
import { BoundsXZ } from './Utils';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Axes from "./Axes"

function f1(x: number, z: number): number {
    return Math.cos(Math.sqrt(x**2 + z**2)) + 2;
}

function f2(x: number, z: number): number {
    return -2;
}

function g1(x: number): number {
    return 0.1*x**2 - 4;
}

function g2(x: number): number {
    return Math.sin(x) + 4;
}

const a = -3;
const b = 5;

const bounds: BoundsXZ = {
    back: g1,
    front: g2,
    left: a,
    right: b,
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

// const state = Object.freeze({
//     SINGLE: Symbol("single"),
//     DOUBLE: Symbol("double"),
//     TRIPLE: Symbol("triple"),
// });

const THIN = 0.01;
const state = {
    x: 0,
    y: 0,
    z: 0,

    t_f1: THIN,
    t_f2: THIN,
    t_g1: THIN,
    t_g2: THIN,
    t_a: THIN,
    t_b: THIN,

    f1: "cos(sqrt(x^2 + z^2)) + 2",
    f2: "-2",
    g1: "0.1*x^2 - 4",
    g2: "sin(x) + 4",
    a: "-8.47",
    b: "9.11",
}

function updateAll() {
    updateX();
    updateY();
    updateZ();
}

// maybe change left right to type () => number
function updateX() {
    const a = mathjs.evaluate(state.a);
    const b = mathjs.evaluate(state.b);
    vis.bounds.left = state.x + state.t_a*(a - state.x)/2; // TODO REMOVE /2
    vis.bounds.right = state.x + state.t_b*(b - state.x)/2;
    vis.needsUpdate = true;
}

function updateZ() {
    const g1Code = mathjs.compile(state.g1)
    const g2Code = mathjs.compile(state.g2)
    const g1 = (x: number) => g1Code.evaluate({x: x});
    const g2 = (x: number) => g2Code.evaluate({x: x});
    vis.bounds.back = (x: number) => state.z + state.t_g1 * (g1(x) - state.z)
    vis.bounds.front = (x: number) => state.z + state.t_g2 * (g2(x) - state.z)
    vis.needsUpdate = true;
}

function updateY() {
    const f1Code = mathjs.compile(state.f1)
    const f2Code = mathjs.compile(state.f2)
    const f1 = (x: number, z: number) => f1Code.evaluate({x: x, z: z});
    const f2 = (x: number, z: number) => f2Code.evaluate({x: x, z: z});
    vis.top = (x: number, z: number) => state.y + state.t_f1 * (f1(x, z) - state.y)
    vis.bot = (x: number, z: number) => state.y + state.t_f2 * (f2(x, z) - state.y)
    vis.needsUpdate = true;
}

gui.add(state, "f2").onFinishChange(updateY);
gui.add(state, "f1").onFinishChange(updateY);
gui.add(state, "g2").onFinishChange(updateZ);
gui.add(state, "g1").onFinishChange(updateZ);
gui.add(state, "b").onFinishChange(updateX);
gui.add(state, "a").onFinishChange(updateX);
gui.add(state, "x", vis.minX, vis.maxX, 0.01).onChange(updateX);
gui.add(state, "y", vis.minX, vis.maxX, 0.01).onChange(updateY);
gui.add(state, "z", vis.minX, vis.maxX, 0.01).onChange(updateZ);
// gui.add(state, "z", vis.minX, vis.maxX, 0.01).onChange(leftRight);

const folders = {
    single: gui.addFolder("Integrate along y"),
    double: gui.addFolder("Integrate along z"),
    triple: gui.addFolder("Integrate along x"),
}

folders.single.add(state, "t_f2", THIN, 1, 0.01).onChange(updateY);
folders.single.add(state, "t_f1", THIN, 1, 0.01).onChange(updateY);
folders.double.add(state, "t_g2", THIN, 1, 0.01).onChange(updateZ);
folders.double.add(state, "t_g1", THIN, 1, 0.01).onChange(updateZ);
folders.triple.add(state, "t_b", THIN, 1, 0.01).onChange(updateX);
folders.triple.add(state, "t_a", THIN, 1, 0.01).onChange(updateX);

// const thing = gui.add(bounds, "left", 8.47, -0.01).onChange(() => vis.needsUpdate = true);

// gui.add(bounds, "left", -8.47, -0.01).onChange(() => vis.needsUpdate = true);
// gui.add(bounds, "right", 0.01, 9.11).onChange(() => vis.needsUpdate = true);
// gui.add(controller, "g2").onFinishChange(() => {
//     const node = mathjs.parse(controller.g2);
//     const code = node.compile()

//     // const thingy = mathjs.evaluate("g2(x)=" + Controller.g2);
//     bounds.front = (x: number) => code.evaluate({x: x});
//     vis.needsUpdate = true;
//     // console.log(thingy({x: 2}));
// });
// gui.add(Controller, "g1")

const axes = new Axes()
axes.grids.forEach((grid) => {
    scene.add(grid);
});

updateAll();
function animate() {
    controls.update();
    renderer.render(scene, camera);

    // vis.bounds.right += 0.1;
    // vis.needsUpdate = true;
    vis.update();
}
renderer.setAnimationLoop(animate);