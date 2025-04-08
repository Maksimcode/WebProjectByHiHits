const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const numberClust = parseInt(document.getElementById("numberClust").value);

//базовая кластеризация
let points = [];
let centers = [];
let clusters = [];
let allDistances = [];
let collorCenter = ['red','green','blue','yellow','purple','orange', 'pink'];
let flagPoints = true;
let flagCenters = true;

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
        context.strokeStyle = 'blueviolet';
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
        alert("Сначала добавьте точки на поле");
        return;
    }
    initializeCenters(numberClust); // количество кластеров
    kMeansClustering();
});

function initializeCenters(numberClust) {
    centers = [];
    for (let i = 0; i < numberClust; i++) {
        let randomIndex = Math.floor(Math.random() * points.length);
        centers.push(points[randomIndex]);
    }
}

function kMeansClustering() {
    clusters = Array.from({ length: centers.length }, () => []);

    //кластеризация тут
    for (let i = 0; i < points.length; i++) {
       let distances = centers.map(center => getDistance(points[i], center));
        let minIndex = distances.indexOf(Math.min(...distances));
        clusters[minIndex].push(points[i]);
    }
    //тут обновление цветов пошло
    for (let j = 0; j < centers.length-numberClust; j++) {
        if (clusters[j].length > 0) {
            centers[j] = getNewCenter(clusters[j]);
        }
    }
    drawClusters();
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

function drawClusters() {
    context.clearRect(0, 0, canvas.width, canvas.height); // очищаем канвас значит
    for (let i = 0; i < points.length; i++) {
        context.strokeStyle = 'blueviolet';
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(points[i].pointX, points[i].pointY, 10, 0, 2 * Math.PI);
                context.stroke();
                context.fill();
    }

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
