import { Graph } from './graph.js';
import { ACO } from './aco.js';
import { initCanvas, drawNode, drawBestPath, updateBestDistanceDisplay, appendIterationResult } from './ui.js';

const backgroundCanvas = document.getElementById('canvas-background');
const dynamicCanvas = document.getElementById('canvas-dynamic');
const backgroundCtx = backgroundCanvas.getContext('2d');
const dynamicCtx = dynamicCanvas.getContext('2d');

const graph = new Graph();

// Инициализируем фон: клик по фоновому canvas добавляет точки
initCanvas(backgroundCanvas, dynamicCanvas, graph);

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', async () => {
  if (graph.nodes.length < 2) {
    alert('Добавьте хотя бы две вершины');
    return;
  }
  
  const iterations = parseInt(document.getElementById('iterationsInput').value) || 100;
  const iterationDelay = parseInt(document.getElementById('delayInput').value) || 10;
  const alpha = parseFloat(document.getElementById('alphaInput').value) || 1;
  const beta = parseFloat(document.getElementById('betaInput').value) || 5;
  const evaporation = parseFloat(document.getElementById('evaporationInput').value) || 0.5;
  const Q = parseFloat(document.getElementById('qInput').value) || 100;
  
  // Очищаем список результатов итераций
  document.getElementById('resultsList').innerHTML = '';
  
  const params = {
    numAnts: 10,
    iterations: iterations,
    alpha: alpha,
    beta: beta,
    evaporation: evaporation,
    Q: Q,
    iterationDelay: iterationDelay
  };

  // Перед запуском алгоритма перерисовываем фон с точками
  backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
  graph.nodes.forEach(node => {
    drawNode(backgroundCtx, node.x, node.y);
  });
  // Очищаем динамический слой
  dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
  
  // Callback для обновления UI на каждой итерации:
  const updateCallback = (bestDistance, iter, bestPath) => {
    updateBestDistanceDisplay(bestDistance, iter);
    appendIterationResult(bestDistance, iter);
    // Очищаем динамический canvas, чтобы не накапливались старые маршруты
    dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
    drawBestPath(dynamicCtx, graph, bestPath, 'rgba(0, 0, 255, 0.3)');
  };

  const aco = new ACO(graph, params);
  const result = await aco.run(updateCallback);
  console.log("Лучший путь:", result.bestPath);
  console.log("Длина пути:", result.bestDistance);
  
  dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
  drawBestPath(dynamicCtx, graph, result.bestPath, 'red');
});
