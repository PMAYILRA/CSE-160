//Pranav Mayilraj
//pmayilra@ucsc.edu

//Notes to Grader:
//Read README

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_TexCoord = a_TexCoord;
  }`;


var FSHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  uniform sampler2D u_Sampler;
  uniform vec4 u_BaseColor;
  uniform float u_TexColorWeight;
  varying vec2 v_TexCoord;
  void main() {
    vec4 texColor = texture2D(u_Sampler, v_TexCoord);
    gl_FragColor = (1.0 - u_TexColorWeight) * u_BaseColor + u_TexColorWeight * texColor;
  }`;

var canvas;
var gl;
var a_Position;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_GlobalRotateMatrix;



var a_TexCoord;
var u_Sampler;
var texture;

var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 5;
var g_Type = POINT;
var g_selectedSegments = 10;
var g_globalAngle = 0;

var g_shapesList = [];

var g_treasures = [];
var g_foundTreasures = 0;
var g_totalTreasures = 3;
var g_treasureTexture = null;

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

var groundPlane = null;

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

var u_BaseColor;
var u_TexColorWeight;

var g_isPokeAnimation = false;

var u_ViewMatrix;
var u_ProjectionMatrix;
var g_viewMatrix;
var g_projectionMatrix;
var camera;

var g_worldMap = {}; 
var g_blockSize = 1.0; 
var g_maxStackHeight = 5;

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
  
  a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
      console.log('Failed to get the storage location of a_TexCoord');
      return;
  }

  //u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  // if (!u_FragColor) {
  //     console.log('Failed to get the storage location of u_FragColor');
  //     return;
  // }

  //u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_FragColor) {
  //     console.log('Failed to get the storage location of u_Size');
  //     return;
  // }

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
  
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return;
  }

  u_BaseColor = gl.getUniformLocation(gl.program, 'u_BaseColor');
  if (!u_BaseColor) {
      console.log('Failed to get the storage location of u_BaseColor');
      return;
  }

  u_TexColorWeight = gl.getUniformLocation(gl.program, 'u_TexColorWeight');
  if (!u_TexColorWeight) {
      console.log('Failed to get the storage location of u_TexColorWeight');
      return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
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
  let lastMouseX = null;
  let lastMouseY = null;

  canvas.onmousedown = function (event) {
    g_isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    
    if (event.shiftKey) {
      g_isPokeAnimation = true;
      g_leftArmAnimation = true;
      g_legAnimation = true;
    }
  };
  
  canvas.onmouseup = function () {
    g_isDragging = false;
    lastMouseX = null;
    lastMouseY = null;
  
    g_isPokeAnimation = false;
    g_leftArmAnimation = false;
    g_legAnimation = false;
  };

  canvas.onmousemove = function (event) {
    if (g_isDragging) {
      if (lastMouseX !== null && lastMouseY !== null) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        
        camera.handleMouseMove(deltaX, deltaY);
        
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
      
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

    document.onkeydown = function(ev) {
      const key = ev.key.toLowerCase();
      const speed = ev.shiftKey ? 0.2 : 0.1;
  
      switch(key) {
        case 'w':
          camera.moveForward(speed);
          break;
        case 's':
          camera.moveBackwards(speed);
          break;
        case 'a':
          camera.moveLeft(speed);
          break;
        case 'd':
          camera.moveRight(speed);
          break;
        case 'q':
          camera.panLeft();
          break;
        case 'e':
          camera.panRight();
          break;
        case 'f':
          addBlockInFront();
          renderAllShapes();
          break;
          
        case 'g':
          removeBlockInFront();
          renderAllShapes();
          break;
        case 'h':
          alert(getTreasureHint());
          renderAllShapes();
          break; 
        case 'l':
          saveWorld();
          break;
          
        case 'k':
          loadWorld();
          renderAllShapes();
          break;
        case 'arrowup':
          camera.eye.elements[1] += speed;
          camera.at.elements[1] += speed;
          camera.updateViewMatrix();
          break;
        case 'arrowdown':
          camera.eye.elements[1] -= speed;
          camera.at.elements[1] -= speed;
          camera.updateViewMatrix();
          break;
        default:
          return;
      }
      renderAllShapes();
    };

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

function initTextures() {
  var rockTexture = gl.createTexture();
  var rockImage = new Image();
  rockImage.onload = function() {
    loadTexture(rockImage, rockTexture);
    renderAllShapes();
  };
  rockImage.onerror = function() {
    console.log('Failed to load rock texture');
  };
  rockImage.src = 'rock.jpg';

  var treasureTexture = gl.createTexture();
  var treasureImage = new Image();
  treasureImage.onload = function() {
    loadTexture(treasureImage, treasureTexture);
    g_treasureTexture = treasureTexture;
    generateTreasures();
    renderAllShapes();
  };
  treasureImage.src = 'gold.jpg';

  var grassTexture = gl.createTexture();
  if (!grassTexture) {
    console.log('Failed to create grass texture object');
    return false;
  }

  var grassImage = new Image();
  grassImage.onload = function() {
    loadTexture(grassImage, grassTexture);
    renderAllShapes();
  };
  grassImage.onerror = function() {
    console.log('Failed to load grass texture');
  };
  grassImage.src = 'grass.jpg';

  window.textures = {
    rock: rockTexture,
    grass: grassTexture
  };

  return true;
}


function loadTexture(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  gl.enable(gl.DEPTH_TEST);
  addActionsForHtmlUI();
  
  camera = new Camera();
  
  initTextures();
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  renderAllShapes();
  
  requestAnimationFrame(tick);
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  checkTreasureCollection();
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

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  var globalRotMat = new Matrix4();
  globalRotMat.multiply(g_rotationMatrix);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  const frontPos = getBlockInFront();
  const frontKey = `${frontPos.x}_${frontPos.z}`;
  const frontHeight = g_worldMap[frontKey] || 0;
  
  const highlightCube = new Cube();
  
  if (frontHeight > 0) {
    highlightCube.color = [1, 0, 0, 0.5];
  } else {
    highlightCube.color = [0, 1, 0, 0.5];
  }
  
  gl.uniform1f(u_TexColorWeight, 0.0);
  
  highlightCube.matrix = new Matrix4();
  highlightCube.matrix.translate(
    frontPos.x,
    frontHeight - 0.5,
    frontPos.z
  );
  highlightCube.matrix.scale(g_blockSize, 0.1, g_blockSize);
  highlightCube.render();

  if (g_treasureTexture) {
    gl.uniform1f(u_TexColorWeight, 1.0);
    const treasureCube = new Cube();
    treasureCube.texture = g_treasureTexture;
    
    g_treasures.forEach(treasure => {
      if (!treasure.found) {
        treasureCube.matrix = new Matrix4();
        treasureCube.matrix.translate(treasure.x, 0.5, treasure.z);
        treasureCube.matrix.scale(0.5, 0.5, 0.5);
        treasureCube.renderQuick();
      }
    });
  }
  gl.uniform4f(u_BaseColor, 0.2, 0.6, 1.0, 1.0); 
  gl.uniform1f(u_TexColorWeight, 0.0); 
  drawSkybox();

  gl.uniform4f(u_BaseColor, 1.0, 1.0, 1.0, 1.0);
  gl.uniform1f(u_TexColorWeight, 1.0);

  drawGround();

  drawWalls();
}

function drawSkybox() {
  var skybox = new Cube();
  skybox.color = [0.2, 0.6, 1.0, 1.0];
  skybox.matrix.scale(100, 100, 100);
  skybox.matrix.translate(-0.5, -0.5, -0.5);
  skybox.render();
}

function drawGround() {
  if (!groundPlane) {
    groundPlane = new Cube();
    groundPlane.texture = window.textures.grass; 
    
    groundPlane.matrix.scale(100, 0.1, 100);
    
    groundPlane.matrix.translate(-0.5, 0, -0.5); 
    groundPlane.matrix.translate(0, -2, 0);
  }
  
  gl.uniform1f(u_TexColorWeight, 1.0);

  groundPlane.render();
}

function drawWalls() {
  if (!window.textures || !window.textures.rock) {
    console.log("Texture not loaded yet");
    return;
  }

  const map = [
    [4,0,6,2,5,0,3,7,1,0,8,2,4,1,0,5,3,6,0,2,7,1,4,0,3,5,2,0,6,1,8,0],
    [2,5,0,7,1,4,0,6,3,2,5,0,1,6,4,0,2,7,3,0,5,8,1,4,0,2,6,3,0,7,1,5],
    [0,3,7,1,4,0,6,2,5,0,3,7,0,2,5,1,0,4,6,3,0,2,7,5,1,0,3,8,2,0,4,6],
    [5,0,2,6,3,1,0,4,7,5,0,2,6,0,3,8,1,0,5,2,6,0,3,7,4,1,0,2,5,6,0,3],
    [1,6,0,3,7,2,5,0,4,1,6,0,3,7,0,2,6,1,0,4,2,5,0,3,7,6,1,0,4,2,5,0],
    [3,0,5,8,2,6,1,0,3,7,4,0,2,5,1,0,3,8,2,0,4,6,1,0,2,3,5,7,0,1,6,2],
    [0,2,4,0,6,3,7,1,0,2,5,3,0,1,6,4,0,2,7,5,0,3,4,6,0,2,8,1,3,0,7,4],
    [6,1,0,4,5,0,2,3,6,0,1,4,5,0,2,7,4,3,0,6,1,0,5,2,3,4,0,6,1,5,0,7],
    [2,0,3,5,0,7,4,6,2,0,3,1,6,4,0,5,2,0,3,7,4,1,0,6,5,0,2,4,7,3,1,0],
    [0,4,6,1,3,0,5,2,0,4,7,0,1,3,5,0,7,4,1,0,3,6,2,0,4,5,1,0,6,4,2,5],
    [5,3,0,2,8,1,0,4,5,3,2,0,7,6,1,0,5,3,4,2,0,7,6,1,0,8,3,5,0,6,4,1],
    [1,0,7,3,4,5,6,0,1,2,0,5,3,0,7,6,1,0,5,3,6,0,4,7,1,0,6,2,5,0,3,6],
    [0,5,2,0,6,4,3,7,0,5,1,6,0,2,4,3,0,5,6,1,0,4,3,2,0,6,4,0,3,7,5,2],
    [3,1,0,6,2,0,8,5,3,1,0,4,2,7,0,1,3,6,0,4,5,2,0,8,3,1,0,7,4,2,0,3],
    [4,0,5,7,0,3,2,6,4,0,5,1,0,3,6,2,4,0,7,5,1,0,3,4,2,0,5,3,0,1,6,4],
    [0,6,3,4,1,0,7,3,0,6,4,0,5,1,2,0,6,7,3,0,4,5,1,0,6,2,0,4,1,5,7,0],
    [2,3,0,5,7,6,1,0,2,3,0,7,6,4,0,5,2,1,0,6,3,0,5,7,4,0,1,6,2,0,3,5],
    [6,0,4,1,3,2,0,4,6,0,3,1,4,0,5,7,0,2,4,3,0,6,7,1,0,5,2,0,6,3,1,7],
    [1,4,0,2,5,0,3,1,7,4,0,2,3,5,0,6,1,0,2,7,4,0,1,3,5,0,7,2,0,4,5,6],
    [0,2,6,0,4,7,5,2,0,3,6,0,1,4,7,0,5,3,6,0,2,1,0,5,7,3,0,1,5,6,0,2],
    [3,0,1,7,0,5,4,0,3,0,1,5,0,6,3,4,0,7,1,5,0,3,4,6,0,7,5,0,3,0,2,1],
    [5,7,0,3,2,1,0,5,4,7,0,3,2,0,1,5,6,0,3,4,7,0,2,1,6,0,3,5,0,7,4,3],
    [0,1,5,0,6,3,2,0,5,1,4,0,7,3,0,2,4,5,0,1,3,7,0,2,1,4,0,3,7,2,0,4],
    [2,0,3,4,1,0,6,3,0,2,5,4,0,1,6,0,3,2,7,0,5,4,1,0,2,6,4,0,1,5,3,0],
    [4,5,0,6,0,2,1,4,3,0,6,2,5,0,4,1,0,6,2,3,0,5,7,4,0,1,6,2,0,3,7,5],
    [0,3,2,0,7,6,0,2,1,3,0,7,4,6,0,3,2,1,0,6,4,0,3,7,5,0,2,6,4,0,1,3],
    [6,0,7,5,3,0,4,6,0,5,2,3,0,7,5,0,6,4,3,0,2,1,5,0,3,2,0,7,6,1,0,2],
    [1,4,0,2,5,3,0,1,6,4,0,5,3,2,0,7,1,0,5,2,6,0,4,3,1,0,7,4,2,6,5,0],
    [0,2,4,0,1,7,5,0,2,6,3,0,1,4,7,0,5,3,0,7,1,2,0,5,6,3,0,1,5,4,0,6],
    [3,0,1,6,0,4,2,3,0,1,7,6,0,5,2,4,0,7,6,1,0,3,2,0,4,5,6,0,3,7,2,1],
    [5,6,0,3,4,0,7,5,3,0,4,1,6,0,3,5,7,2,0,4,3,0,6,1,7,0,4,5,0,2,3,4],
    [0,1,5,0,2,6,0,4,5,2,0,7,3,1,0,6,4,5,0,3,7,4,0,2,6,1,0,3,4,0,6,7]
  ];

  const wallSize = 0.5;
  const spacing = 1.0;

  gl.uniform4f(u_BaseColor, 1.0, 1.0, 1.0, 1.0);
  gl.uniform1f(u_TexColorWeight, 1.0);

  const wallCube = new Cube();
  wallCube.texture = window.textures.rock;

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      if (map[x][z] > 0) {
        wallCube.matrix = new Matrix4();
        wallCube.matrix.translate(
          x * spacing - 4,
          map[x][z]/2 - 1,
          z * spacing - 4
        );
        wallCube.matrix.scale(
          wallSize, 
          map[x][z],
          wallSize
        );
        wallCube.renderQuick();
      }
    }
  }

  for (const [key, height] of Object.entries(g_worldMap)) {
    const [x, z] = key.split('_').map(Number);
    wallCube.matrix = new Matrix4();
    wallCube.matrix.translate(x, height/2 - 1, z);
    wallCube.matrix.scale(g_blockSize, height, g_blockSize);
    wallCube.renderQuick();
  }
}

function drawTexturedWalls() {
  var wall = new Cube();
  wall.color = [1.0, 1.0, 1.0, 1.0];
  wall.matrix.translate(0, 0, -2);
  wall.matrix.scale(4, 2, 0.1);
  wall.render();
}

function drawTexturedQuad() {
  const verticesTexCoords = new Float32Array([
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0
  ]);

  if (!window.textureQuadBuffer) {
    window.textureQuadBuffer = gl.createBuffer();
    if (!window.textureQuadBuffer) {
      console.log('Failed to create the buffer object');
      return;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, window.textureQuadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  var identityMat = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMat.elements);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function getBlockInFront() {
  const forward = new Vector3([
    camera.at.elements[0] - camera.eye.elements[0],
    0,
    camera.at.elements[2] - camera.eye.elements[2]
  ]);
  forward.normalize();
  const gridPos = {
    x: Math.round(camera.eye.elements[0] + forward.elements[0] * 1.5),
    z: Math.round(camera.eye.elements[2] + forward.elements[2] * 1.5),
    y: Math.round(camera.eye.elements[1])
  };
  
  return gridPos;
}

function addBlockInFront() {
  const pos = getBlockInFront();
  const key = `${pos.x}_${pos.z}`;
  
  const currentHeight = g_worldMap[key] || 0;
  
  if (currentHeight < g_maxStackHeight) {
    g_worldMap[key] = currentHeight + 1;
    console.log(`Added block at (${pos.x}, ${currentHeight + 1}, ${pos.z})`);
  }
}

function generateTreasures() {
  g_treasures = [];
  const worldSize = 16;
  
  for (let i = 0; i < g_totalTreasures; i++) {
    g_treasures.push({
      x: (Math.random() * worldSize) - worldSize/2,
      z: (Math.random() * worldSize) - worldSize/2,
      found: false
    });
  }
  console.log("Treasures generated at:", g_treasures);
}

function checkTreasureCollection() {
  const playerPos = {
    x: Math.round(camera.eye.elements[0]),
    z: Math.round(camera.eye.elements[2])
  };

  g_treasures.forEach(treasure => {
    if (!treasure.found && 
        Math.abs(treasure.x - playerPos.x) < 1.5 && 
        Math.abs(treasure.z - playerPos.z) < 1.5) {
      treasure.found = true;
      g_foundTreasures++;
      console.log(`Found treasure! (${g_foundTreasures}/${g_totalTreasures})`);
      
      if (g_foundTreasures === g_totalTreasures) {
        console.log("Congratulations! You found all treasures!");
      }
    }
  });
}

function getTreasureHint() {
  if (g_foundTreasures >= g_totalTreasures) return "All treasures found!";
  
  const playerPos = {
    x: camera.eye.elements[0],
    z: camera.eye.elements[2]
  };
  
  let closest = { distance: Infinity, direction: "" };
  
  g_treasures.forEach(treasure => {
    if (!treasure.found) {
      const dx = treasure.x - playerPos.x;
      const dz = treasure.z - playerPos.z;
      const distance = Math.sqrt(dx*dx + dz*dz);
      
      if (distance < closest.distance) {
        closest.distance = distance;
        closest.direction = 
          `Treasure ${Math.round(distance)} units to the ` +
          `${dz > 0 ? 'north' : 'south'}${dx > 0 ? 'east' : 'west'}`;
      }
    }
  });
  
  return closest.direction || "No treasures left!";
}

function removeBlockInFront() {
  const pos = getBlockInFront();
  const key = `${pos.x}_${pos.z}`;
  
  if (g_worldMap[key] && g_worldMap[key] > 0) {
    g_worldMap[key] -= 1;
    console.log(`Removed block at (${pos.x}, ${g_worldMap[key] + 1}, ${pos.z})`);
    
    if (g_worldMap[key] === 0) {
      delete g_worldMap[key];
    }
  } else {
    console.log(`No blocks to remove at (${pos.x}, ${pos.z})`);
  }
}

function saveWorld() {
  localStorage.setItem('blockWorld', JSON.stringify(g_worldMap));
  console.log('World saved');
}

function loadWorld() {
  const saved = localStorage.getItem('blockWorld');
  if (saved) {
    g_worldMap = JSON.parse(saved);
    console.log('World loaded');
  }
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