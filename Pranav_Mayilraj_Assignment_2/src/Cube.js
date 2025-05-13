class Cube {
    constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      
      this.vertexBuffer = null;
      this.edgeBuffer = null;
    }
  
    render() {
      let rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      if (this.vertexBuffer === null) {
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
          console.log('Failed to create vertex buffer');
          return;
        }
        const vertices = new Float32Array([
          0,0,0, 1,1,0, 1,0,0,
          0,0,0, 0,1,0, 1,1,0,
          0,0,1, 1,1,1, 1,0,1,
          0,0,1, 0,1,1, 1,1,1,
          0,1,0, 1,1,0, 1,1,1,
          0,1,1, 0,1,0, 1,1,1,
          0,0,0, 0,0,1, 1,0,0,
          1,0,0, 1,0,1, 0,0,1,
          0,0,0, 0,1,0, 0,1,1,
          0,1,1, 0,0,0, 0,0,1,
          1,0,0, 1,1,0, 1,1,1,
          1,1,1, 1,0,0, 1,0,1
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      }
  
      const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
  
      if (this.edgeBuffer === null) {
        this.edgeBuffer = gl.createBuffer();
        if (!this.edgeBuffer) {
          console.log('Failed to create edge buffer');
          return;
        }
        const edges = new Float32Array([
          0,0,0, 1,0,0, 1,0,0, 1,1,0, 1,1,0, 0,1,0, 0,1,0, 0,0,0,
          0,0,1, 1,0,1, 1,0,1, 1,1,1, 1,1,1, 0,1,1, 0,1,1, 0,0,1,
          0,0,0, 0,0,1, 1,0,0, 1,0,1, 1,1,0, 1,1,1, 0,1,0, 0,1,1
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, edges, gl.STATIC_DRAW);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeBuffer);
      }
  
      // Draw edges
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0); // Black for edges
      gl.drawArrays(gl.LINES, 0, 24);
    }
  }