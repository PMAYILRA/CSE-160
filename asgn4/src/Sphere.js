class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.texture = null;
    this.segments = 24; 
    this.radius = 0.5;
    this.position = [0.0, 0.0, 0.0];
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

    const vertices = [];
    const texCoords = [];
    const normals = []; 
    
    const sectorCount = this.segments;
    const stackCount = this.segments / 2;
    const radius = this.radius;
    
    const lengthInv = 1.0 / radius;
    const sectorStep = 2 * Math.PI / sectorCount;
    const stackStep = Math.PI / stackCount;
    
    for (let i = 0; i <= stackCount; ++i) {
      const stackAngle = Math.PI / 2 - i * stackStep;
      const xy = radius * Math.cos(stackAngle);
      const z = radius * Math.sin(stackAngle);
      
      for (let j = 0; j <= sectorCount; ++j) {
        const sectorAngle = j * sectorStep;
        
        const x = xy * Math.cos(sectorAngle);
        const y = xy * Math.sin(sectorAngle);
        
        vertices.push(x + this.position[0], y + this.position[1], z + this.position[2]);
        
        const nx = x * lengthInv;
        const ny = y * lengthInv;
        const nz = z * lengthInv;
        normals.push(nx, ny, nz);
        
        const s = j / sectorCount;
        const t = i / stackCount;
        texCoords.push(s, t);
      }
    }
    
    const indices = [];
    for (let i = 0; i < stackCount; ++i) {
      let k1 = i * (sectorCount + 1);
      let k2 = k1 + sectorCount + 1;
      
      for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
        if (i !== 0) {
          indices.push(k1, k2, k1 + 1);
        }
        
        if (i !== (stackCount - 1)) {
          indices.push(k1 + 1, k2, k2 + 1);
        }
      }
    }
    
    if (vertices.length > 0) {
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      
      if (this.texture) {
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_TexCoord);
      }
      
      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
      if (a_Normal >= 0) {
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
      }
      
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      
      gl.disableVertexAttribArray(a_Position);
      if (this.texture) gl.disableVertexAttribArray(a_TexCoord);
      if (a_Normal >= 0) gl.disableVertexAttribArray(a_Normal);
    }
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

    const segments = Math.max(8, this.segments / 2);
    const vertices = [];
    const texCoords = [];
    const normals = [];
    
    for (let lat = 0; lat <= segments; lat++) {
      const theta = lat * Math.PI / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let long = 0; long <= segments; long++) {
        const phi = long * 2 * Math.PI / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = this.position[0] + this.radius * cosPhi * sinTheta;
        const y = this.position[1] + this.radius * sinPhi * sinTheta;
        const z = this.position[2] + this.radius * cosTheta;
        
        vertices.push(x, y, z);
        
        normals.push(cosPhi * sinTheta, sinPhi * sinTheta, cosTheta);
        
        texCoords.push(long / segments, lat / segments);
      }
    }
    
    const indices = [];
    for (let lat = 0; lat < segments; lat++) {
      for (let long = 0; long < segments; long++) {
        const first = (lat * (segments + 1)) + long;
        const second = first + segments + 1;
        
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    
    if (vertices.length > 0) {
      const allVertices = [];
      const allUVs = [];
      const allNormals = [];
      
      for (let i = 0; i < indices.length; i += 3) {
        const idx1 = indices[i] * 3;
        const idx2 = indices[i+1] * 3;
        const idx3 = indices[i+2] * 3;
        
        allVertices.push(
          vertices[idx1], vertices[idx1+1], vertices[idx1+2],
          vertices[idx2], vertices[idx2+1], vertices[idx2+2],
          vertices[idx3], vertices[idx3+1], vertices[idx3+2]
        );
        
        const uvIdx1 = indices[i] * 2;
        const uvIdx2 = indices[i+1] * 2;
        const uvIdx3 = indices[i+2] * 2;
        
        allUVs.push(
          texCoords[uvIdx1], texCoords[uvIdx1+1],
          texCoords[uvIdx2], texCoords[uvIdx2+1],
          texCoords[uvIdx3], texCoords[uvIdx3+1]
        );
        
        allNormals.push(
          normals[idx1], normals[idx1+1], normals[idx1+2],
          normals[idx2], normals[idx2+1], normals[idx2+2],
          normals[idx3], normals[idx3+1], normals[idx3+2]
        );
      }
      
      drawTriangle3DUVNormal(allVertices, allUVs, allNormals);
    }
  }
}