import { AxesLimits } from "./Utils-old";
import { BufferGeometry, Color, Float32BufferAttribute, LineBasicMaterial, LineSegments, Vector3 } from "three";

const size: number = 10; // on screen
const targetDivision: number = 10;
const colourNormal = (new Color(0xaaaaaa)).toArray();
const colourHighlight = (new Color(0xffffff)).toArray();

let gap: number;
let start: number;
let length: number;
let steps: number[];
let needsUpdate = true;

export default class Axes {
    grids!: LineSegments[];

    constructor(minX: number = -5, maxX: number = 5) {
        start = minX;
        length = maxX - minX;
        this.update();
    }

    _calcGridSteps() {
        gap = Math.floor(length / targetDivision);
        const div = Math.floor(length / gap);
        const rem = length - gap * div;

        steps = [];
        for (let i = 0; i <= div; ++i) {
            steps.push(Math.ceil(rem / 2) + i*gap);
        }
    }; 

    _createGrid(start: number): LineSegments {
        this._calcGridSteps();
        const visibleSteps: number[] = [];
        steps.forEach((step) => {
            const actualStep = start + step;
            if (start < actualStep  && actualStep < start + length)
                visibleSteps.push(actualStep);
        });

        const numLines = 2 * (visibleSteps.length + 1);
        const verticies: number[] = [];
        const colours: number[] = [];
        visibleSteps.forEach((step, i) => {
            verticies.push(step, 0, 0);
            verticies.push(step, 0, length);
            verticies.push(0, 0, step);
            verticies.push(length, 0, step);
            colours.push(...colourNormal, ...colourNormal);
            colours.push(...colourNormal, ...colourNormal);
        });
        verticies.push(0, 0, 0); verticies.push(length, 0, 0);
        verticies.push(0, 0, 0); verticies.push(0, 0, length);
        colours.push(...colourHighlight, ...colourHighlight);
        colours.push(...colourHighlight, ...colourHighlight);

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new Float32BufferAttribute(verticies, 3));
        geometry.setAttribute("color", new Float32BufferAttribute(colours, 3));

        const material = new LineBasicMaterial({vertexColors: true});
        return new LineSegments(geometry, material);
    }

    update() {
        if (!needsUpdate)
            return

        if (!this.grids) {
            this.grids = [];
            for (let i = 0; i < 3; ++i) {
                this.grids.push(this._createGrid(0));
                this.grids[i].translateOnAxis(new Vector3(1,1,1), start);
            }
            this.grids[1].rotateX(-Math.PI/2);
            this.grids[2].rotateZ(Math.PI/2);
        } else {

        }
    }
}