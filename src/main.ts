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

const a = -8.47;
const b = 9.11;

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
const state = vis.state;

function updateAll() {
    updateX();
    updateY();
    updateZ();
}

// maybe change left right to type () => number
function updateX() {
    vis.bounds.left = mathjs.evaluate(funcState.a);
    vis.bounds.right = mathjs.evaluate(funcState.b);
    vis.needsUpdate = true;
}

function updateZ() {
    const g1Code = mathjs.compile(funcState.g1)
    const g2Code = mathjs.compile(funcState.g2)
    vis.bounds.back = (x: number) => g1Code.evaluate({x: x});
    vis.bounds.front = (x: number) => g2Code.evaluate({x: x});
    vis.needsUpdate = true;
}

function updateY() {
    const f1Code = mathjs.compile(funcState.f1)
    const f2Code = mathjs.compile(funcState.f2)
    vis.bot = (x: number, z: number) => f1Code.evaluate({x: x, z: z});
    vis.top = (x: number, z: number) => f2Code.evaluate({x: x, z: z});
    vis.needsUpdate = true;
}

const funcState = {
    f2: "cos(sqrt(x^2 + z^2)) + 4",
    f1: "-2",
    g2: "sin(x) + 4",
    g1: "0.1*x^2 - 4",
    b: "5",// "9.11",
    a: "-5"// "-8.47",
}

// const funcState = {
//     f2: "8-x^2-z^2",
//     f1: "x^2 + 3*z^2",
//     g2: "sqrt(2-0.5*x^2)",
//     g1: "-sqrt(2-0.5*x^2)",
//     b: "1.99",// "9.11",
//     a: "-1.99"// "-8.47",
// }

const temp = {
    density: vis.density,
}

function update() {
    vis.needsUpdate = true;
}

gui.add(funcState, "f2").onFinishChange(updateY);
gui.add(funcState, "f1").onFinishChange(updateY);
gui.add(funcState, "g2").onFinishChange(updateZ);
gui.add(funcState, "g1").onFinishChange(updateZ);
gui.add(funcState, "b").onFinishChange(updateX);
gui.add(funcState, "a").onFinishChange(updateX);
gui.add(state, "x", vis.bounds.left, vis.bounds.right, 0.01).onChange(update);
gui.add(state, "y", vis.minX, vis.maxX, 0.01).onChange(update);
gui.add(state, "z", vis.minX, vis.maxX, 0.01).onChange(update);
gui.add(temp, "density", 0.1, 4, 0.01).onChange(() => {vis.density = temp.density; update()});

const folders = {
    single: gui.addFolder("Integrate along y"),
    double: gui.addFolder("Integrate along z"),
    triple: gui.addFolder("Integrate along x"),
}

folders.single.add(state, "t_f2", THIN, 1, 0.01).onChange(update);
folders.single.add(state, "t_f1", THIN, 1, 0.01).onChange(update);
folders.double.add(state, "t_g2", THIN, 1, 0.01).onChange(update);
folders.double.add(state, "t_g1", THIN, 1, 0.01).onChange(update);
folders.triple.add(state, "t_b", THIN, 1, 0.01).onChange(update);
folders.triple.add(state, "t_a", THIN, 1, 0.01).onChange(update);

const hidden = gui.addFolder("Visible");
hidden.add(vis.meshes[0], "visible").onChange(update).name("top");
hidden.add(vis.meshes[1], "visible").onChange(update).name("bot");
hidden.add(vis.meshes[2], "visible").onChange(update).name("back");
hidden.add(vis.meshes[3], "visible").onChange(update).name("front");
hidden.add(vis.meshes[4], "visible").onChange(update).name("left");
hidden.add(vis.meshes[5], "visible").onChange(update).name("right");

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