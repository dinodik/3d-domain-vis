import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// calcuate domain values first then just pass into functions

let [width, height] = [400, 300];
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(width*2, height*2);
document.body.appendChild(renderer.domElement);

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

const EPS = 0.0001;
const density = 1;

interface VertexInfo {
    vertices: number[],
    indices: number[],
    normals: number[],
    width?: number,
    depths?: number[],
}

// (x, y, z) s.t. {y = func(x, z), g1(x) < z < g2(x), a < x < b}
// TODO handling of mismatched columns is botched
function generateSurface3D(
    func: ((x: number, z: number) => number),
    g1: ((x: number) => number), g2: ((x: number) => number),
    a: number, b: number,
    upIsOut?: true,
): VertexInfo {
    // TODO: make these arrays?
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const depths: number[] = [];

    const numX = Math.ceil((b - a) * density) + 1;
    const dx = (b - a) / (numX - 1);

    // Useful vectors to keep around
    const p0 = new THREE.Vector3
    const px = new THREE.Vector3(EPS, 0, 0), pz = new THREE.Vector3(0, 0, EPS);
    const pn = new THREE.Vector3;
    
    const G1 = new Float32Array(numX);
    const G2 = new Float32Array(numX);

    let lastNumZ = 0;
    let idx = 0;
    for (let i = 0; i < numX; ++i) {
        depths.push(idx); // the index of the first element of every column

        const x = a + i*dx
        const [c, d] = [g1(x), g2(x)];
        G1[i] = c;
        G2[i] = d;
        // TODO: alternatively sample at regular grid points then add an additional row
        const numZ = Math.ceil((d - c) * density) + 1;
        const diff = lastNumZ - numZ; // for seeing if columns are mismatched
        const dz = (d - c) / (numZ - 1); // check if inf
        
        p0.x = x;
        for (let k = 0; k < numZ; ++k) {
            const z = c + k*dz;
            // Get vertex values
            p0.z = z;
            p0.y = func(x, z);
            vertices.push(p0.x, p0.y, p0.z);

            // Get normal values
            px.y = func(x + EPS, z) - p0.y;
            pz.y = func(x, z + EPS) - p0.y;
            pn.crossVectors(pz, px).normalize(); // check upIsOut
            normals.push(pn.x, pn.y, pn.z);

            // Get indices (+x right, +z down);
            if (i !== 0 && k !== 0) {
                if (k < lastNumZ) {
                    const [botRight, topRight, botLeft, topLeft] = [idx, idx-1, idx-lastNumZ, idx-lastNumZ-1];
                    indices.push(topLeft, botLeft, topRight);
                    indices.push(topRight, botLeft, botRight);
                    if (k === numZ-1) { // check if extra triangles are needed in case vertex shortage
                        for (let j = 0; j < diff; ++j) {
                            indices.push(idx, idx-lastNumZ+j, idx-lastNumZ+j+1);
                        }
                    }
                } else { // there is an excess of verts
                    indices.push(idx, idx-1, idx-k-1);
                }
            }
            
            ++idx;
        }

        lastNumZ = numZ;
    }
    
    return {
        vertices: vertices,
        normals: normals,
        indices: indices,
        width: numX,
        depths: depths,
    };
}

// knits together two surfaces that have the same x-z shadow
function joinSurfaces3D(top: VertexInfo, bot: VertexInfo): VertexInfo {
    if (top.vertices.length !== bot.vertices.length)
        throw new Error("Surface mismatch!");

    if (!top.width || !top.depths)
        throw new Error("Missing width and depth info for surfaces");

    const numPoints = top.vertices.length;
    const width = top.width;
    const depths = top.depths;
        
    const vertices: number[] = [];
    const normals: number[] = [];
    // const indices = top.indices.concat(bot.indices);
    const indices: number[] = [];

    // left
    vertices.push(...top.vertices.slice(0, 3*depths[1]));
    vertices.push(...bot.vertices.slice(0, 3*depths[1]));
    for (let i = 0; i < depths[1]-1; ++i) {
        indices.push(i, i+depths[1], i+1);
        indices.push(i+1, i+depths[1], i+depths[1]+1);
    }

    return {
        vertices: vertices,
        normals: normals,
        indices: indices,
    };
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

// const [w, d] = [infoTop.width, infoTop.depth];
// if (!w || !d)
//     throw new Error("need width and depth!");

// for (let i = 0; i < w; ++i) {
//     const idxBack = 3*i;
//     const idxFront = 3*w*(d-1) + 3*i;
//     vertices.push(...infoTop.vertices.slice(idxBack, idxBack+3));
//     vertices.push(...infoBot.vertices.slice(idxBack, idxBack+3));
//     vertices.push(...infoTop.vertices.slice(idxFront, idxFront+3));
//     vertices.push(...infoBot.vertices.slice(idxFront, idxFront+3));
//     if (i < w - 1) {
//         const idx = 4*i;
//         {
//             const [a, b, c, d] = [idx, idx+1, idx+4, idx+4+1];
//             indices.push(a, c, b);
//             indices.push(b, c, d);
//         }
//         {
//             const [a, b, c, d] = [idx+2, idx+3, idx+4+2, idx+4+3];
//             indices.push(a, b, c);
//             indices.push(b, d, c);
//         }
//     }
//     normals.push(0, 0, -1);
//     normals.push(0, 0, -1);
//     normals.push(0, 0, 1);
//     normals.push(0, 0, 1);
// }

// const skip = vertices.length/3;
// for (let i = 0; i < d; ++i) {
//     const idxLeft = 3*w*i;
//     const idxRight = 3*w*i + 3*(w-1);
//     vertices.push(...infoTop.vertices.slice(idxLeft, idxLeft+3));
//     vertices.push(...infoBot.vertices.slice(idxLeft, idxLeft+3));
//     vertices.push(...infoTop.vertices.slice(idxRight, idxRight+3));
//     vertices.push(...infoBot.vertices.slice(idxRight, idxRight+3));
//     if (i < d - 1) {
//         const idx = skip+4*i;
//         {
//             const [a, b, c, d] = [idx, idx+1, idx+4, idx+4+1];
//             indices.push(a, b, c);
//             indices.push(b, d, c);
//         }
//         {
//             const [a, b, c, d] = [idx+2, idx+3, idx+4+2, idx+4+3];
//             indices.push(a, c, b);
//             indices.push(b, c, d);
//         }
//     }
//     normals.push(-1, 0, 0);
//     normals.push(-1, 0, 0);
//     normals.push(1, 0, 0);
//     normals.push(1, 0, 0);
// }

// const infoWall: VertexInfo = {
//     vertices: vertices,
//     indices: indices, 
//     normals: normals,
// }

const topInfo = generateSurface3D(f, g1, g2, -5, 5);
const botInfo = generateSurface3D(g, g1, g2, -5, 5);
// const volumeInfo = joinSurfaces3D(topInfo, botInfo);
// scene.add(meshFromVertexInfo(volumeInfo));
scene.add(meshFromVertexInfo(topInfo));
scene.add(meshFromVertexInfo(botInfo));

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