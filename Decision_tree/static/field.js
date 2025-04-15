// Зумирование элемента с id "root"
const rootElement = document.getElementById("root");

rootElement.addEventListener("wheel", (event) => {
  event.preventDefault();
  const delta = Math.sign(event.deltaY);
  const currentZoom = parseFloat(window.getComputedStyle(rootElement).zoom);
  const newZoom = currentZoom - delta * 0.1;
  
  if (newZoom >= 0.1 && newZoom <= 5) {
    rootElement.style.zoom = newZoom;
  }
});

// Реализация перетаскивания (панорамирования) для элемента с id "tree"
const treeElement = document.getElementById("tree");
let isDragging = false;
let dragStart = { left: 0, top: 0, x: 0, y: 0 };

const handleMouseDown = (e) => {
  isDragging = true;
  treeElement.style.cursor = "grabbing";
  treeElement.style.userSelect = "none";
  
  dragStart = {
    left: treeElement.scrollLeft,
    top: treeElement.scrollTop,
    x: e.clientX,
    y: e.clientY,
  };
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  
  const deltaX = e.clientX - dragStart.x;
  const deltaY = e.clientY - dragStart.y;
  
  treeElement.scrollLeft = dragStart.left - deltaX;
  treeElement.scrollTop = dragStart.top - deltaY;
};

const handleMouseUp = () => {
  isDragging = false;
  treeElement.style.cursor = "default";
  treeElement.style.removeProperty("user-select");
};

treeElement.addEventListener("mousedown", handleMouseDown);
treeElement.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);
