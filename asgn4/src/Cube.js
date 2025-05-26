class Cube {
  static vertexBuffer = null;
  static texCoordBuffer = null;
  static normalBuffer = null; 
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
      0, 0, 
      1, 0,  
      1, 1,  
      0, 1,  
      0, 0, 
      1, 0,  
      1, 1,  
      0, 1   
    ]);

    const normals = new Float32Array([
      // Front face (Z-)
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      // Back face (Z+)
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // Top face (Y+)
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      // Bottom face (Y-)
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      // Right face (X+)
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      // Left face (X-)
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,    // Front
      4, 5, 6, 4, 6, 7,    // Back
      3, 2, 6, 3, 6, 7,    // Top
      0, 1, 5, 0, 5, 4,    // Bottom
      1, 5, 6, 1, 6, 2,    // Right
      0, 4, 7, 0, 7, 3     // Left
    ]);

    Cube.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    Cube.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    Cube.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

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

    gl.bindBuffer(gl.ARRAY_BUFFER, Cube.normalBuffer);
    const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal >= 0) {
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
    }

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
    const allNormals = [];  // New: Array for normals
    
    // Front face (Z-)
    allVertices.push(0,0,0, 1,1,0, 1,0,0); 
    allUVs.push(0,0, 1,1, 1,0);
    allNormals.push(0,0,-1, 0,0,-1, 0,0,-1);
    
    allVertices.push(0,0,0, 0,1,0, 1,1,0); 
    allUVs.push(0,0, 0,1, 1,1);
    allNormals.push(0,0,-1, 0,0,-1, 0,0,-1);
    
    // Back face (Z+)
    allVertices.push(0,0,1, 1,0,1, 1,1,1); 
    allUVs.push(0,0, 1,0, 1,1);
    allNormals.push(0,0,1, 0,0,1, 0,0,1);
    
    allVertices.push(0,0,1, 1,1,1, 0,1,1); 
    allUVs.push(0,0, 1,1, 0,1);
    allNormals.push(0,0,1, 0,0,1, 0,0,1);
    
    // Top face (Y+)
    allVertices.push(0,1,0, 1,1,0, 1,1,1); 
    allUVs.push(0,0, 1,0, 1,1);
    allNormals.push(0,1,0, 0,1,0, 0,1,0);
    
    allVertices.push(0,1,1, 0,1,0, 1,1,1); 
    allUVs.push(0,1, 0,0, 1,1);
    allNormals.push(0,1,0, 0,1,0, 0,1,0);
    
    // Bottom face (Y-)
    allVertices.push(0,0,0, 0,0,1, 1,0,0); 
    allUVs.push(0,0, 0,1, 1,0);
    allNormals.push(0,-1,0, 0,-1,0, 0,-1,0);
    
    allVertices.push(1,0,0, 1,0,1, 0,0,1); 
    allUVs.push(1,0, 1,1, 0,1);
    allNormals.push(0,-1,0, 0,-1,0, 0,-1,0);
    
    // Left face (X-)
    allVertices.push(0,0,0, 0,1,0, 0,1,1); 
    allUVs.push(0,0, 0,1, 1,1);
    allNormals.push(-1,0,0, -1,0,0, -1,0,0);
    
    allVertices.push(0,1,1, 0,0,0, 0,0,1); 
    allUVs.push(1,1, 0,0, 1,0);
    allNormals.push(-1,0,0, -1,0,0, -1,0,0);
    
    // Right face (X+)
    allVertices.push(1,0,0, 1,1,0, 1,1,1); 
    allUVs.push(0,0, 0,1, 1,1);
    allNormals.push(1,0,0, 1,0,0, 1,0,0);
    
    allVertices.push(1,1,1, 1,0,0, 1,0,1); 
    allUVs.push(1,1, 0,0, 1,0);
    allNormals.push(1,0,0, 1,0,0, 1,0,0);

    drawTriangle3DUVNormal(allVertices, allUVs, allNormals);
  }
}