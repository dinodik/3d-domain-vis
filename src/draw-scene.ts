import { mat4 } from "gl-matrix"

function drawScene(gl: WebGLRenderingContext, programInfo: any, buffers: any, squareRotation: number) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // create projection matrix
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.width / gl.canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // create model view matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [0.0, 0.0, -6.0],
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        squareRotation,
        [1, 1, 1],
    )

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // use positions from buffer to create vertexPosition attrib
    setPositionAttribute(gl, buffers, programInfo);
    // setColourAttribute(gl, buffers, programInfo);
    setNormalAttribute(gl, buffers, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program)

    // set shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix,
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix,
    );

    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
}

function setPositionAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: any) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalise = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalise,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function setColourAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: any) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalise = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colour);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColour,
        numComponents,
        type,
        normalise,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColour);
}

function setNormalAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: any) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalise = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalise,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export { drawScene };