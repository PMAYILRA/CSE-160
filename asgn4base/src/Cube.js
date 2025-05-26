class Cube {
  static vertexBuffer = null;
  static texCoordBuffer = null;
  static indexBuffer = null;
  static initialized = false;

  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.texture = null;

    if (!Cube.initialized) {
      Cube.initializeBuffers();
      Cube.initialized = true;
    }
  }

  static initializeBuffers() {
    const vertices = new Float32Array([
      0, 0, 0,  // 0
      1, 0, 0,  // 1
      1, 1, 0,  // 2
      0, 1, 0,  // 3
      0, 0, 1,  // 4
      1, 0, 1,  // 5
      1, 1, 1,  // 6
      0, 1, 1   // 7
    ]);

    const texCoords = new Float32Array([
      0, 0,  // 0
      1, 0,  // 1
      1, 1,  // 2
      0, 1,  // 3
      0, 0,  // 4
      1, 0,  // 5
      1, 1,  // 6
      0, 1   // 7
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      3, 2, 6, 3, 6, 7,
      0, 1, 5, 0, 5, 4,
      1, 5, 6, 1, 6, 2,
      0, 4, 7, 0, 7, 3
    ]);

    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    Cube.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    Cube.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (this.texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(u_Sampler, 0);
      gl.uniform1f(u_TexColorWeight, 1.0);
    } else {
      gl.uniform1f(u_TexColorWeight, 0.0);
      gl.uniform4fv(u_BaseColor, this.color);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.texCoordBuffer);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  }
  renderQuick() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    if (this.texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(u_Sampler, 0);
        gl.uniform1f(u_TexColorWeight, 1.0);
    } else {
        gl.uniform1f(u_TexColorWeight, 0.0);
        gl.uniform4fv(u_BaseColor, this.color);
    }

    const allVertices = [];
    const allUVs = [];
    
    allVertices.push(0,0,0, 1,1,0, 1,0,0); allUVs.push(0,0, 1,1, 1,0);
    allVertices.push(0,0,0, 0,1,0, 1,1,0); allUVs.push(0,0, 0,1, 1,1);
    
    // Back face
    allVertices.push(0,0,1, 1,1,1, 1,0,1); allUVs.push(0,0, 1,1, 1,0);
    allVertices.push(0,0,1, 0,1,1, 1,1,1); allUVs.push(0,0, 0,1, 1,1);
    
    // Top face
    allVertices.push(0,1,0, 1,1,0, 1,1,1); allUVs.push(0,0, 1,0, 1,1);
    allVertices.push(0,1,1, 0,1,0, 1,1,1); allUVs.push(0,1, 0,0, 1,1);
    
    // Bottom face
    allVertices.push(0,0,0, 0,0,1, 1,0,0); allUVs.push(0,0, 0,1, 1,0);
    allVertices.push(1,0,0, 1,0,1, 0,0,1); allUVs.push(1,0, 1,1, 0,1);
    
    // Left face
    allVertices.push(0,0,0, 0,1,0, 0,1,1); allUVs.push(0,0, 0,1, 1,1);
    allVertices.push(0,1,1, 0,0,0, 0,0,1); allUVs.push(1,1, 0,0, 1,0);
    
    // Right face
    allVertices.push(1,0,0, 1,1,0, 1,1,1); allUVs.push(0,0, 0,1, 1,1);
    allVertices.push(1,1,1, 1,0,0, 1,0,1); allUVs.push(1,1, 0,0, 1,0);

    // Single draw call
    drawTriangle3D2(allVertices, allUVs);
}
  
}