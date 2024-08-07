import * as Utils from "./Utils-old";
import { Mesh } from "three";

const THIN = 0.01;

interface GroupVertexInfo {
    top: Utils.VertexInfo,
    bot: Utils.VertexInfo,
    back: Utils.VertexInfo,
    front: Utils.VertexInfo,
    left: Utils.VertexInfo,
    right: Utils.VertexInfo,
};

interface GroupMeshConfig {
    top: MeshConfig,
    bot: MeshConfig,
    back: MeshConfig,
    front: MeshConfig,
    left: MeshConfig,
    right: MeshConfig,
};

interface MeshConfig {
    hidden: boolean,
    transparent: boolean,
    needsUpdate: boolean,
}


export class Visualiser {
    minX: number = -5;
    maxX: number = 5;
    minY: number = -5;
    maxY: number = 5;
    minZ: number = -5;
    maxZ: number = 5;

    density: number = 1;

    discreteDomain!: Utils.GridXZ;
    discreteRegion!: Utils.GridXZ;

    bounds: Utils.BoundsXZ;

    vertexInfos!: {
        bounding: GroupVertexInfo,
        region: GroupVertexInfo,
    };

    meshConfigs: {
        bounding: GroupMeshConfig,
        region: GroupMeshConfig,
    };

    readonly faceNames = ["top", "bot", "back", "front", "left", "right"] as const;

    top: ((x: number, z: number) => number) = ((x, z) => Math.cos(Math.sqrt(x**2 + z**2)) + 2); // 2*x + 3*z);
    bot: ((x: number, z: number) => number) = ((x, z) => -2); // x + z);

    needsUpdate: boolean = true;

    meshes: Mesh[] = [];

    state: any;
    bounds2: any;

    constructor(bounds: Utils.BoundsXZ) {
        this.bounds = bounds;
        this.meshConfigs = this._initMeshConfig();

        this.state = {
            x: 0,
            y: 0,
            z: 0,
        
            t_f1: 1, //THIN,
            t_f2: 1, //THIN,
            t_g1: 1, //THIN,
            t_g2: 1, //THIN,
            t_a: 1, //THIN,
            t_b: 1, //THIN,
        }

        this.update()
    }

    // this is so awful
    _initMeshConfig(): {bounding: GroupMeshConfig, region: GroupMeshConfig} {
        const config: any = { bounding: {}, region: {} };
        Object.keys(config).forEach((key: string) => {
            const group: any = {};
            this.faceNames.forEach((face) => {
                group[face] = {
                    hidden: false,
                    transparent: false,
                    needsUpdate: false,
                } as MeshConfig;
            });
            config[key] = group as GroupMeshConfig;
        });
        return config;
    }

    _discretiseDomain(): Utils.GridXZ {
        const bounds: Utils.BoundsXZ = {
            back: (() => this.minZ),
            front: (() => this.maxZ),
            left: this.minX,
            right: this.maxX,
        }
        return Utils.discretiseArea(bounds, this.density);
    }

    _generateBoundingMeshes(): GroupVertexInfo {
        const topInfo = Utils.generateSurface(this.top, this.discreteDomain);
        const botInfo = Utils.generateSurface(this.bot, this.discreteDomain);

        // back/front
        const X = this.discreteDomain.x
        const minY = () => this.minY;
        const maxY = () => this.maxY;
        const backInfo = Utils.wallAlongZ(X, this.bounds.back, minY, maxY)
        const frontInfo = Utils.wallAlongZ(X, this.bounds.front, minY, maxY);

        // left/right
        const [x1, x2, z1, z2, y1, y2] = [this.bounds.left, this.bounds.right, this.minZ, this.maxZ, this.minY, this.maxY];
        const leftInfo = Utils.knitLines(
            new Float32Array([x1, y2, z1, x1, y2, z2]),
            new Float32Array([x1, y1, z1, x1, y1, z2]),
            2,
            new Float32Array([-1, 0, 0, -1, 0, 0]),
        )
        const rightInfo = Utils.knitLines(
            new Float32Array([x2, y2, z1, x2, y2, z2]),
            new Float32Array([x2, y1, z1, x2, y1, z2]),
            2,
            new Float32Array([1, 0, 0, 1, 0, 0]),
        )

        return {
            top: topInfo,
            bot: botInfo,
            back: backInfo,
            front: frontInfo,
            left: leftInfo,
            right: rightInfo,
        };
    }

    _generateRegionMeshes(): GroupVertexInfo {
        const state = this.state;
        const top = (x: number, z: number) => state.y + state.t_f2 * (this.top(x, z) - state.y)
        const bot = (x: number, z: number) => state.y + state.t_f1 * (this.bot(x, z) - state.y)
        const topInfo = Utils.generateSurface(top, this.discreteRegion, true);
        const botInfo = Utils.generateSurface(bot, this.discreteRegion, false);

        // back/front - harder to extract from top/bot info so just recalculate
        const X = this.discreteRegion.x
        const minY = bot;
        const maxY = top;
        const backInfo = Utils.wallAlongZ(X, this.bounds2.back, minY, maxY)
        const frontInfo = Utils.wallAlongZ(X, this.bounds2.front, minY, maxY);
        
        // left
        let leftInfo: Utils.VertexInfo;
        {
            const num = this.discreteRegion.numsZ[0];
            const topLeft = topInfo.vertices.slice(0, 3*num);
            const botLeft = botInfo.vertices.slice(0, 3*num);
            const normals = new Float32Array([].concat(...Array(num).fill([-1, 0, 0])));
            leftInfo = Utils.knitLines(topLeft, botLeft, num, normals);
        }

        // right
        let rightInfo: Utils.VertexInfo;
        {
            const num = this.discreteRegion.numsZ.at(-1);
            if (!num)
                throw new Error("The mesh has zero depth, there should at least be one vertex");
            const topRight = topInfo.vertices.slice(-3*num);
            const botRight = botInfo.vertices.slice(-3*num);
            const normals = new Float32Array([].concat(...Array(num).fill([-1, 0, 0])));
            rightInfo = Utils.knitLines(topRight, botRight, num, normals);
        }

        return {
            top: topInfo,
            bot: botInfo,
            back: backInfo,
            front: frontInfo,
            left: leftInfo,
            right: rightInfo,
        };
    }


    update(): void {
        if (!this.needsUpdate)
            return;
        
        this.discreteDomain = this._discretiseDomain();

        const state = this.state;
        this.bounds2 = {
            left: state.x + state.t_a*(this.bounds.left - state.x),
            right: state.x + state.t_b*(this.bounds.right - state.x),
            back: (x: number) => state.z + state.t_g1 * (this.bounds.back(x) - state.z),
            front: (x: number) => state.z + state.t_g2 * (this.bounds.front(x) - state.z),
        } as Utils.BoundsXZ;
        this.discreteRegion = Utils.discretiseArea(this.bounds2, this.density);

        this.vertexInfos = {
            bounding: this._generateBoundingMeshes(),
            region: this._generateRegionMeshes(),
        }

        const allInfos = Object.values(this.vertexInfos.bounding).concat(Object.values(this.vertexInfos.region));

        const geometries = allInfos.map(info => Utils.geometryFromInfo(info));

        if (this.meshes.length === 0) {
            geometries.forEach((geometry, i) => {
                const mesh = Utils.meshFromGeometry(geometry, i < 6);
                if (i < 6) {
                    mesh.visible = false;
                }
                this.meshes.push(mesh);
            })
            // this.meshes = geometries.map(geometry => Utils.meshFromGeometry(geometry));
        } else {
            this.meshes.forEach((mesh, i) => {
                mesh.geometry = geometries[i];
            });
        }

        this.needsUpdate = false;
    }



    getMeshes(): Mesh[] {
        return this.meshes;
    }
}