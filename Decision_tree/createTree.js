import { getTreeNodes, getColumn, getUniqueElements, data } from "./gini.js";

class Node {
  constructor(nodeName, attribute, atrValue) {
    this.nodeName = nodeName;
    this.attribute = attribute;
    this.atrValue = atrValue;
    this.branches = [];
    this.isVisited = false;
  }
}

// Функция сортировки значений столбца по частоте появления (от наибольшего к наименьшему)
function sortBranches(column) {
  const results = getUniqueElements(column);
  const counts = new Array(results.length).fill(0);
  column.forEach(value => {
    const index = results.indexOf(value);
    if (index !== -1) counts[index]++;
  });
  const pairs = results.map((val, i) => ({ val, count: counts[i] }));
  pairs.sort((a, b) => b.count - a.count);
  return pairs.map(p => p.val);
}

// Функция вычисления наиболее вероятного ответа (использует последний столбец как целевой)
function getAnswer(currentData) {
  if (!currentData || currentData.length <= 1) return "Unknown";
  
  const lastIndex = currentData[0].length - 1;
  const targetColumn = getColumn(currentData, lastIndex, 1);
  const uniqueAnswers = getUniqueElements(targetColumn);
  
  if (uniqueAnswers.length === 0) return "Unknown";
  
  const counts = new Array(uniqueAnswers.length).fill(0);
  for (let i = 0; i < targetColumn.length; i++) {
    const answer = targetColumn[i];
    const index = uniqueAnswers.indexOf(answer);
    if (index !== -1) counts[index]++;
  }
  
  let maxIndex = 0;
  for (let i = 1; i < counts.length; i++) {
    if (counts[i] > counts[maxIndex]) maxIndex = i;
  }
  
  return uniqueAnswers[maxIndex];
}

// Создание листового узла (хотя здесь не используется как отдельная ветка, можно вызывать при необходимости)
function createLeafNode(currentData) {
  const answer = getAnswer(currentData);
  const targetColumnName = currentData[0][currentData[0].length - 1];
  return new Node(`${targetColumnName} = ${answer}`, null, answer);
}


function growTree(node, currentData, remainingAttributes) {
  if (!currentData || currentData.length <= 1) return;
  
  const targetColIndex = currentData[0].length - 1;
  
  // Если не осталось атрибутов для разбиения, превращаем узел в лист с итоговым ответом
  if (remainingAttributes.length === 0) {
    node.nodeName = `${currentData[0][targetColIndex]} = ${getAnswer(currentData)}`;
    node.attribute = null;
    node.branches = [];
    return;
  }
  
  // Вызываем функцию для расчёта лучших атрибутов (например, на основе критерия Джини)
  let bestAttributes = getTreeNodes(currentData);
  let availableAttributes = bestAttributes.filter(attr =>
    remainingAttributes.some(rAttr => rAttr.index === attr.index)
  );
  if (availableAttributes.length === 0) {
    availableAttributes = [remainingAttributes[0]];
  }
  
  const bestAttr = availableAttributes[0];
  node.attribute = bestAttr;
  
  // Для корня задаём имя признака
  if (node.nodeName === "root") {
    node.nodeName = bestAttr.name;
  }
  
  // Получаем столбец выбранного атрибута и сортируем уникальные значения по частоте
  const attrIndex = bestAttr.index;
  const column = getColumn(currentData, attrIndex, 1);
  const uniqueValues = sortBranches(column);
  
  // Удаляем текущий атрибут из оставшихся для последующей рекурсии
  const newRemainingAttributes = remainingAttributes.filter(attr => attr.index !== bestAttr.index);
  
  uniqueValues.forEach(value => {
    // Фильтруем данные: сохраняем заголовок и строки, где значение атрибута равно текущему value
    const filteredData = [currentData[0]];
    for (let i = 1; i < currentData.length; i++) {
      if (currentData[i][attrIndex] === value) {
        filteredData.push(currentData[i]);
      }
    }
    
    // Создаём узел для данного значения
    const childNode = new Node(`${bestAttr.name} = ${value}`, bestAttr, value);
    
    // Если по фильтрации в узел попали только заголовок, заполняем ответом "Unknown"
    if (filteredData.length <= 1) {
      childNode.nodeName = `${currentData[0][targetColIndex]} = Unknown`;
      childNode.attribute = null;
      childNode.branches = [];
    } else {
      // Рекурсивно строим дерево для отфильтрованного набора, даже если данные однородны
      growTree(childNode, filteredData, newRemainingAttributes);
    }
    
    node.branches.push(childNode);
  });
  
  // Если ни одна ветвь не была создана, делаем текущий узел листом
  if (node.branches.length === 0) {
    node.nodeName = `${currentData[0][targetColIndex]} = ${getAnswer(currentData)}`;
    node.attribute = null;
  }
}

// Основная функция построения дерева решений
export function makeTree(inputData) {
  if (!inputData || inputData.length <= 1) {
    return new Node("No data", null, null);
  }
  
  // Формируем список атрибутов, исключая последний столбец (целевой признак)
  const allAttributes = [];
  for (let i = 0; i < inputData[0].length - 1; i++) {
    allAttributes.push({ name: inputData[0][i], index: i });
  }
  
  const root = new Node("root", null, null);
  growTree(root, inputData, allAttributes);
  
  return root;
}
