const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = u_Size;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

var canvas;
var gl;
var a_Position;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_GlobalRotateMatrix;

var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 5;
var g_Type = POINT;
var g_selectedSegments = 10;
var g_globalAngle = 0;

var g_shapesList = [];

var g_leftArmJointAngle = -235;
var g_rightArmJointAngle = 235;
var g_leftArmAngle = 0;
var g_rightArmAngle = -55;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

var g_leftArmAnimation = false;

var g_leftLegAngle = 0;
var g_rightLegAngle = 0;
var g_legAnimation = false;

var g_base, g_base2, g_head, g_leftEye, g_rightEye, g_nose;
var g_leftJoint, g_leftArm, g_rightJoint, g_rightArm;
var g_leftLeg, g_rightLeg;
var g_rightHand;

var g_isPokeAnimation = false;
var g_pokeStartTime = 0;
let g_isDragging = false;
let g_lastMouseX = 0;
let g_rotationSpeed = 0.3;
let g_rotationMatrix = new Matrix4();

let g_frameCount = 0;
let g_lastTime = performance.now();
let g_fps = 0;
let g_fpsElement;

var g_isPokeAnimation = false;

function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}

function addActionsForHtmlUI() {
  document.getElementById('leftArmAnimateButton').onclick = function () {
    g_leftArmAnimation = !g_leftArmAnimation;
  };
  document.getElementById('legAnimateButton').onclick = function () {
    g_legAnimation = !g_legAnimation;
  };
  document.getElementById('leftArmJointSlide').addEventListener('mousemove', function () {
    g_leftArmJointAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('rightArmJointSlide').addEventListener('mousemove', function () {
    g_rightArmJointAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('leftArmSlide').addEventListener('mousemove', function () {
    g_leftArmAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('rightArmSlide').addEventListener('mousemove', function () {
    g_rightArmAngle = this.value;
    renderAllShapes();
  });
  canvas.onmousedown = function (event) {
    g_isDragging = true;
    g_lastMouseX = event.clientX;
  
    if (event.shiftKey) {
      g_isPokeAnimation = true;
      g_leftArmAnimation = true;
      g_legAnimation = true;
    }
  };
  
  canvas.onmouseup = function () {
    g_isDragging = false;
  
    g_isPokeAnimation = false;
    g_leftArmAnimation = false;
    g_legAnimation = false;
  };


  canvas.onmousemove = function (event) {
    if (g_isDragging) {
      const deltaX = event.clientX - g_lastMouseX;
      g_rotationMatrix.rotate(deltaX * g_rotationSpeed, 0, 1, 0);
      g_lastMouseX = event.clientX;
      renderAllShapes();
    }
  };

  canvas.addEventListener('click', function(event) {
    if (event.shiftKey) {
        g_leftArmAnimation = true;
        g_legAnimation = true;
        g_isPokeAnimation = true;
        g_pokeStartTime = performance.now() / 1000.0;
    }
    });

  g_fpsElement = document.createElement('div');
  g_fpsElement.style.position = 'absolute';
  g_fpsElement.style.top = '10px';
  g_fpsElement.style.left = '10px';
  g_fpsElement.style.color = 'white';
  g_fpsElement.style.zIndex = '10';
  document.body.appendChild(g_fpsElement);
}

function updateSelectedColor() {
  const r = parseFloat(document.getElementById('redSlider').value);
  const g = parseFloat(document.getElementById('greenSlider').value);
  const b = parseFloat(document.getElementById('blueSlider').value);

  g_selectedColor = [r, g, b, 1.0];
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  gl.enable(gl.DEPTH_TEST);

  addActionsForHtmlUI();

  g_base = new Cube();
  g_base2 = new Cube();
  g_head = new Cube();
  g_leftEye = new Cube();
  g_rightEye = new Cube();
  g_nose = new Cube();
  g_leftJoint = new Cube();
  g_leftArm = new Cube();
  g_rightJoint = new Cube();
  g_rightArm = new Cube();
  g_leftLeg = new Cube();
  g_rightLeg = new Cube();
  g_rightHand = new Cone();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  requestAnimationFrame(tick);
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();
  renderAllShapes();
  updateFPS();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_leftArmAnimation) {
      if (g_isPokeAnimation) {
        let pokeElapsed = g_seconds - g_pokeStartTime;
        g_leftArmAngle = 30 * Math.sin(6 * pokeElapsed);
      } else {
        g_leftArmAngle = 30 * Math.sin(g_seconds);
      }
    }
  
    if (g_legAnimation) {
      if (g_isPokeAnimation) {
        let pokeElapsed = g_seconds - g_pokeStartTime;
        g_leftLegAngle = 60 * Math.sin(6 * pokeElapsed);
        g_rightLegAngle = -60 * Math.sin(6 * pokeElapsed);
      } else {
        g_leftLegAngle = 30 * Math.sin(g_seconds);
        g_rightLegAngle = -30 * Math.sin(g_seconds);
      }
    }
  }

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var globalRotMat = new Matrix4();
  globalRotMat.multiply(g_rotationMatrix);
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  g_base.color = [0.8, 0.8, 0.7, 1];
  g_base.matrix.setIdentity();
  g_base.matrix.setTranslate(-0.2, -0.1, 0);
  g_base.matrix.scale(0.4, 0.34, 0.2);
  g_base.render();

  g_base2.color = [0.8, 0.8, 0.7, 1];
  g_base2.matrix.setIdentity();
  g_base2.matrix.setTranslate(-0.12, -0.25, 0);
  g_base2.matrix.scale(0.25, 0.15, 0.2);
  g_base2.render();

  g_head.color = [0.6, 0.5, 0.4, 1];
  g_head.matrix.setIdentity();
  g_head.matrix.setTranslate(-0.1, 0.25, 0);
  g_head.matrix.scale(0.2, 0.25, 0.2);
  g_head.render();

  g_leftEye.color = [0.6, 0.0, 0.0, 1.0];
  g_leftEye.matrix.setIdentity();
  g_leftEye.matrix.setTranslate(-0.07, 0.32, -0.025);
  g_leftEye.matrix.scale(0.03, 0.03, 0.01);
  g_leftEye.render();

  g_rightEye.color = [0.6, 0.0, 0.0, 1.0];
  g_rightEye.matrix.setIdentity();
  g_rightEye.matrix.setTranslate(0.04, 0.32, -0.025);
  g_rightEye.matrix.scale(0.03, 0.03, 0.01);
  g_rightEye.render();
  g_nose.color = [0.7, 0.6, 0.5, 1.0];
  g_nose.matrix.setIdentity();
  g_nose.matrix.setTranslate(-0.025, 0.2, -0.025);
  g_nose.matrix.scale(0.05, 0.1, 0.01);
  g_nose.render();

  g_leftJoint.color = [0.7, 0.7, 0.6, 1];
  g_leftJoint.matrix.setIdentity();
  g_leftJoint.matrix.setTranslate(-0.1, 0.16, 0);
  g_leftJoint.matrix.rotate(g_leftArmJointAngle, 0, 0, 1);
  let leftArmMatrix = new Matrix4(g_leftJoint.matrix); 
  g_leftJoint.matrix.scale(0.13, 0.2, 0.2);
  g_leftJoint.render();

  g_leftArm.color = [0.7, 0.7, 0.6, 1];
  g_leftArm.matrix = leftArmMatrix;
  g_leftArm.matrix.translate(0.055, 0.1, 0);
  g_leftArm.matrix.rotate(55, 0, 0, 1);
  g_leftArm.matrix.rotate(g_leftArmAngle, 1, 0, 0);
  g_leftArm.matrix.scale(0.07, 0.55, 0.2);
  g_leftArm.render();

  g_rightJoint.color = [0.7, 0.7, 0.6, 1];
  g_rightJoint.matrix.setIdentity();
  g_rightJoint.matrix.setTranslate(0.05, 0.22, 0);
  g_rightJoint.matrix.translate(0.0625, 0, 0);
  g_rightJoint.matrix.rotate(g_rightArmJointAngle, 0, 0, 1);
  g_rightJoint.matrix.translate(-0.0625, 0, 0);
  let rightArmMatrix = new Matrix4(g_rightJoint.matrix);
  g_rightJoint.matrix.scale(0.125, 0.2, 0.2);
  g_rightJoint.render();

  g_rightArm.color = [0.7, 0.7, 0.6, 1];
  g_rightArm.matrix = rightArmMatrix;
  g_rightArm.matrix.translate(0, 0.16, 0);
  g_rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  g_rightArm.matrix.scale(0.07, 0.6, 0.2);
  g_rightArm.render();

  g_rightHand.color = [0.9, 0.7, 0.5, 1.0];
  g_rightHand.matrix = new Matrix4(g_rightArm.matrix);
  g_rightHand.matrix.translate(0.5, 1, 0.4);
  g_rightHand.matrix.scale(0.3, 0.3, 0.3);
  g_rightHand.render();

  g_leftLeg.color = [0.6, 0.6, 0.5, 1];
  g_leftLeg.matrix.setIdentity();
  g_leftLeg.matrix.setTranslate(-0.08, -0.25, 0);
  g_leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0);
  g_leftLeg.matrix.translate(-0.057, -0.35, 0);
  g_leftLeg.matrix.scale(0.12, 0.35, 0.2);
  g_leftLeg.render();

  g_rightLeg.color = [0.6, 0.6, 0.5, 1];
  g_rightLeg.matrix.setIdentity();
  g_rightLeg.matrix.setTranslate(0.03, -0.25, 0);
  g_rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0);
  g_rightLeg.matrix.translate(0, -0.35, 0);
  g_rightLeg.matrix.scale(0.12, 0.35, 0.2);
  g_rightLeg.render();
}

function updateFPS() {
  g_frameCount++;
  const currentTime = performance.now();
  const deltaTime = currentTime - g_lastTime;

  if (deltaTime >= 250) {
    g_fps = Math.round((g_frameCount * 1000) / deltaTime);
    g_fpsElement.textContent = 'FPS: ' + g_fps;
    g_lastTime = currentTime;
    g_frameCount = 0;
  }
}