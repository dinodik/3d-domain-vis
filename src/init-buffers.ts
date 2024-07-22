
function initPositionBuffer(gl: WebGLRenderingContext): WebGLBuffer {
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer)
        throw new Error("Failed to create position buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, // top
        -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1 // bottom
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function initColourBuffer(gl: WebGLRenderingContext): WebGLBuffer {
    const colours = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
    ];
    const colourBuffer = gl.createBuffer();
    if (!colourBuffer)
        throw new Error("Failed to create colour buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);
    return colourBuffer;
}

function initIndexBuffer(gl: WebGLRenderingContext) {
    const indices = [
        0, 2, 1, 0, 3, 2, // +z
        4, 5, 6, 4, 6, 7, // -z
        0, 1, 6, 0, 6, 5, // +x
        3, 7, 2, 3, 4, 7, // -x
        5, 4, 3, 5, 3, 0, // +y
        1, 2, 6, 2, 7, 6, // -y
    ];
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer)
        throw new Error("Failed to create index buffer");
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return indexBuffer;
}

function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = initPositionBuffer(gl);
    const colourBuffer = initColourBuffer(gl);
    const indexBuffer = initIndexBuffer(gl);
    return {
        position: positionBuffer,
        colour: colourBuffer,
        indices: indexBuffer,
    };
}

export { initBuffers };