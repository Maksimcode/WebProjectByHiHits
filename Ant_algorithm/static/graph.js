export class Graph {
    constructor() {
      this.nodes = [];
    }
  
    // Добавляем новую вершину
    addNode(x, y) {
      this.nodes.push({ x, y });
    }
  
    // Вычисляем евклидово расстояние между вершинами с индексами i и j
    distance(i, j) {
      const dx = this.nodes[i].x - this.nodes[j].x;
      const dy = this.nodes[i].y - this.nodes[j].y;
      return Math.hypot(dx, dy);
    }
  }
  