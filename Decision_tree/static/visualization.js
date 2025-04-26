import { readFile } from "./parsing.js";
import { makeTree } from "./createTree.js";
import { getData } from "./examples.js"

export let divider = ",";

function displayTree(currentNode, treeElement) {
    let newNode = document.createElement("li");
    const nodeName = currentNode.nodeName;

    let newNodeText = document.createElement("span");
    newNodeText.textContent = nodeName;

    if (currentNode.isVisited) {
        newNodeText.classList.add("visited-node");
    }
    
    if (currentNode.wasAlternativePath) {
        newNodeText.classList.add("alternative-path");
    }
    
    newNode.appendChild(newNodeText);
    treeElement.appendChild(newNode);

    if (currentNode.branches.length === 0) return;

    const newNodeBranch = document.createElement("ul");
    newNode.appendChild(newNodeBranch);

    currentNode.branches.forEach(branch => displayTree(branch, newNodeBranch));
}

const file = document.getElementById("fileInput");
const makeTreeButton = document.getElementById("makeTree");
let treeRoot;
let chosenFileIndex = null;
let attributeNames = [];
let originalData = []; 

makeTreeButton.addEventListener('click', () => {
    resetTree();

    let fileInput = [];
    let data = [];
    treeRoot = null;

    if (file.value === '' && !chosenFileIndex){
        alert('Сначала нужно загрузить файл или выбрать один из предустановленных наборов данных');
    } else if (file.value !== '') {
        fileInput = file.files[0];
        const reader = new FileReader();

        reader.readAsText(fileInput);

        reader.onload = function () {
            data = readFile(reader.result);
            originalData = [...data];
            attributeNames = data[0].slice(0, -1);
            treeRoot = makeTree(data);

            let treeRootElement = document.getElementById("root");
            displayTree(treeRoot, treeRootElement);
            document.getElementById("root").style.zoom = 2;
            
        }
    } else {
        let data = getData(chosenFileIndex);
        originalData = [...data];
        attributeNames = data[0].slice(0, -1);
        treeRoot = makeTree(data);

        const treeRootElement = document.getElementById("root");
        displayTree(treeRoot, treeRootElement);
        
    }
});

function predictClassWithConfidence(node, userData, originalData) {
    const path = []; 
    let confidence = 1.0; 
    
    function traverse(currentNode) {
        path.push(currentNode);
        
        if (currentNode.branches.length === 0) {
            return {
                prediction: currentNode.nodeName, 
                confidence: confidence,
                path: path
            };
        }
        
        if (currentNode.attribute) {
            const attrIndex = currentNode.attribute.index;
            const attrValue = userData[attrIndex];
            
            let matchingBranch = null;
            for (let branch of currentNode.branches) {
                if (branch.atrValue === attrValue) {
                    matchingBranch = branch;
                    break;
                }
            }
            
            if (matchingBranch) {
                return traverse(matchingBranch);
            }
            let bestBranch = null;
            let bestBranchScore = 0;
            for (let branch of currentNode.branches) {
                branch.wasAlternativePath = true;
                
                const branchScore = evaluateBranchForValue(branch, userData, originalData);
                
                if (branchScore > bestBranchScore) {
                    bestBranchScore = branchScore;
                    bestBranch = branch;
                }
            }
            
            if (bestBranch) {
                confidence *= 0.7;
                return traverse(bestBranch);
            }
            
            currentNode.branches[0].wasAlternativePath = true;
            confidence *= 0.5;
            return traverse(currentNode.branches[0]);
        }
        
        return {
            prediction: currentNode.nodeName,
            confidence: confidence,
            path: path
        };
    }
    
    const result = traverse(node);
    return result;
}

function evaluateBranchForValue(branch, userData, originalData) {

    if (branch.branches.length === 0) return 1;
    
    let score = 0;
    
    for (let i = 1; i < originalData.length; i++) {

        let match = true;
        for (let j = 0; j < userData.length; j++) {
            if (userData[j] && originalData[i][j] !== userData[j]) {
                match = false;
                break;
            }
        }
        if (match) score++;
    }
    
    return score;
}

function clearVisitedNodes(node) {
    if (!node) return;
    
    node.isVisited = false;
    node.wasAlternativePath = false;
    
    if (node.branches) {
        for (let branch of node.branches) {
            clearVisitedNodes(branch);
        }
    }
}

function processUserInputTraversal(userData) {
    if (!treeRoot) {
        alert("Сначала постройте дерево решений");
        return;
    }
    
    clearVisitedNodes(treeRoot);
    
    const userDataArray = userData.split(divider).map(item => item.trim());
    
    if (userDataArray.length < attributeNames.length) {
        alert(`Пожалуйста, введите все ${attributeNames.length} значения через запятую`);
        return;
    }
    
    const { prediction, confidence, path } = predictClassWithConfidence(treeRoot, userDataArray, originalData);
    
    path.forEach(node => {
        node.isVisited = true;
    });
    
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h4>Результат обхода:</h4>" +
                         "<p>Предсказанный класс: <strong>" + prediction + "</strong></p>" +
                         "<p>Уверенность: <strong>" + (confidence * 100).toFixed(2) + "%</strong></p>";
    
    if (path.some(node => node.wasAlternativePath)) {
        resultDiv.innerHTML += "<p><em>Примечание: Для некоторых атрибутов не найдено точное соответствие, " +
                             "использовались наиболее вероятные пути.</em></p>";
    }
    
    resetTree();
    const treeRootElement = document.getElementById("root");
    displayTree(treeRoot, treeRootElement);
    
    return { prediction, confidence, path };
}

const userBypassButton = document.getElementById("userBypass");
userBypassButton.addEventListener('click', () => {
    if (!treeRoot) {
        alert("Сначала постройте дерево решений");
        return;
    }
    
    const userInput = document.getElementById("userInput").value;
    if (!userInput) {
        alert("Пожалуйста, введите данные через запятую");
        return;
    }
    
    processUserInputTraversal(userInput);
});

const deleteTreeButton = document.getElementById("deleteTree");

deleteTreeButton.addEventListener('click', () => {
    resetTree();
    
    const formContainer = document.getElementById("inputFormContainer");
    if (formContainer) {
        formContainer.innerHTML = "";
    }
    
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
        resultDiv.innerHTML = "";
    }
    
    const predictionResult = document.getElementById("predictionResult");
    if (predictionResult) {
        predictionResult.innerHTML = "";
    }
    
    const userInput = document.getElementById("userInput");
    if (userInput) {
        userInput.value = "";
    }
    
    treeRoot = null;
    chosenFileIndex = null;
    attributeNames = [];
    originalData = [];
});

function resetTree() {
    let rootElement = document.getElementById("root");
    rootElement.innerHTML = "";
}

const firstButton = document.getElementById("firstButton");
firstButton.addEventListener('click', () => {
    file.value = '';
    chosenFileIndex = 1;
});

const secondButton = document.getElementById("secondButton");
secondButton.addEventListener('click', () => {
    file.value = '';
    chosenFileIndex = 2;
});

const thirdButton = document.getElementById("thirdButton");
thirdButton.addEventListener('click', () => {
    file.value = '';
    chosenFileIndex = 3;
});

const fourthButton = document.getElementById("fourthButton");
fourthButton.addEventListener('click', () => {
    file.value = '';
    chosenFileIndex = 4;
});