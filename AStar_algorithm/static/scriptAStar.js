function createGrid() {
  const gridSize = parseInt(document.getElementById("gridSize").value);

  isGeneratingObstacles = false;
  isPathGenerated = false;
  startCell = null;
  goalCell = null;

  const container = document.getElementById("gridContainer");
  container.innerHTML = "";

  grid = [];

  const cellSize = 600 / gridSize;

  container.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
  container.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;

  for (let row = 0; row < gridSize; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "row";

    let rowArray = [];

    for (let col = 0; col < gridSize; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;

      cell.addEventListener("click", handleCellClick);

      rowElement.appendChild(cell);
      rowArray.push(cell);
    }

    container.appendChild(rowElement);
    grid.push(rowArray);
  }
}

function generateMazeDFS() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      grid[row][col].classList.add("obstacle");
    }
  }

  const effectiveRows = gridSize - (gridSize % 2 === 0 ? 1 : 0);
  const effectiveCols = gridSize - (gridSize % 2 === 0 ? 1 : 0);

  function getNeighbors(row, col) {
    const neighbors = [];
    const directions = [
      [0, 2],
      [2, 0],
      [0, -2],
      [-2, 0],
    ];
    for (let [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 &&
        newRow < effectiveRows &&
        newCol >= 0 &&
        newCol < effectiveCols
      ) {
        neighbors.push([newRow, newCol]);
      }
    }
    return neighbors;
  }

  function carveMaze(row, col) {
    grid[row][col].classList.remove("obstacle");
    const neighbors = getNeighbors(row, col);
    shuffleArray(neighbors);

    for (let [nRow, nCol] of neighbors) {
      if (grid[nRow][nCol].classList.contains("obstacle")) {
        grid[(row + nRow) / 2][(col + nCol) / 2].classList.remove("obstacle");
        carveMaze(nRow, nCol);
      }
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const startRow = Math.floor(Math.random() * (effectiveRows - 2)) + 1;
  const startCol = Math.floor(Math.random() * (effectiveCols - 2)) + 1;
  carveMaze(startRow - (startRow % 2), startCol - (startCol % 2));
}

function refreshGrid() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = grid[row][col];
      cell.classList.remove(
        "obstacle",
        "path",
        "start",
        "goal",
        "open",
        "closed"
      );
    }
  }

  startCell = null;
  goalCell = null;
  isPathGenerated = false;
  isGeneratingObstacles = false;
}

function generatePath() {
  if (!startCell || !goalCell) {
    alert("Please set the starting and goal points.");
    return;
  }

  const openSet = [];
  const closedSet = [];
  let pathFound = false;

  openSet.push(startCell);

  let animationDelay = animationSpeed;

  while (openSet.length > 0) {
    let winner = 0;

    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }

    const current = openSet[winner];

    if (current === goalCell) {
      pathFound = true;
      break;
    }

    openSet.splice(winner, 1);
    closedSet.push(current);

    setTimeout(() => {
      current.classList.remove("open");
      current.classList.add("closed");
    }, animationDelay);

    const neighbors = getNeighbors(current);

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (
        !closedSet.includes(neighbor) &&
        !neighbor.classList.contains("obstacle")
      ) {
        const tempG = current.g + 1;

        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          openSet.push(neighbor);

          setTimeout(() => {
            neighbor.classList.add("open");
          }, animationDelay);
        }

        neighbor.h = heuristic(neighbor, goalCell);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }

    animationDelay += animationSpeed;
  }

  if (pathFound) {
    let path = [];
    let temp = goalCell;
    path.push(temp);

    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    for (let i = path.length - 1; i >= 0; i--) {
      setTimeout(() => {
        path[i].classList.remove("open", "closed");
        path[i].classList.add("path");
      }, animationDelay + animationSpeed * (path.length - i));
    }
  } else {
    alert("path now found:(");
  }

  isPathGenerated = true;
}

function heuristic(a, b) {
  const distance =
    Math.abs(a.dataset.row - b.dataset.row) +
    Math.abs(a.dataset.col - b.dataset.col);
  return distance;
}

function getNeighbors(cell) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const neighbors = [];

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < gridSize - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < gridSize - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

function handleCellClick(event) {
  const cell = event.target;

  if (isGeneratingObstacles || isDrawingObstacles) {
    cell.classList.toggle("obstacle");
  } else {
    if (!isPathGenerated) {
      if (isSelectingStart) {
        if (!startCell) {
          cell.classList.add("start");
          startCell = cell;
        } else {
          startCell.classList.remove("start");
          cell.classList.add("start");
          startCell = cell;
        }
      } else if (isSelectingEnd) {
        if (!goalCell) {
          cell.classList.add("goal");
          goalCell = cell;
        } else {
          goalCell.classList.remove("goal");
          cell.classList.add("goal");
          goalCell = cell;
        }
      } else {
        alert("something wrong");
      }
    }
  }
}

document
  .getElementById("randomizeObstacles")
  .addEventListener("click", randomizeObstacles);
document.getElementById("refreshGrid").addEventListener("click", refreshGrid);
document.getElementById("generatePath").addEventListener("click", generatePath);
document
  .getElementById("randomizeObstacles")
  .addEventListener("click", generateMazeDFS);

let grid = [];

const gridContainer = document.getElementById("gridContainer");

let startCell = null;
let goalCell = null;

let isGeneratingObstacles = false;
let isPathGenerated = false;
let isDrawingObstacles = true;
let isSelectingStart = false;
let isSelectingEnd = false;

const gridSizeInput = document.getElementById("gridSize");
const showSize = document.getElementById("showSize");
let gridSize = parseInt(gridSizeInput.value);
gridSizeInput.addEventListener("input", function () {
  gridSize = parseInt(gridSizeInput.value);
  showSize.textContent = gridSize;
  createGrid();
});

const timeoutInput = document.getElementById("timeout");
const showTimeout = document.getElementById("showTimeout");
let animationSpeed = parseInt(timeoutInput.value);
timeoutInput.addEventListener("input", function () {
  animationSpeed = parseInt(timeoutInput.value);
  showTimeout.textContent = animationSpeed;
});

// const constructionMode = document.getElementById("selectionConstruct");
// constructionMode.addEventListener("change", function () {
//   if (constructionMode.value == document.getElementById("drawObstacles").text) {
//     isDrawingObstacles = true;
//     isSelectingStart = false;
//     isSelectingEnd = false;
//   } else if (
//     constructionMode.value == document.getElementById("selectStart").text
//   ) {
//     isSelectingStart = true;
//     isDrawingObstacles = false;
//     isSelectingEnd = false;
//   } else {
//     isSelectingEnd = true;
//     isSelectingStart = false;
//     isDrawingObstacles = false;
//   }
// });

const selectStart = document.getElementById("selectStart");
selectStart.addEventListener("click", function () {
  isSelectingStart = true;
  isDrawingObstacles = false;
  isSelectingEnd = false;
});

const selectEnd = document.getElementById("selectEnd");
selectEnd.addEventListener("click", function () {
  isSelectingEnd = true;
  isSelectingStart = false;
  isDrawingObstacles = false;
});

const drawObstacles = document.getElementById("drawObstacles");
drawObstacles.addEventListener("click", function () {
  isDrawingObstacles = true;
  isSelectingStart = false;
  isSelectingEnd = false;
});

createGrid();
