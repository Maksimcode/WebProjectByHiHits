const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

function setWhiteBackground() {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

ctx.lineWidth = 10;
ctx.lineCap = "round";
ctx.strokeStyle = "#000000";

let isDrawing = false;

setWhiteBackground();

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  ctx.closePath();
});

// Очистка Canvas
function clearCanvas() {
  setWhiteBackground();
}

function saveImage(matrix, filename, width, height) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");

  const imageData = tempCtx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const value = matrix[y][x] * 255;
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  tempCtx.putImageData(imageData, 0, 0);

  const link = document.createElement("a");
  link.href = tempCanvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

function getCenterOfMass(matrix) {
  let totalMass = 0;
  let centerX = 0;
  let centerY = 0;

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      const value = matrix[y][x];
      totalMass += value;
      centerX += x * value;
      centerY += y * value;
    }
  }

  if (totalMass === 0) {
    console.error("Центр масс не может быть вычислен: изображение пустое.");
    return { centerX: 0, centerY: 0 };
  }

  centerX /= totalMass;
  centerY /= totalMass;

  return { centerX, centerY };
}

function shiftImage(matrix, shiftX, shiftY) {
  const height = matrix.length;
  const width = matrix[0].length;

  const shifted = Array.from({ length: height }, () => Array(width).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = x - shiftX;
      const srcY = y - shiftY;

      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        shifted[y][x] = matrix[srcY][srcX];
      }
    }
  }

  return shifted;
}

function splitDigits(matrix) {
  const columnSums = Array(matrix[0].length).fill(0);

  for (let x = 0; x < matrix[0].length; x++) {
    for (let y = 0; y < matrix.length; y++) {
      columnSums[x] += matrix[y][x];
    }
  }

  const digits = [];
  let start = 0;
  let inDigit = false;

  for (let x = 0; x < columnSums.length; x++) {
    if (columnSums[x] > 0 && !inDigit) {
      start = x;
      inDigit = true;
    } else if (columnSums[x] === 0 && inDigit) {
      const digit = matrix.map((row) => row.slice(start, x));
      digits.push(digit);
      inDigit = false;
    }
  }

  if (inDigit) {
    const digit = matrix.map((row) => row.slice(start));
    digits.push(digit);
  }

  return digits;
}

function preprocessImage(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const grayscale = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    grayscale.push(1 - avg / 255);
  }

  let matrix = [];
  for (let y = 0; y < canvas.height; y++) {
    const row = grayscale.slice(y * canvas.width, (y + 1) * canvas.width);
    matrix.push(row);
  }

  while (matrix.length > 0 && matrix[0].every((v) => v === 0)) matrix.shift();
  while (matrix.length > 0 && matrix[matrix.length - 1].every((v) => v === 0))
    matrix.pop();
  while (matrix.length > 0 && matrix.every((row) => row[0] === 0))
    matrix.forEach((row) => row.shift());
  while (matrix.length > 0 && matrix.every((row) => row[row.length - 1] === 0))
    matrix.forEach((row) => row.pop());

  if (matrix.length === 0 || matrix[0].length === 0) {
    console.error("Цифра не найдена на изображении.");
    return null;
  }

  const digits = splitDigits(matrix);

  const processedDigits = digits.map((digit) => {
    const scale = Math.max(digit.length, digit[0].length) / 20;
    const newHeight = Math.round(digit.length / scale);
    const newWidth = Math.round(digit[0].length / scale);

    const resized = Array.from({ length: newHeight }, () =>
      Array(newWidth).fill(0)
    );
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const origX = Math.floor(x * scale);
        const origY = Math.floor(y * scale);
        resized[y][x] = digit[origY]?.[origX] ?? 0;
      }
    }

    const padY = Math.floor((28 - newHeight) / 2);
    const padX = Math.floor((28 - newWidth) / 2);
    const padded = Array.from({ length: 28 }, (_, y) =>
      Array.from({ length: 28 }, (_, x) =>
        y >= padY && y < padY + newHeight && x >= padX && x < padX + newWidth
          ? resized[y - padY][x - padX]
          : 0
      )
    );

    const { centerX, centerY } = getCenterOfMass(padded);
    const shiftX = Math.round(14 - centerX);
    const shiftY = Math.round(14 - centerY);
    const centered = shiftImage(padded, shiftX, shiftY);

    const final = Array.from({ length: 50 }, () => Array(50).fill(0));
    const offset = 11; // (50 - 28) / 2
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        final[offset + y][offset + x] = centered[y][x];
      }
    }

    return final.flat();
  });

  return processedDigits;
}

async function predictDigit() {
  const processedDigits = preprocessImage(canvas);

  if (!processedDigits || processedDigits.length === 0) {
    alert("Число не найдено. Пожалуйста, нарисуйте число на Canvas.");
    return;
  }

  try {
    const predictions = await Promise.all(
      processedDigits.map(async (digit) => {
        const response = await fetch("/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: digit }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const result = await response.json();
        return result.prediction;
      })
    );

    const number = predictions.join("");
    document.getElementById("result").innerText = `Результат: ${number}`;
  } catch (error) {
    console.error("Ошибка при отправке запроса:", error);
    alert("Произошла ошибка при распознавании числа.");
  }
}
