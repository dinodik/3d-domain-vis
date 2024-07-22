import { initBuffers } from "./init-buffers"
import { drawScene } from "./draw-scene"

main();

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader)
        throw new Error(`Could not create WebGL shader of type ${type}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`An error occured compiling the shader: ${gl.getShaderInfoLog(shader)}`)
        // gl.deleteShader(shader);
    }
    return shader;
}

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram)
        throw new Error("Failed to create new shader program");
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error(`Unable to link the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    }
    return shaderProgram;
}

function main(): void {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const gl = canvas.getContext("webgl");

    if (gl == null) {
        throw new Error("Unable to initialise WebGL");
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uNormalMatrix;

        varying lowp vec4 vColour;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
            vColour = transformedNormal;
        }
    `;

    const fsSource = `
        varying lowp vec4 vColour;
        void main() {
            gl_FragColor = vColour;
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            // vertexColour: gl.getAttribLocation(shaderProgram, "aVertexColour"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
        },
    };

    const buffers = initBuffers(gl);

    let squareRotation = 0;
    let deltaTime = 0;
    let then = 0;
    function render(now: number) {
        now *= 0.001; // ms to s
        deltaTime = now - then;
        then = now;

        drawScene(gl as WebGLRenderingContext, programInfo, buffers, squareRotation);
        squareRotation += deltaTime;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}