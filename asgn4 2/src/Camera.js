class Camera {
    constructor() {
      this.fov = 60;
      this.eye = new Vector3([0, 0, 0]);
      this.at = new Vector3([0, 0, -100]);
      this.up = new Vector3([0, 1, 0]);
      
      this.viewMatrix = new Matrix4();
      this.updateViewMatrix();
      
      this.projectionMatrix = new Matrix4();
      this.updateProjectionMatrix();

      this.pitch = 0;
      this.yaw = 0;
      this.maxPitch = 85;
      this.sensitivity = 0.4;
      
    }
    
    handleMouseMove(dx, dy) {
      this.yaw += dx * this.sensitivity;
      
      this.pitch -= dy * this.sensitivity;
      this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
      
      this.updateDirection();
    }

    updateDirection() {
      const forward = new Vector3([
        Math.sin(this.yaw * Math.PI / 180) * Math.cos(this.pitch * Math.PI / 180),
        Math.sin(this.pitch * Math.PI / 180),
        -Math.cos(this.yaw * Math.PI / 180) * Math.cos(this.pitch * Math.PI / 180)
      ]);
      forward.normalize();
      
      this.at.elements[0] = this.eye.elements[0] + forward.elements[0];
      this.at.elements[1] = this.eye.elements[1] + forward.elements[1];
      this.at.elements[2] = this.eye.elements[2] + forward.elements[2];
      
      this.updateViewMatrix();
    }

    updateViewMatrix() {
      this.viewMatrix.setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2],
        this.up.elements[0], this.up.elements[1], this.up.elements[2]
      );
    }
    
    updateProjectionMatrix() {
      const canvas = document.getElementById('webgl');
      this.projectionMatrix.setPerspective(
        this.fov,
        canvas.width / canvas.height,
        0.1,
        1000
      );
    }
    
    moveForward(speed = 0.1) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      
      this.eye.elements[0] += f.elements[0] * speed;
      this.eye.elements[1] += f.elements[1] * speed;
      this.eye.elements[2] += f.elements[2] * speed;
      
      this.at.elements[0] += f.elements[0] * speed;
      this.at.elements[1] += f.elements[1] * speed;
      this.at.elements[2] += f.elements[2] * speed;
      
      this.updateViewMatrix();
    }
    
    moveBackwards(speed = 0.1) {
      let b = new Vector3([
        this.eye.elements[0] - this.at.elements[0],
        this.eye.elements[1] - this.at.elements[1],
        this.eye.elements[2] - this.at.elements[2]
      ]);
      b.normalize();
      
      this.eye.elements[0] += b.elements[0] * speed;
      this.eye.elements[1] += b.elements[1] * speed;
      this.eye.elements[2] += b.elements[2] * speed;
      
      this.at.elements[0] += b.elements[0] * speed;
      this.at.elements[1] += b.elements[1] * speed;
      this.at.elements[2] += b.elements[2] * speed;
      
      this.updateViewMatrix();
    }
    
    moveLeft(speed = 0.1) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      
      let s = new Vector3();
      s.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
      s.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
      s.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
      s.normalize();
      
      this.eye.elements[0] += s.elements[0] * speed;
      this.eye.elements[1] += s.elements[1] * speed;
      this.eye.elements[2] += s.elements[2] * speed;
      
      this.at.elements[0] += s.elements[0] * speed;
      this.at.elements[1] += s.elements[1] * speed;
      this.at.elements[2] += s.elements[2] * speed;
      
      this.updateViewMatrix();
    }
    
    moveRight(speed = 0.1) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      f.normalize();
      
      let s = new Vector3();
      s.elements[0] = f.elements[1] * this.up.elements[2] - f.elements[2] * this.up.elements[1];
      s.elements[1] = f.elements[2] * this.up.elements[0] - f.elements[0] * this.up.elements[2];
      s.elements[2] = f.elements[0] * this.up.elements[1] - f.elements[1] * this.up.elements[0];
      s.normalize();
      
      this.eye.elements[0] += s.elements[0] * speed;
      this.eye.elements[1] += s.elements[1] * speed;
      this.eye.elements[2] += s.elements[2] * speed;
      
      this.at.elements[0] += s.elements[0] * speed;
      this.at.elements[1] += s.elements[1] * speed;
      this.at.elements[2] += s.elements[2] * speed;
      
      this.updateViewMatrix();
    }
    
    panLeft(alpha = 1) {
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
      let f_prime = rotationMatrix.multiplyVector3(f);
      
      this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
      this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
      this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];
      
      this.updateViewMatrix();
    }
    
    panRight(alpha = 1) {
      this.panLeft(-alpha);
    }
  }