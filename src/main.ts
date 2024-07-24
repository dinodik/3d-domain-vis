import * as THREE from 'three';

let [width, height] = [400, 300];
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

function f(x: number, z: number, target: THREE.Vector3): void {
    const y =  Math.cos(Math.sqrt(x**2 + z**2));
    target.set(x, y, z)
}

const gridSize = 20;
const numPoints = gridSize + 1;
const [min, max] = [-7, 7];
const dx = (max - min) / gridSize;

const EPS = 0.0001;
const p0 = new THREE.Vector3(), p1 = new THREE.Vector3();
const px = new THREE.Vector3(), pz = new THREE.Vector3();
const pn = new THREE.Vector3()
const vertices = new Float32Array(3 * numPoints**2);
const normals = new Float32Array(3 * numPoints**2);
for (let j = 0; j < numPoints; ++j) {
    const z = min + j * dx;
    for (let i = 0; i < numPoints; ++i) {
        const idx = 3 * (j*numPoints + i);
        const x = min + i * dx;
        
        f(x, z, p0);

        vertices[idx] = p0.x;
        vertices[idx+1] = p0.y;
        vertices[idx+2] = p0.z;

        f(x+EPS, z, p1);
        px.subVectors(p1, p0);
        f(x, z+EPS, p1);
        pz.subVectors(p1, p0);
        pn.crossVectors(pz, px).normalize();

        normals[idx] = pn.x;
        normals[idx+1] = pn.y;
        normals[idx+2] = pn.z;
    }
}
console.log(vertices);
console.log(normals);

const indices: number[] = Array(6 * gridSize**2);
for (let j = 0; j < gridSize; ++j) {
    for (let i = 0; i < gridSize; ++i) {
        const idx = 6 * (j * gridSize + i);
        const a = j * numPoints + i;
        const b = j * numPoints + i + 1;
        const c = (j+1) * numPoints + i;
        const d = (j+1) * numPoints + i + 1;
        // triangle 1
        indices[idx+0] = a;
        indices[idx+1] = c;
        indices[idx+2] = b;
        // triangle 2
        indices[idx+3] = b;
        indices[idx+4] = c;
        indices[idx+5] = d;
    }
}

const geometry = new THREE.BufferGeometry();
geometry.setIndex(indices);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute("normal", new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshNormalMaterial();
// const material = new THREE.MeshBasicMaterial({
//     color: 0xff0000,
//     wireframe: true,
// });
// const material = new THREE.MeshPhongMaterial()
material.side = THREE.DoubleSide;
// material.shininess = 100;
// material.specular = new THREE.Color(0x1188ff);

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.7);
pointLight.position.x = 0;
pointLight.position.y = 5;
pointLight.position.z = 0;
scene.add(pointLight);

camera.position.y = 3;
camera.position.z = 15;

function animate() {
    // mesh.rotateX(0.01);
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);