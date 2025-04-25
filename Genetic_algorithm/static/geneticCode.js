let isAlgorithmRunning = false;
let genes = [];
let canvasSize = 650;
let chromosomeLength; 

const canvasElement = document.querySelector("canvas"); 
const drawingContext = canvasElement.getContext("2d"); 

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomIndex(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateTwoRandomIndices(min, max) {
    let index1 = generateRandomIndex(min, max);
    let index2 = generateRandomIndex(min, max);

    while (index1 === index2) {
        index1 = generateRandomIndex(min, max);
    }

    return [index1, index2];
}

function mutateChromosome(chromosome) {
    let mutatedChromosome = chromosome.slice();
    for (let i = 0; i < genes.length - 1; i++) {
        let index1 = generateRandomIndex(1, genes.length - 1);
        let index2 = generateRandomIndex(1, genes.length - 1);
        [mutatedChromosome[index1], mutatedChromosome[index2]] = [mutatedChromosome[index2], mutatedChromosome[index1]];
    }
    return mutatedChromosome;
}

function chromosomesAreEqual(chromosome1, chromosome2) {
    if (chromosome1.length !== chromosome2.length)
        return false;
    for (let i = 0; i < chromosome1.length; i++) {
        if (chromosome1[i] !== chromosome2[i])
            return false;
    }
    return true;
}

function drawGenes(color) {
    for (let i = 0; i < genes.length; i++) {
        drawingContext.beginPath();
        drawingContext.arc(genes[i][0], genes[i][1], 10, 0, 2 * Math.PI, false);
        drawingContext.fillStyle = color;
        drawingContext.fill();
    }
}

canvasElement.addEventListener('click', function (event) {
    if (!isAlgorithmRunning) {
        let rect = canvasElement.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        drawingContext.beginPath();
        if (genes.length >= 1) {
            for (let gene of genes) {
                drawingContext.moveTo(gene[0], gene[1]);
                drawingContext.lineTo(x, y);
                drawingContext.strokeStyle = "#E1DAF5";
                drawingContext.stroke();
            }
        }
        drawingContext.beginPath();
        drawingContext.arc(x, y, 10, 0, Math.PI * 2);
        drawingContext.fillStyle = '#CD5C5C';
        drawingContext.fill();
        genes.push([x, y]);
        drawGenes('#CD5C5C'); //чтоб не сливались линии и точечки мы вызываем функцию эту
    }
});

function drawRoutes(previousBestRoute, currentBestRoute) {
    previousBestRoute.splice(previousBestRoute.length - 1, 0, previousBestRoute[0].slice());
    currentBestRoute.splice(currentBestRoute.length - 1, 0, currentBestRoute[0].slice());

    for (let i = 0; i < previousBestRoute.length - 1; i++) {
        drawingContext.beginPath();

        let vector = [previousBestRoute[i + 1][0] - previousBestRoute[i][0], previousBestRoute[i + 1][1] - previousBestRoute[i][1]];
        let length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

        drawingContext.moveTo(previousBestRoute[i][0] + vector[0] / length, previousBestRoute[i][1] + vector[1] / length);
        drawingContext.lineTo(previousBestRoute[i + 1][0] - vector[0] / length, previousBestRoute[i + 1][1] - vector[1] / length);

        drawingContext.strokeStyle = "lightblue";
        drawingContext.lineWidth = 2;
        drawingContext.stroke();
    }

    for (let j = 0; j < currentBestRoute.length - 1; j++) {
        drawingContext.beginPath();

        let vector = [currentBestRoute[j + 1][0] - currentBestRoute[j][0], currentBestRoute[j + 1][1] - currentBestRoute[j][1]];
        let length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

        drawingContext.moveTo(currentBestRoute[j][0] + vector[0] / length, currentBestRoute[j][1] + vector[1] / length);
        drawingContext.lineTo(currentBestRoute[j + 1][0] - vector[0] / length, currentBestRoute[j + 1][1] - vector[1] / length);

        drawingContext.strokeStyle = "lightgreen";
        drawingContext.lineWidth = 1;
        drawingContext.stroke();
    }
}

function drawRouteSegment(startGene, endGene, width, color) {
    let vector = [endGene[0] - startGene[0], endGene[1] - startGene[1]];
    let length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    let offset = [vector[0] / length, vector[1] / length];

    drawingContext.beginPath();
    drawingContext.moveTo(startGene[0] + offset[0], startGene[1] + offset[1]);
    drawingContext.lineTo(endGene[0] - offset[0], endGene[1] - offset[1]);
    drawingContext.strokeStyle = color;
    drawingContext.lineWidth = width;
    drawingContext.stroke();
}

function highlightBestRoute(bestRoute, color) {
    bestRoute.splice(bestRoute.length - 1, 0, bestRoute[0].slice());

    for (let i = 0; i < bestRoute.length - 2; i++) {
        drawRouteSegment(bestRoute[i], bestRoute[i + 1], 1, color);
    }

    drawGenes('#CD5C5C');
}

function sortPopulationByFitness(population) {
    population.sort((a, b) => a[a.length - 1] - b[b.length - 1]);
}

function initializePopulation(initialChromosome) {
    let population = [];
    let chromosomeBuffer = initialChromosome.slice();

    chromosomeBuffer.push(calculateRouteLength(chromosomeBuffer)); //считаем длину маршрута и порядок городов и пушим в конец массива
    population.push(chromosomeBuffer.slice());

    for (let i = 0; i < genes.length * genes.length; i++) {
        chromosomeBuffer = initialChromosome.slice();
        chromosomeBuffer = mutateChromosome(chromosomeBuffer);
        chromosomeBuffer.push(calculateRouteLength(chromosomeBuffer));
        population.push(chromosomeBuffer.slice());
    }
    return population;
}

function calculateRouteLength(chromosome) {
    let totalDistance = 0;

    for (let i = 0; i < chromosome.length - 1; i++) {
        totalDistance += Math.sqrt(Math.pow(chromosome[i][0] - chromosome[i + 1][0], 2) + Math.pow(chromosome[i][1] - chromosome[i + 1][1], 2));
    }
    totalDistance += Math.sqrt(Math.pow(chromosome[chromosome.length - 1][0] - chromosome[0][0], 2) + Math.pow(chromosome[chromosome.length - 1][1] - chromosome[0][1], 2)); // добавляем ещё расстояние между началом и концом

    return totalDistance;
}

function insertIntoPopulation(population, chromosome) {
    if (!population.length) {
        population.push(chromosome.slice());
    } 
    else {
        let inserted = false;
        for (let i = 0; i < population.length; i++) {
            if (chromosome[chromosome.length - 1] < population[i][population[i].length - 1]) {
                population.splice(i, 0, chromosome);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            population.push(chromosome.slice());
        }
    }
}

function crossover(parentA, parentB) {
    let startIndex = generateRandomIndex(0, parentA.length);
    let endIndex = generateRandomIndex(startIndex + 1, parentA.length);

    let child = parentA.slice(startIndex, endIndex + 1); //основа маршрута (часть городов пэрэнтА)

    for (let gene of parentB) {
        if (!child.includes(gene)) {
            child.push(gene);
        }
    }

    if (Math.random() * 100 < 50) {
        let mutationIndices = generateTwoRandomIndices(1, chromosomeLength);

        let index1 = mutationIndices[0];
        let index2 = mutationIndices[1];

        [child[index1], child[index2]] = [child[index2], child[index1]];
    } //мутация произошла.

    return child;
}

function performCrossover(parentA, parentB) {
    let offspringA = crossover(parentA, parentB);
    let offspringB = crossover(parentA, parentB);

    offspringA.push(calculateRouteLength(offspringA.slice()));
    offspringB.push(calculateRouteLength(offspringB.slice()));

    return [offspringA, offspringB];
}

document.getElementById("clearButton").addEventListener("click", function() {
    location.reload();
    genes = [];
    isAlgorithmRunning = false;
});

document.getElementById("geneticButton").addEventListener("click", async function() {
    if (!isAlgorithmRunning) {
        let iterationsLeft = 800;

        let initialChromosome = genes;

        chromosomeLength = initialChromosome.length;

        let population = initializePopulation(initialChromosome);
        sortPopulationByFitness(population);

        let bestChromosome = population[0].slice();

        for (let generation = 0; generation < 1000000; generation++) {
            await delay(0);

            isAlgorithmRunning = true;

            drawGenes('#CD5C5C');

            if (iterationsLeft === 0) {
                highlightBestRoute(bestChromosome, "red");
                break;
            }

            population = population.slice(0, genes.length * genes.length);

            for (let j = 0; j < genes.length * genes.length; j++) {
                let parentIndex1 = generateRandomIndex(0, population.length);
                let parentIndex2 = generateRandomIndex(0, population.length);

                let parentA = population[parentIndex1].slice(0, population[parentIndex1].length - 1);
                let parentB = population[parentIndex2].slice(0, population[parentIndex2].length - 1);

                let offspring = performCrossover(parentA, parentB);

                population.push(offspring[0].slice());
                population.push(offspring[1].slice());
            }

            sortPopulationByFitness(population);

            if (!chromosomesAreEqual(bestChromosome, population[0])) {
                drawRoutes(bestChromosome, population[0]);
                bestChromosome = population[0].slice();
                iterationsLeft = 800;
            }

            if (generation % 200 === 0)
                iterationsLeft -= 200;
        }
    }
    else {
        alert("Нажмите Очистить поле");
    }
});