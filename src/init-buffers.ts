
function initPositionBuffer(gl: WebGLRenderingContext): WebGLBuffer {
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer)
        throw new Error("Failed to create position buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function initBuffers(gl: WebGLRenderingContext) {
    const positionBuffer = initPositionBuffer(gl);
    return {
        position: positionBuffer,
    };
}

export { initBuffers }