class Cone {
    constructor(radius = 1, height = 1, numSegments = 12) {
      this.type = 'cone';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.radius = radius;
      this.height = height;
      this.numSegments = numSegments;
      this.vertexBuffer = null;
      this.indexBuffer = null;
    }
  
    initBuffers() {
      const vertices = [];
      const indices = [];
  
      vertices.push(0, this.height, 0);
  
      for (let i = 0; i <= this.numSegments; i++) {
        const angle = 2 * Math.PI * i / this.numSegments;
        const x = this.radius * Math.cos(angle);
        const z = this.radius * Math.sin(angle);
        vertices.push(x, 0, z);
      }
  
      for (let i = 1; i <= this.numSegments; i++) {
        indices.push(0, i, i + 1);
      }
      indices.push(0, this.numSegments + 1, 1);
  
      for (let i = 1; i < this.numSegments; i++) {
        indices.push(1, i + 1, i + 2);
      }
  
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
      this.numIndices = indices.length;
    }
  
    render() {
      if (!this.vertexBuffer || !this.indexBuffer) {
        this.initBuffers();
      }
  
      const rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
  }
  