// asg0.js

let canvas, ctx;

function main() {
  canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  ctx = canvas.getContext('2d');

  clearCanvas();
}

function clearCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  let scale = 20;
  let endX = centerX + v.elements[0] * scale;
  let endY = centerY - v.elements[1] * scale;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent() {
  let x1 = parseFloat(document.getElementById("xCoord1").value);
  let y1 = parseFloat(document.getElementById("yCoord1").value);

  let x2 = parseFloat(document.getElementById("xCoord2").value);
  let y2 = parseFloat(document.getElementById("yCoord2").value);

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);

  clearCanvas();
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function angleBetween(v1, v2) {
  let dotProduct = Vector3.dot(v1, v2);
  let magnitudeV1 = v1.magnitude();
  let magnitudeV2 = v2.magnitude();
  let cosAlpha = dotProduct / (magnitudeV1 * magnitudeV2);
  let alpha = Math.acos(cosAlpha);
  return alpha * (180 / Math.PI);
}

function areaTriangle(v1, v2) {
  let crossProduct = Vector3.cross(v1, v2);
  let areaParallelogram = crossProduct.magnitude();
  return areaParallelogram / 2;
}

function handleDrawOperationEvent() {
  clearCanvas();

  let x1 = parseFloat(document.getElementById("xCoord1").value);
  let y1 = parseFloat(document.getElementById("yCoord1").value);
  let x2 = parseFloat(document.getElementById("xCoord2").value);
  let y2 = parseFloat(document.getElementById("yCoord2").value);
  let scalar = parseFloat(document.getElementById("scalarInput").value);
  let operation = document.getElementById("operationSelector").value;

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  if (operation === "add") {
    let v3 = new Vector3();
    v3.set(v1.add(v2));
    drawVector(v3, "green");
  } else if (operation === "sub") {
    let v3 = new Vector3();
    v3.set(v1.sub(v2));
    drawVector(v3, "green");
  } else if (operation === "mul") {
    let v3 = new Vector3();
    let v4 = new Vector3();
    v3.set(v1.mul(scalar));
    v4.set(v2.mul(scalar));
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === "div") {
    let v3 = new Vector3();
    let v4 = new Vector3();
    v3.set(v1.div(scalar));
    v4.set(v2.div(scalar));
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === "magnitude") {
    console.log("Magnitude of v1:", v1.magnitude());
    console.log("Magnitude of v2:", v2.magnitude());
  } else if (operation === "normalize") {
    let v3 = new Vector3();
    let v4 = new Vector3();
    v3.set(v1.normalize());
    v4.set(v2.normalize());
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === "angle") {
    console.log("Angle between v1 and v2:", angleBetween(v1, v2), "degrees");
  } else if (operation === "area") {
    console.log("Area of triangle:", areaTriangle(v1, v2));
  }
}