const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const numberClust = parseInt(document.getElementById("numberClust").value);
let points = [];
let flagPoints = true;
let flagCenters = true;

//базовая кластеризация
let centersColors = [];
let clusters = [];
let collorCenter = ['red','green','blue','yellow','purple','orange', 'pink','brown','grey'];

let clustersHierarchy = [];
let centersBlack = [];
let blackColoring  = [[0, 0], [0, 180], [180, 0], [90,270], [270, 90], [45, 225], [225, 45], [135, 315], [315, 135]];

let centersLines = [];
let clustersLines = [];
//let colorLines = ['red','green','blue','yellow','purple','orange', 'pink','brown','grey'];

document.getElementById('clearButton').addEventListener('click', function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    points = [];
    clusters = [];
    clustersHierarchy = [];
    clustersLines = [];

    flagPoints = true;
});

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
    if (flagPoints === true) {
        const numberClust = parseInt(document.getElementById("numberClust").value);
        if (points.length === 0) {
            alert("Сначала добавьте точки на поле!");
            return;
        }
        if (points.length <= numberClust)  {
            alert("Количество кластеров должно быть меньше, чем количество точек!");
            return;
        }
        initializeCenters(numberClust); // количество кластеров
        Clustering(numberClust);
        flagPoints = false;
    }
    else {
        alert("Очистите поле!");
        return;
    }
});

function initializeCenters(numberClust) {
    centersColors = [];
    centersBlack = [];
    centersLines = [];
    for (let i = 0; i < numberClust; i++) {
        let randomIndex1 = Math.floor(Math.random() * points.length);
        centersColors.push(points[randomIndex1]);
    }
    for (let i = 0; i < numberClust; i++) {
        let randomIndex2 = Math.floor(Math.random() * points.length);
        centersBlack.push(points[randomIndex2]);
    }
    for (let i = 0; i < numberClust; i++) {
        let randomIndex3 = Math.floor(Math.random() * points.length);
        centersLines.push(points[randomIndex3]);
    }
}

function Clustering(numberClust) {
    let maxIterations = 1500; 
    let convergedColors = false;
    let convergedBlack = false;
    let convergedLines = false;
    let iteration = 0;

    while (!convergedColors && !convergedBlack && !convergedLines && iteration < maxIterations) {
        clusters = Array.from({ length: numberClust }, () => []);
        clustersHierarchy = Array.from({ length: numberClust }, () => []);
        clustersLines = Array.from({ length: numberClust }, () => []);

        for (let i = 0; i < points.length; i++) {
            //расстояние от точек до всех кластеров!
            let distancesColors = centersColors.map(center => getDistance(points[i], center));
            let distancesBlack = centersBlack.map(center => getDistance(points[i], center));
            let distancesLines = centersLines.map(center => getDistance(points[i], center));

            let minIndexColors = distancesColors.indexOf(Math.min(...distancesColors));
            let minIndexBlack = distancesBlack.indexOf(Math.min(...distancesBlack));
            let minIndexLines = distancesLines.indexOf(Math.min(...distancesLines));

            clusters[minIndexColors].push(points[i]);
            clustersHierarchy[minIndexBlack].push(points[i]);
            clustersLines[minIndexLines].push(points[i]);
        }

        let newCentersColors = centersColors.map((center, index) => {
            if (clusters[index].length > 0) {
                return getNewCenter(clusters[index]);
            }
            return center;
        });

        let newCentersBlack = centersBlack.map((center, index) => {
            if (clustersHierarchy[index].length > 0) {
                return getNewCenter(clustersHierarchy[index]);
            }
            return center;
        });

        let newCentersLines = centersLines.map((center, index) => {
            if (clustersLines[index].length > 0) {
                return getNewCenter(clustersLines[index]);
            }
            return center;
        });

        // проверка сходимости центров кластеров!!!
        convergedColors = centersColors.every((center, index) => {
            return getDistance(center, newCentersColors[index]) < 1e-6; 
        });

        convergedBlack = centersBlack.every((center, index) => {
            return getDistance(center, newCentersBlack[index]) < 1e-6; 
        });

        convergedLines = centersLines.every((center, index) => {
            return getDistance(center, newCentersLines[index]) < 1e-6; 
        });

        centersColors = newCentersColors;
        centersBlack = newCentersBlack;
        centersLines = newCentersLines;

        iteration++;
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

function getRadians(degrees) {
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