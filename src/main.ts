import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let [width, height] = [400, 300];
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(width*2, height*2);
document.body.appendChild(renderer.domElement);

function f(x: number, z: number, out: THREE.Vector3): void {
    const y =  Math.cos(Math.sqrt(x**2 + z**2)) + 2;
    out.set(x, y, z);
}

function g(x: number, z: number, out: THREE.Vector3): void {
    const y = 0.1*(x**2 + z**2);
    out.set(x, y, z);
}

const EPS = 0.0001;

interface VertexInfo {
    vertices: number[],
    indices: number[],
    normals: number[],
    width?: number,
    depth?: number,
}

function surfaceVertexInfo(
    func: ((x: number, z: number, out: THREE.Vector3) => void),
    minX: number, maxX: number, minZ: number, maxZ: number
): VertexInfo {

    const density = 2; // point per one
    const numX = Math.ceil((maxX - minX) * density) + 1;
    const numZ = Math.ceil((maxZ - minZ) * density) + 1;
    const dx = (maxX - minX) / (numX - 1)
    const dz = (maxZ - minZ) / (numZ - 1)

    const p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
    const px = new THREE.Vector3(), pz = new THREE.Vector3();
    const pn = new THREE.Vector3()
    const vertices = [];
    const normals = [];

    for (let j = 0; j < numZ; ++j) {
        const z = minZ + j * dz;
        for (let i = 0; i < numX; ++i) {
            const x = minX + i * dx;
            
            func(x, z, p0);

            vertices.push(p0.x, p0.y, p0.z);

            func(x+EPS, z, p1);
            px.subVectors(p1, p0);
            func(x, z+EPS, p1);
            pz.subVectors(p1, p0);
            pn.crossVectors(pz, px).normalize();

            normals.push(pn.x, pn.y, pn.z);
        }
    }

    const indices = [];
    for (let j = 0; j < numZ - 1; ++j) {
        for (let i = 0; i < numX - 1; ++i) {
            const a = j * numX + i;
            const b = j * numX + i + 1;
            const c = (j+1) * numX + i;
            const d = (j+1) * numX + i + 1;
            indices.push(a, c, b); // triangle 1
            indices.push(b, c, d); // triangle 2
        }
    }

    return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        width: numX,
        depth: numZ,
    }
}

const zUp = new THREE.Matrix4(
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0,
    0, 0, 0, 1,
);

function meshFromVertexInfo(info: VertexInfo): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(info.indices);
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(info.vertices), 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(info.normals), 3));
    // const material = new THREE.MeshBasicMaterial({wireframe: true});
    // const material = new THREE.MeshPhongMaterial({color: 0x550000, transparent: false});
    const material = new THREE.MeshNormalMaterial();
    material.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geometry, material);
    // mesh.applyMatrix4(zUp);
    return mesh;
}

const [minX, maxX, minZ, maxZ] = [-5, 10, -5, 5];
const infoTop = surfaceVertexInfo(f, minX, maxX, minZ, maxZ);
const infoBot = surfaceVertexInfo(g, minX, maxX, minZ, maxZ);

const vertices: number[] = [];
const indices: number[] = [];
const normals: number[] = [];
const [w, d] = [infoTop.width, infoTop.depth];
if (!w || !d)
    throw new Error("need width and depth!");

for (let i = 0; i < w; ++i) {
    const idxBack = 3*i;
    const idxFront = 3*w*(d-1) + 3*i;
    vertices.push(...infoTop.vertices.slice(idxBack, idxBack+3));
    vertices.push(...infoBot.vertices.slice(idxBack, idxBack+3));
    vertices.push(...infoTop.vertices.slice(idxFront, idxFront+3));
    vertices.push(...infoBot.vertices.slice(idxFront, idxFront+3));
    if (i < w - 1) {
        const idx = 4*i;
        {
            const [a, b, c, d] = [idx, idx+1, idx+4, idx+4+1];
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
        {
            const [a, b, c, d] = [idx+2, idx+3, idx+4+2, idx+4+3];
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    normals.push(0, 0, -1);
    normals.push(0, 0, -1);
    normals.push(0, 0, 1);
    normals.push(0, 0, 1);
}

const skip = vertices.length/3;
for (let i = 0; i < d; ++i) {
    const idxLeft = 3*w*i;
    const idxRight = 3*w*i + 3*(w-1);
    vertices.push(...infoTop.vertices.slice(idxLeft, idxLeft+3));
    vertices.push(...infoBot.vertices.slice(idxLeft, idxLeft+3));
    vertices.push(...infoTop.vertices.slice(idxRight, idxRight+3));
    vertices.push(...infoBot.vertices.slice(idxRight, idxRight+3));
    if (i < d - 1) {
        const idx = skip+4*i;
        {
            const [a, b, c, d] = [idx, idx+1, idx+4, idx+4+1];
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
        {
            const [a, b, c, d] = [idx+2, idx+3, idx+4+2, idx+4+3];
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }
    normals.push(-1, 0, 0);
    normals.push(-1, 0, 0);
    normals.push(1, 0, 0);
    normals.push(1, 0, 0);
}

const infoWall: VertexInfo = {
    vertices: vertices,
    indices: indices, 
    normals: normals,
}

scene.add(meshFromVertexInfo(infoTop));
scene.add(meshFromVertexInfo(infoBot));
scene.add(meshFromVertexInfo(infoWall));


const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100);
pointLight.position.x = 0;
pointLight.position.y = 5;
pointLight.position.z = 0;
scene.add(pointLight);

camera.position.y = 3;
camera.position.z = 15;

function animate() {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);