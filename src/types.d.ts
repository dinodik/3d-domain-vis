
type Vec2 = [number, number];
type Vec3 = [number, number, number];

type TeX = string;

type Expression = string;
type ExprRange = [Expression, Expression];
type ExprRange3 = [ExprRange, ExprRange, ExprRange];


type XYZ = 'x' | 'y' | 'z';
type Order = [XYZ, XYZ, XYZ];
type Ranges = Record<XYZ, [number, number]>;
// type Domain = {
//     top:   (x: number, z: number) => number,
//     bot:   (x: number, z: number) => number,
//     front: (x: number) => number,
//     back:  (x: number) => number,
//     left:  () => number,
//     right: () => number,
// };
type Domain = {
    y: [(x: number, z: number) => number, (x: number, z: number) => number],
    z: [(x: number) => number, (x: number) => number]
    x: [() => number, () => number]
};
type Axes = Record<XYZ, {min: number, max: number, step: number}>;
type GridXZ = {
    X: Float32Array, // 1D
    Z: Float32Array, // 2D compressed
    numsZ: Int32Array,
    indices: number[],
}

type MeshConfig = {
    transparent: boolean,
    hidden: boolean,
}
type DomainConfig = Record<XYZ, [MeshConfig, MeshConfig]>;

type MeshInfo = {
    vertices: Float32Array,
    normals: Float32Array,
    indices: number[],
};