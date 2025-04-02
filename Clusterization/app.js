function createGrid() {
  const ROWS = 50;
  const COLS = 50;
  const container = document.getElementById("gridContainer");
  container.innerHTML = "";

  let grid = [];

  for (let row = 0; row < ROWS; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "row";

    let rowArray = [];

    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("mouseover", handleCellHover);
      cell.addEventListener("click", handleCellClick);
      rowElement.appendChild(cell);
      rowArray.push(cell);
    }

    container.appendChild(rowElement);
    grid.push(rowArray);
  }
}

function handleCellHover(event) {
  const cell = event.target;
  // cell.classList.add("selected");
}

function handleCellClick(event) {
  const cell = event.target;
  cell.classList.add("selected");
}

createGrid();
