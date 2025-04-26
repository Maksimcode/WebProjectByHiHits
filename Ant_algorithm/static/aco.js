export class ACO {
  constructor(graph, params) {
    this.graph = graph;

    this.numAnts = params.numAnts || 10;
    this.iterations = params.iterations || 100;
    this.alpha = params.alpha || 1;
    this.beta = params.beta || 5;
    this.evaporation = params.evaporation || 0.5;
    this.Q = params.Q || 100;
    this.iterationDelay = params.iterationDelay || 10;

    this.pheromones = [];
    this.bestPath = null;
    this.bestDistance = Infinity;
  }

  initializePheromones() {
    const size = this.graph.nodes.length;
    this.pheromones = new Array(size);
    for (let i = 0; i < size; i++) {
      this.pheromones[i] = new Array(size).fill(1.0);
    }
  }

  async run(updateCallback) {
    this.initializePheromones();
    for (let iter = 0; iter < this.iterations; iter++) {
      const allAntPaths = [];

      for (let k = 0; k < this.numAnts; k++) {
        const path = this.constructSolution();
        allAntPaths.push(path);
        const distance = this.calculatePathDistance(path);
        if (distance < this.bestDistance) {
          this.bestDistance = distance;
          this.bestPath = path;
        }
      }
      this.evaporatePheromones();
      this.depositPheromones(allAntPaths);

      if (updateCallback) {
        updateCallback(this.bestDistance, iter, this.bestPath);
      }
      await new Promise((resolve) => setTimeout(resolve, this.iterationDelay));
    }
    return { bestPath: this.bestPath, bestDistance: this.bestDistance };
  }

  constructSolution() {
    const numNodes = this.graph.nodes.length;
    const visited = new Array(numNodes).fill(false);
    const start = Math.floor(Math.random() * numNodes);
    const path = [start];
    visited[start] = true;

    while (path.length < numNodes) {
      const current = path[path.length - 1];
      const next = this.selectNextCity(current, visited);
      if (next === -1) break;
      path.push(next);
      visited[next] = true;
    }
    path.push(start);
    return path;
  }

  selectNextCity(current, visited) {
    const numNodes = this.graph.nodes.length;
    let probabilities = [];
    let total = 0;
    for (let j = 0; j < numNodes; j++) {
      if (!visited[j]) {
        const pheromone = Math.pow(this.pheromones[current][j], this.alpha);
        const distance = this.graph.distance(current, j);
        const heuristic = Math.pow(1.0 / distance, this.beta);
        const prob = pheromone * heuristic;
        probabilities.push({ city: j, prob });
        total += prob;
      }
    }
    if (total === 0) {
      for (let j = 0; j < numNodes; j++) {
        if (!visited[j]) return j;
      }
      return -1;
    }
    let random = Math.random() * total;
    for (let item of probabilities) {
      random -= item.prob;
      if (random <= 0) return item.city;
    }
    return probabilities[probabilities.length - 1].city;
  }

  calculatePathDistance(path) {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += this.graph.distance(path[i], path[i + 1]);
    }
    return distance;
  }

  evaporatePheromones() {
    const numNodes = this.graph.nodes.length;
    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        this.pheromones[i][j] *= 1 - this.evaporation;
      }
    }
  }

  depositPheromones(allAntPaths) {
    allAntPaths.forEach((path) => {
      const d = this.calculatePathDistance(path);
      const contribution = this.Q / d;
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i],
          to = path[i + 1];
        this.pheromones[from][to] += contribution;
        this.pheromones[to][from] += contribution;
      }
    });
  }
}
