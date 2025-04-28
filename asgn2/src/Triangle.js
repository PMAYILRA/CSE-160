class Triangle {
    constructor() {
      this.type = 'triangle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = g_selectedSize / 2.0;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size / 2.0;
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniform1f(u_Size, size);
  
      var newsize = size / 100.0;
      drawTriangle([
        xy[0], xy[1] + newsize,
        xy[0] - newsize, xy[1] - newsize,
        xy[0] + newsize, xy[1] - newsize
      ], rgba);
    }
  }
  
  function drawTriangle(vertices, color) {
    var n = 3;
  
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var verticesarray = new Float32Array(vertices);
    gl.bufferData(gl.ARRAY_BUFFER, verticesarray, gl.DYNAMIC_DRAW);
  
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
  
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    gl.disableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  function drawTriangle3D(vertices, color) {
    const n = 3;
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
  
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  
    gl.disableVertexAttribArray(a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }