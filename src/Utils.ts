import * as THREE from 'three';

const EPS = 0.0001;

export interface BoundsXZ {
    back: ((x: number) => number), // z = g1(x);
    front: ((x: number) => number), // z = g2(x);
    left: number,
    right: number,
};

export interface GridXZ {
    x: Float32Array, // discretised x-values
    z: Float32Array, // grid of discretised z-values
    numsZ: Int32Array, // length of z-array for each column along x // index of the first z-values in each column along x
    indices: number[], // for building mesh
};

export interface VertexInfo {
    vertices: Float32Array,
    normals: Float32Array,
    indices: number[],
};

export function discretiseArea(bounds: BoundsXZ, density: number): GridXZ {
    const numX = Math.ceil((bounds.right - bounds.left) * density) + 1;
    const dx = (bounds.right - bounds.left) / (numX - 1);

    const X = new Float32Array(numX);
    const Z = [];
    const numsZ = new Int32Array(numX);
    const indices = [];

    let idx = 0;
    for (let i = 0; i < numX; ++i) {
        const x = bounds.left + i*dx;
        X[i] = x;
        
        const [back, front] = [bounds.back(x), bounds.front(x)];
        const numZ = Math.ceil((front - back) * density) + 1; // check if negative
        numsZ[i] = numZ;
        const dz = (front - back) / (numZ - 1); // check if inf

        for (let k = 0; k < numZ; ++k) {
            const z = back + k*dz;
            Z.push(z);

            if (i !== 0 && k !== 0) {
                const lastNumZ = numsZ[i-1]
                if (k < lastNumZ) {
                    const [botRight, topRight, botLeft, topLeft] = [idx, idx-1, idx-lastNumZ, idx-lastNumZ-1];
                    indices.push(topLeft, botLeft, topRight);
                    indices.push(topRight, botLeft, botRight);
                    if (k === numZ-1) { // check if extra triangles are needed in case vertex shortage
                        for (let j = 0; j < numsZ[i-1] - numZ; ++j) {
                            indices.push(idx, idx-lastNumZ+j, idx-lastNumZ+j+1);
                        }
                    }
                } else { // there is an excess of verts
                    indices.push(idx, idx-1, idx-k-1);
                }
            }

            ++idx;
        }
    }

    return {
        x: X,
        z: new Float32Array(Z),
        numsZ: numsZ,
        indices: indices,
    };
}

export function generateSurface(func: (x: number, z: number) => number, grid: GridXZ, upIsOut: boolean = true): VertexInfo {
    const vertices: number[] = [];
    const normals: number[] = [];

    // Useful vectors to keep around
    const p0 = new THREE.Vector3
    const px = new THREE.Vector3(EPS, 0, 0), pz = new THREE.Vector3(0, 0, EPS);
    const pn = new THREE.Vector3;

    let zStart = 0;
    grid.x.forEach((x, i) => {
        for (let k = 0; k < grid.numsZ[i]; ++k) {
            const z = grid.z[zStart + k];

            // Get vertex values
            p0.x = x;
            p0.z = z;
            p0.y = func(x, z);
            vertices.push(p0.x, p0.y, p0.z);

            // Get normal values
            px.y = func(x + EPS, z) - p0.y;
            pz.y = func(x, z + EPS) - p0.y;
            // if (upIsOut) {
                pn.crossVectors(pz, px).normalize();
            // } else {
            //     pn.crossVectors(px, pz).normalize();
            // }
            normals.push(pn.x, pn.y, pn.z);
        }
        zStart += grid.numsZ[i];
    });

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: grid.indices,
    };
}

export function wallAlongZ(
    values: Float32Array,
    curve: (x: number) => number,
    minY: (x: number, y: number) => number,
    maxY: (x: number, y: number) => number,
): VertexInfo {
    const X = values;
    const Z = X.map(curve);
    const topVerts = new Float32Array(3 * X.length);
    const botVerts = new Float32Array(3 * X.length);
    for (let i = 0; i < X.length; ++i) {
        const [x, z] = [X[i], Z[i]];
        const idx = 3*i;
        
        topVerts.set([x, maxY(x, z), z], idx);
        botVerts.set([x, minY(x, z), z], idx);
    }
    const normals = normalToExtrudedCurve(values, curve);
    return knitLines(topVerts, botVerts, X.length, normals);
}

export function normalToExtrudedCurve(values: Float32Array, line: (x: number) => number, dir: THREE.Vector3 = new THREE.Vector3(0, 1, 0)): Float32Array {
    // this can be heavily optimised
    const normals = new Float32Array(3 * values.length);

    const tangent = new THREE.Vector3(0, 0, 0);
    const normal = new THREE.Vector3(0, 0, 0);
    values.forEach((x, i) => {
        tangent.x = EPS;
        tangent.z = line(x+EPS) - line(x);
        normal.crossVectors(tangent, dir).normalize(); // (d.y-t.z, t.z*d.x - t.x*d.z, t.x*d.y)
        normals.set(normal.toArray(), 3*i);
    });
    return normals;
}

export function knitLines(a: Float32Array, b: Float32Array, num?: number, normals?: Float32Array): VertexInfo {
    if (!num) {
        num = Math.floor(a.length / 3);
    }

    if (a.length !== b.length || b.length !== 3*num) {
        throw new Error("Input to knitLines must be the same length, i.e. 3 times the number of vertices")
    }

    if (!normals) {
        normals = new Float32Array();
    }

    const vertices = Float32Array.of(...a, ...b);
    normals = Float32Array.of(...normals, ...normals);
    const indices: number[] = [];
    for (let i = 0; i < num-1; ++i) {
        indices.push(i, i+1, i+num);
        indices.push(i+num, i+1, i+num+1);
    }
    
    return {
        vertices: vertices,
        normals: normals,
        indices: indices,
    };
}

export function meshFromInfo(info: VertexInfo, mat?: THREE.MeshBasicMaterial): THREE.Mesh {
    // TODO is this being called twice?
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(info.indices);
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(info.vertices), 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(info.normals), 3));
    // const material = new THREE.MeshBasicMaterial({wireframe: true});
    // const material = new THREE.MeshPhongMaterial({color: 0x550000});
    const material = new THREE.MeshNormalMaterial();
    // const material = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.5});
    material.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geometry, material);
    // mesh.applyMatrix4(zUp);
    return mesh;
}