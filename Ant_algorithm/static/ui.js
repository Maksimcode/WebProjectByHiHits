export function initCanvas(backgroundCanvas, dynamicCanvas, graph) {
  backgroundCanvas.addEventListener("click", (event) => {
    const rect = backgroundCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    graph.addNode(x, y);
    drawNode(backgroundCanvas.getContext("2d"), x, y);
  });
}

export function drawNode(ctx, x, y) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBestPath(ctx, graph, bestPath, strokeStyle = "red") {
  if (!bestPath) return;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = strokeStyle === "yellow" ? 4 : 2;
  ctx.beginPath();
  const start = bestPath[0];
  ctx.moveTo(graph.nodes[start].x, graph.nodes[start].y);
  for (let idx of bestPath) {
    ctx.lineTo(graph.nodes[idx].x, graph.nodes[idx].y);
  }
  ctx.stroke();
}

export function updateBestDistanceDisplay(bestDistance, iteration) {
  const bestDistanceElem = document.getElementById("bestDistance");
  bestDistanceElem.textContent =
    bestDistance.toFixed(2) + " (Итерация: " + (iteration + 1) + ")";
}

export function appendIterationResult(bestDistance, iteration) {
  const resultsList = document.getElementById("resultsList");
  const li = document.createElement("li");
  li.textContent = `Итерация ${
    iteration + 1
  }: Лучшее расстояние - ${bestDistance.toFixed(2)}`;
  resultsList.appendChild(li);
}
