import { readFile } from "./parsing.js";
import { makeTree } from "./createTree.js";
import { getData } from "./data.js"

export let divider = ",";

function displayTree(currentNode, treeElement) {
    let newNode = document.createElement("li");
    const nodeName = currentNode.nodeName;

    let newNodeText = document.createElement("span");
    newNodeText.textContent = nodeName;

    // Добавляем классы для стилизации
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
let attributeNames = []; // Хранение имен атрибутов
let originalData = []; // Сохраняем оригинальные данные для последующего анализа

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
            originalData = [...data]; // Сохраняем копию данных
            // Сохраняем имена атрибутов из заголовка данных
            attributeNames = data[0].slice(0, -1); // Исключаем последний столбец (класс)
            treeRoot = makeTree(data);

            let treeRootElement = document.getElementById("root");
            displayTree(treeRoot, treeRootElement);
            document.getElementById("root").style.zoom = 2;
            
            // Генерируем форму для ввода данных
            generateInputForm(attributeNames, data);
        }
    } else {
        let data = getData(chosenFileIndex);
        originalData = [...data]; // Сохраняем копию данных
        // Сохраняем имена атрибутов для предустановленных данных
        attributeNames = data[0].slice(0, -1);
        treeRoot = makeTree(data);

        const treeRootElement = document.getElementById("root");
        displayTree(treeRoot, treeRootElement);
        
        // Генерируем форму для ввода данных
        generateInputForm(attributeNames, data);
    }
});

// Функция для получения уникальных значений атрибута из данных
function getAttributeValues(data, attrIndex) {
    // Начинаем с 1, чтобы пропустить заголовок
    const values = new Set();
    for (let i = 1; i < data.length; i++) {
        values.add(data[i][attrIndex]);
    }
    return Array.from(values);
}

// Функция для генерации формы ввода на основе атрибутов
function generateInputForm(attributes, data) {
    const formContainer = document.getElementById("inputFormContainer") || document.createElement("div");
    formContainer.id = "inputFormContainer";
    formContainer.innerHTML = "<h3>Введите данные для предсказания:</h3>";
    
    const form = document.createElement("form");
    form.id = "predictionForm";
    
    attributes.forEach((attr, index) => {
        const div = document.createElement("div");
        const label = document.createElement("label");
        label.textContent = attr + ": ";
        div.appendChild(label);
        
        // Получаем уникальные значения для этого атрибута
        const values = getAttributeValues(data, index);
        
        // Если уникальных значений немного, создаем выпадающий список
        if (values.length <= 10) {
            const select = document.createElement("select");
            select.id = "attr" + index;
            select.name = attr;
            
            // Добавляем пустую опцию
            const emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = "Выберите значение";
            select.appendChild(emptyOption);
            
            // Добавляем все возможные значения
            values.forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
            
            div.appendChild(select);
        } else {
            // Иначе создаем текстовое поле
            const input = document.createElement("input");
            input.type = "text";
            input.id = "attr" + index;
            input.name = attr;
            div.appendChild(input);
        }
        
        form.appendChild(div);
    });
    
    const submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.textContent = "Получить предсказание";
    submitBtn.onclick = getPrediction;
    form.appendChild(submitBtn);
    
    formContainer.appendChild(form);
    
    // Добавляем элемент для вывода результата
    const resultDiv = document.createElement("div");
    resultDiv.id = "predictionResult";
    formContainer.appendChild(resultDiv);
    
    // Добавляем форму на страницу
    document.body.appendChild(formContainer);
}

// Функция для получения предсказания
function getPrediction() {
    if (!treeRoot) {
        alert("Сначала постройте дерево решений");
        return;
    }
    
    const userData = [];
    attributeNames.forEach((attr, index) => {
        const input = document.getElementById("attr" + index);
        userData.push(input.value);
    });
    
    if (userData.some(value => value === "")) {
        alert("Пожалуйста, заполните все поля");
        return;
    }
    
    clearVisitedNodes(treeRoot);
    
    const { prediction, confidence, path } = predictClassWithConfidence(treeRoot, userData, originalData);
    

    path.forEach(node => {
        node.isVisited = true;
    });
    

    const resultDiv = document.getElementById("predictionResult");
    resultDiv.innerHTML = "<h4>Результат предсказания:</h4>" +
                          "<p>Предсказанный класс: <strong>" + prediction + "</strong></p>" +
                          "<p>Уверенность: <strong>" + (confidence * 100).toFixed(2) + "%</strong></p>";
    
    if (path.some(node => node.wasAlternativePath)) {
        resultDiv.innerHTML += "<p><em>Примечание: Для некоторых атрибутов не найдено точное соответствие, " +
                              "использовались наиболее вероятные пути.</em></p>";
    }
    
    // Force redraw the tree to show the path
    resetTree();
    const treeRootElement = document.getElementById("root");
    displayTree(treeRoot, treeRootElement);
    
}


// Функция предсказания класса с расчетом уверенности
function predictClassWithConfidence(node, userData, originalData) {
    const path = []; // Путь, который был пройден по дереву
    let confidence = 1.0; // Начальная уверенность 100%
    
    console.log("Starting prediction with userData:", userData);
    console.log("Original data sample:", originalData.slice(0, 5));
    
    // Вспомогательная рекурсивная функция
    function traverse(currentNode) {
        path.push(currentNode);
        
        // Если достигли листа дерева, возвращаем предсказание
        if (currentNode.branches.length === 0) {
            return {
                prediction: currentNode.nodeName, // В листе хранится класс
                confidence: confidence,
                path: path
            };
        }
        
        // Если у нас есть атрибут для деления
        if (currentNode.attribute) {
            const attrIndex = currentNode.attribute.index;
            const attrValue = userData[attrIndex];
            
            // Ищем подходящую ветвь
            let matchingBranch = null;
            for (let branch of currentNode.branches) {
                if (branch.atrValue === attrValue) {
                    matchingBranch = branch;
                    break;
                }
            }
            
            // Если точное совпадение найдено
            if (matchingBranch) {
                return traverse(matchingBranch);
            }
            
            // Если точное совпадение не найдено, используем наиболее вероятный путь
            console.log("No exact match found for:", attrValue, "at attribute index:", attrIndex);
            
            let bestBranch = null;
            let bestBranchScore = 0;
            
            // Проверяем каждую ветвь, чтобы найти лучшую альтернативу
            for (let branch of currentNode.branches) {
                // Отмечаем эту ветвь как альтернативный путь
                branch.wasAlternativePath = true;
                
                // Рассчитываем оценку для этой ветви
                const branchScore = evaluateBranchForValue(branch, userData, originalData);
                
                if (branchScore > bestBranchScore) {
                    bestBranchScore = branchScore;
                    bestBranch = branch;
                }
            }
            
            if (bestBranch) {
                confidence *= 0.7; // Уменьшаем уверенность для альтернативного пути
                console.log("Taking alternative path with score:", bestBranchScore);
                return traverse(bestBranch);
            }
            
            // Если всё не удалось, берём первую ветвь
            console.log("Defaulting to first branch");
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
    console.log("Prediction result:", result);
    return result;
}

// Вспомогательная функция для оценки пригодности ветви для текущих данных
function evaluateBranchForValue(branch, userData, originalData) {
    // Если это лист, это подходит
    if (branch.branches.length === 0) return 1;
    
    // Проверяем, сколько примеров в исходных данных пошли бы по этому пути
    let score = 0;
    
    for (let i = 1; i < originalData.length; i++) {
        // Добавляем к оценке, если этот пример соответствует нашим критериям
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

// Очистка маркировки посещенных узлов
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

const bypassTreeButton = document.getElementById("bypassTree");


// Переработанная функция обхода дерева на основе данных пользователя
function processUserInputTraversal(userData) {
    if (!treeRoot) {
        alert("Сначала постройте дерево решений");
        return;
    }
    
    // Очистка предыдущей визуализации
    clearVisitedNodes(treeRoot);
    
    // Разбиваем строку ввода на массив значений
    const userDataArray = userData.split(divider).map(item => item.trim());
    
    if (userDataArray.length < attributeNames.length) {
        alert(`Пожалуйста, введите все ${attributeNames.length} значения через запятую`);
        return;
    }
    
    // Получаем предсказание и информацию о пути
    const { prediction, confidence, path } = predictClassWithConfidence(treeRoot, userDataArray, originalData);
    
    // Маркируем путь в дереве
    path.forEach(node => {
        node.isVisited = true;
    });
    
    // Отображаем результат
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<h4>Результат обхода:</h4>" +
                         "<p>Предсказанный класс: <strong>" + prediction + "</strong></p>" +
                         "<p>Уверенность: <strong>" + (confidence * 100).toFixed(2) + "%</strong></p>";
    
    // Добавляем примечания, если использовались альтернативные пути
    if (path.some(node => node.wasAlternativePath)) {
        resultDiv.innerHTML += "<p><em>Примечание: Для некоторых атрибутов не найдено точное соответствие, " +
                             "использовались наиболее вероятные пути.</em></p>";
    }
    
    // Принудительно перерисовываем дерево, чтобы показать путь
    resetTree();
    const treeRootElement = document.getElementById("root");
    displayTree(treeRoot, treeRootElement);
    
    // Выводим отладочную информацию
    console.log("User input traversal complete:", prediction, "with confidence", confidence);
    console.log("Path:", path);
    console.log("Alternative paths used:", path.some(node => node.wasAlternativePath));
    
    return { prediction, confidence, path };
}

// Обновленный обработчик клика по кнопке обхода дерева
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
    
    // Запускаем обход дерева с данными пользователя
    processUserInputTraversal(userInput);
});

const deleteTreeButton = document.getElementById("deleteTree");

deleteTreeButton.addEventListener('click', () => {
    resetTree();
    
    // Очищаем формы и результаты
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
    
    // Очищаем поле ввода пользователя
    const userInput = document.getElementById("userInput");
    if (userInput) {
        userInput.value = "";
    }
    
    // Сбрасываем глобальные переменные
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