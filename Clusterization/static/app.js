const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const numberClust = parseInt(document.getElementById("numberClust").value);
let points = [];
let flagPoints = true;
let flagCenters = true;

//базовая кластеризация
let centers = [];
let clusters = [];
let collorCenter = ['red','green','blue','yellow','purple','orange', 'pink','brown','grey','white'];

let clustersHierarchy = [];
let centroids = [];
let blackColoring  = [[0, 0], [0, 180], [180, 0], [90,270], [270, 90], [45, 225], [225, 45], [135, 315], [315, 135]];

let centersLines = [];
let clustersLines = [];
//let colorLines = ['red','green','blue','yellow','purple','orange', 'pink','brown','grey'];

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    points = [];
    clusters = [];
    clustersHierarchy = [];
    clustersLines = [];
}

// Добавляем обработчик события для кнопки
document.getElementById('clearButton').addEventListener('click', clearCanvas);

canvas.addEventListener("click",  function(mouseEvent) // ставит точки на экране
{
    if(flagPoints === true)
    {
        let rectCanvas = canvas.getBoundingClientRect(); //тут размеры канваса делаются
        let x = mouseEvent.clientX - rectCanvas.left;
        let y = mouseEvent.clientY - rectCanvas.top;
        let point = {
            pointX: x,
            pointY: y,
        }
        points.push(point);
        clustersHierarchy.push([point]);
        clustersLines.push(point);
        context.strokeStyle = 'white';
        context.fillStyle='black';
        context.beginPath(); //тут чтоб не сливались точечки
        context.arc(x, y, 10, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }

    return points;    
});

document.getElementById("clusterButton").addEventListener("click", function() {
    const numberClust = parseInt(document.getElementById("numberClust").value);
    if (points.length === 0) {
        alert("Сначала добавьте точки на поле!");
        return;
    }
    if (points.length < numberClust)  {
        alert("Количество кластеров больше, чем количество точек!");
        return;
    }
    initializeCenters(numberClust); // количество кластеров
    Clustering(numberClust);
});

function initializeCenters(numberClust) {
    centers = [];
    centroids = [];
    centersLines = [];
    for (let i = 0; i < numberClust; i++) {
        let randomIndex1 = Math.floor(Math.random() * points.length);
        centers.push(points[randomIndex1]);
    }
    for (let i = 0; i < numberClust; i++) {
        let randomIndex2 = Math.floor(Math.random() * points.length);
        centroids.push(points[randomIndex2]);
    }
    for (let i = 0; i < numberClust; i++) {
        let randomIndex3 = Math.floor(Math.random() * points.length);
        centersLines.push(points[randomIndex3]);
    }
}

function Clustering(numberClust) {
    clusters = Array.from({ length: numberClust }, () => []);
    clustersHierarchy = Array.from({ length: numberClust }, () => []);
    clustersLines = Array.from({ length: numberClust }, () => []);
    //кластеризация тут
    for (let i = 0; i < points.length; i++) {
        let distances1 = centers.map(center => getDistance(points[i], center));
        let distances2 = centroids.map(center => getDistance(points[i], center));
        let distances3 = centersLines.map(center => getDistance(points[i], center));
        let minIndex1 = distances1.indexOf(Math.min(...distances1));
        let minIndex2 = distances2.indexOf(Math.min(...distances2));
        let minIndex3 = distances3.indexOf(Math.min(...distances3));
        clusters[minIndex1].push(points[i]);
        clustersHierarchy[minIndex2].push(points[i]);
        clustersLines[minIndex3].push(points[i]);
    }
    //тут обновление цветов пошло
    for (let j = 0; j < centers.length-numberClust; j++) {
        if (clusters[j].length > 0) {
            centers[j] = getNewCenter(clusters[j]);
        }
    }

    for (let j = 0; j < centroids.length-numberClust; j++) {
        if (clustersHierarchy[j].length > 0) {
            centroids[j] = getNewCenter(clustersHierarchy[j]);
        }
    }

    for (let j = 0; j < centersLines.length-numberClust; j++) {
        if (clustersLines[j].length > 0) {
            centersLines[j] = getNewCenter(clustersLines[j]);
        }
    }
    drawClusters();
    drawHierarchy();
    drawLines();
}

function getDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.pointX - point2.pointX, 2) + Math.pow(point1.pointY - point2.pointY, 2));
}

function getNewCenter(cluster) {
    let sumX = cluster.reduce((sum, point) => sum + point.pointX, 0);
    let sumY = cluster.reduce((sum, point) => sum + point.pointY, 0);
    return {
        pointX: sumX / cluster.length,
        pointY: sumY / cluster.length,
    };
}

function getRadians(degrees) 
{
  return (Math.PI / 180) * degrees;
}

function drawHierarchy()
{
    for(let i = 0; i < clustersHierarchy.length; i++) {
        for(let j = 0; j < clustersHierarchy[i].length; j++) {
            context.beginPath();
            context.strokeStyle = "white";
            context.fillStyle = "black";
            context.arc(clustersHierarchy[i][j].pointX, clustersHierarchy[i][j].pointY, 10,  getRadians(blackColoring[i][0]), getRadians(blackColoring[i][1]));
            context.fill();
            context.stroke()
        }
    }
}

function drawClusters() {
    for (let i = 0; i < clusters.length; i++) {
        context.fillStyle = collorCenter[i];
        for (let j = 0; j < clusters[i].length; j++) {
            context.beginPath();
            context.arc(clusters[i][j].pointX, clusters[i][j].pointY, 10, 0, 2 * Math.PI);
            context.fill();
        }
    }
    // тут рисуем центры кластеров
    for (let i = 0; i < centers.length; i++) {
        context.fillStyle = collorCenter[i];
        context.beginPath();
        context.arc(centers[i].pointX, centers[i].pointY, 10, 0, 2 * Math.PI);
        context.fill();
    }
}

function drawLines(){
    for (let  i = 0; i < clustersLines.length; i++){
        for (let  j = 1; j < clustersLines[i].length; j++){
            context.beginPath();
            context.moveTo(clustersLines[i][0].pointX, clustersLines[i][0].pointY);
            context.lineTo(clustersLines[i][j].pointX, clustersLines[i][j].pointY);
            context.strokeStyle = 'grey';
            context.stroke();
        }
    }
}