const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
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

var g_selectedColor=[1.0,1.0,1.0,1.0];
var g_selectedSize=5;
var g_Type = POINT;
var g_selectedSegments = 10;

var g_shapesList = [];

let isDay = true;
let dayNightInterval = null;

function setupWebGL(){
  canvas = document.getElementById('webgl');

  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
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

}

function addActionsForHtmlUI(){
  document.getElementById('clearButton').onclick = function() {
    g_shapesList=[]; 
    renderAllShapes();
    if (dayNightInterval !== null) {
      clearInterval(dayNightInterval);
      dayNightInterval = null;
    }
  };
  document.getElementById('pointButton').onclick = function() { g_Type = POINT; };
  document.getElementById('triangleButton').onclick = function() {g_Type = TRIANGLE;};
  document.getElementById("undoButton").addEventListener("click", function() {
    if (g_shapesList.length > 0) {
      g_shapesList.pop();
      renderAllShapes();
    }
  });
  document.getElementById('daynightButton').addEventListener('click', () => {
    if (dayNightInterval !== null) return;
  
    isDay = true;
    drawForest();
  
    dayNightInterval = setInterval(() => {
      isDay = !isDay;
      if (isDay) {
        drawForest();
      } else {
        drawNight();
      }
    }, 5000);
  });
  document.getElementById('circleButton').onclick = function() {g_Type = CIRCLE;};
  ['redSlider', 'greenSlider', 'blueSlider'].forEach((id, i) => {
    document.getElementById(id).addEventListener('input', function() {
      g_selectedColor[i] = this.value / 100;
      updateColorPreview();
    });
  });
  document.getElementById('segmentSlider').addEventListener('mouseup', function() {
    const seg = parseInt(this.value);
    g_selectedSegments = seg;
  });

  updateSelectedColor();
  function updateColorPreview() {
    const r = Math.floor(g_selectedColor[0] * 255);
    const g = Math.floor(g_selectedColor[1] * 255);
    const b = Math.floor(g_selectedColor[2] * 255);
    const preview = document.getElementById('colorPreview');
    if (preview) {
      preview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    }
  }
  updateColorPreview();
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
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

  addActionsForHtmlUI();
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawTree(x, y, scale = 1.0) {
  const trunkColor = [0.55, 0.27, 0.07, 1.0];
  const leafColor = [0.0, 0.5, 0.0, 1.0];

  const trunkWidth = 0.05 * scale;
  const trunkHeight = 0.15 * scale;

  const tx1 = x - trunkWidth / 2;
  const tx2 = x + trunkWidth / 2;
  const ty1 = y;
  const ty2 = y + trunkHeight;

  drawTriangle([
    tx1, ty1,
    tx2, ty1,
    tx1, ty2
  ], trunkColor);
  drawTriangle([
    tx2, ty1,
    tx1, ty2,
    tx2, ty2
  ], trunkColor);

  const leafHeight = 0.12 * scale;
  const leafWidth = 0.2 * scale;
  const numLayers = 3;

  for (let i = 0; i < numLayers; i++) {
    const layerBase = ty2 + i * (leafHeight * 0.8);
    const top = layerBase + leafHeight;
    drawTriangle([
      x - leafWidth / 2, layerBase,
      x + leafWidth / 2, layerBase,
      x, top
    ], leafColor);
  }
}

function drawClouds() {
  const cloudColor = [1.0, 1.0, 1.0, 1.0];

  drawTriangle([-0.8, 0.65, -0.7, 0.65, -0.75, 0.7], cloudColor);
  drawTriangle([-0.75, 0.7, -0.65, 0.65, -0.7, 0.75], cloudColor);
  drawTriangle([-0.7, 0.75, -0.6, 0.65, -0.65, 0.7], cloudColor);
  drawTriangle([-0.75, 0.7, -0.7, 0.75, -0.65, 0.7], cloudColor);

  drawTriangle([0.5, 0.7, 0.6, 0.7, 0.55, 0.75], cloudColor);
  drawTriangle([0.55, 0.75, 0.65, 0.7, 0.6, 0.76], cloudColor);
  drawTriangle([0.6, 0.76, 0.7, 0.7, 0.65, 0.74], cloudColor);
}

function drawNightClouds() {
  const cloudColor = [0.85, 0.85, 0.85, 1.0];

  drawTriangle([-0.9, 0.4, -0.8, 0.4, -0.85, 0.45], cloudColor);
  drawTriangle([-0.85, 0.45, -0.75, 0.4, -0.8, 0.46], cloudColor);

  drawTriangle([-0.2, 0.35, -0.1, 0.35, -0.15, 0.4], cloudColor);
  drawTriangle([-0.15, 0.4, -0.05, 0.35, -0.1, 0.41], cloudColor);
  drawTriangle([-0.1, 0.41, 0.0, 0.35, -0.05, 0.39], cloudColor);

  drawTriangle([0.4, 0.38, 0.5, 0.38, 0.45, 0.43], cloudColor);
  drawTriangle([0.45, 0.43, 0.55, 0.38, 0.5, 0.44], cloudColor);
}

function drawCircle(x, y, radius, color, segments = 30) {
  const angleStep = 2 * Math.PI / segments;
  for (let i = 0; i < segments; i++) {
    const angle1 = i * angleStep;
    const angle2 = (i + 1) * angleStep;

    const x1 = x + radius * Math.cos(angle1);
    const y1 = y + radius * Math.sin(angle1);
    const x2 = x + radius * Math.cos(angle2);
    const y2 = y + radius * Math.sin(angle2);

    drawTriangle([x, y, x1, y1, x2, y2], color);
  }
}

function drawSun() {
  const sunCenter = [-0.25, 0.8];
  const sunRadius = 0.08;
  const rayLength = 0.12;
  const rayCount = 12;
  const sunColor = [1.0, 0.9, 0.3, 1.0];

  drawCircle(sunCenter[0], sunCenter[1], sunRadius, sunColor);

  for (let i = 0; i < rayCount; i++) {
    const angle = (2 * Math.PI * i) / rayCount;
    const innerX = sunCenter[0] + sunRadius * Math.cos(angle);
    const innerY = sunCenter[1] + sunRadius * Math.sin(angle);
    const outerX = sunCenter[0] + (sunRadius + rayLength) * Math.cos(angle);
    const outerY = sunCenter[1] + (sunRadius + rayLength) * Math.sin(angle);
    const midAngle = angle + Math.PI / rayCount;
    const midX = sunCenter[0] + (sunRadius + rayLength * 0.7) * Math.cos(midAngle);
    const midY = sunCenter[1] + (sunRadius + rayLength * 0.7) * Math.sin(midAngle);

    drawTriangle([innerX, innerY, outerX, outerY, midX, midY], sunColor);
  }
}

function drawForest() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const skyColor = [0.6, 0.8, 1.0, 1.0];
  const groundColor = [0.4, 0.2, 0.0, 1.0];

  const groundTop = -0.2;

  drawTriangle([
    -1.0, groundTop,
    1.0, groundTop,
    -1.0, 1.0
  ], skyColor);
  drawTriangle([
    1.0, groundTop,
    -1.0, 1.0,
    1.0, 1.0
  ], skyColor);

  drawTriangle([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, groundTop
  ], groundColor);
  drawTriangle([
    1.0, -1.0,
    -1.0, groundTop,
    1.0, groundTop
  ], groundColor);

  drawTree(-0.7, -0.2, 1.0);
  drawTree(-0.4, -0.2, 0.7);
  drawTree(0.0, -0.2, 1.2);
  drawTree(0.3, -0.2, 0.6);
  drawTree(0.6, -0.2, 0.9);
  drawClouds();
  drawSun();
}

function drawNight() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const nightSkyColor = [0.0, 0.0, 0.0, 1.0];
  const groundColor = [0.4, 0.2, 0.0, 1.0];
  const moonColor = [0.9, 0.9, 0.95, 1.0];

  const groundTop = -0.2;

  drawTriangle([
    -1.0, groundTop,
    1.0, groundTop,
    -1.0, 1.0
  ], nightSkyColor);
  drawTriangle([
    1.0, groundTop,
    -1.0, 1.0,
    1.0, 1.0
  ], nightSkyColor);

  drawTriangle([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, groundTop
  ], groundColor);
  drawTriangle([
    1.0, -1.0,
    -1.0, groundTop,
    1.0, groundTop
  ], groundColor);

  drawCircle(0.0, 0.75, 0.1, moonColor, 32);

  drawClouds();
  drawNightClouds();
}

class Point{
  constructor(){
    this.type='point';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = 5.0;
  }

  render(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle{
  constructor(){
    this.type='triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = g_selectedSize / 2.0;
  }

  render(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size / 2.0;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    var newsize = size/100.0;
    drawTriangle([
      xy[0], xy[1]+newsize,
      xy[0]-newsize, xy[1]-newsize,
      xy[0]+newsize, xy[1]-newsize
    ], rgba);
  }
}

function drawTriangle(vertices, color){
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

class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = g_selectedSize / 1.5;
    this.segments = g_selectedSegments;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    var d = this.size / 200.0;

    let angleStep = 360 / this.segments;

    for (var angle = 0; angle < 360; angle += angleStep) {
      let centerPt = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
      let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]], rgba); // Pass color
    }
  }
}

function click(ev) {
  var [x,y] = convertCoordinatesEventToGL(ev);

  var point;

  if(g_Type==POINT){
    point = new Point();
  } else if (g_Type==TRIANGLE){
    point = new Triangle();
  } else if (g_Type==CIRCLE){
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}