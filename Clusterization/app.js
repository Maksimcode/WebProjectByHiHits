const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//базовая кластеризация
let keys = [];
let mstSet = [];
let tree = [];
let graph = [];
let INF = 900000000;