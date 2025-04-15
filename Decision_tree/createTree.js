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

// Функция сортировки значений столбца по частоте (от наибольшего к наименьшему)
function sortBranches(column) {
  const results = getUniqueElements(column);
  const counts = new Array(results.length).fill(0);
  column.forEach((value) => {
    const index = results.indexOf(value);
    if (index !== -1) counts[index]++;
  });
  const pairs = results.map((val, i) => ({ val, count: counts[i] }));
  pairs.sort((a, b) => b.count - a.count);
  return pairs.map((p) => p.val);
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

// Создание листового узла (на основе последнего столбца – целевого)
function createLeafNode(currentData) {
  const answer = getAnswer(currentData);
  const targetColumnName = currentData[0][currentData[0].length - 1];
  return new Node(`${targetColumnName} = ${answer}`, null, answer);
}

function growTree(node, currentData, remainingAttributes) {
  if (!currentData || currentData.length <= 1) return;
  
  const targetColIndex = currentData[0].length - 1;

  // Если остался ровно один признак для разбиения, форсируем его использование
  if (remainingAttributes.length === 1) {
    const forcedAttr = remainingAttributes[0];
    node.attribute = forcedAttr;
    if (node.nodeName === "root") {
      node.nodeName = forcedAttr.name;
    }
    
    const col = getColumn(currentData, forcedAttr.index, 1);
    const uniqueValues = sortBranches(col);
    
    uniqueValues.forEach((value) => {
      // Фильтрация данных согласно значению выбранного признака
      const filteredData = [currentData[0]];
      for (let i = 1; i < currentData.length; i++) {
        if (currentData[i][forcedAttr.index] === value) {
          filteredData.push(currentData[i]);
        }
      }
      
      const childNode = new Node(`${forcedAttr.name} = ${value}`, forcedAttr, value);
      
      if (filteredData.length <= 1) {
        childNode.nodeName = `${currentData[0][targetColIndex]} = Unknown`;
        childNode.attribute = null;
      } else {
        // Так как это последний признак для разбиения, прикрепляем лист с итоговым ответом
        childNode.branches.push(createLeafNode(filteredData));
      }
      node.branches.push(childNode);
    });
    return;
  }
  
  // Если больше одного признака осталось, выбираем лучший по критерию Джини
  let bestAttributes = getTreeNodes(currentData);
  let availableAttributes = bestAttributes.filter(attr =>
    remainingAttributes.some(rAttr => rAttr.index === attr.index)
  );
  
  if (availableAttributes.length === 0) {
    availableAttributes = [remainingAttributes[0]];
  }
  
  const bestAttr = availableAttributes[0];
  node.attribute = bestAttr;
  if (node.nodeName === "root") {
    node.nodeName = bestAttr.name;
  }
  
  const attrIndex = bestAttr.index;
  const column = getColumn(currentData, attrIndex, 1);
  const uniqueValues = sortBranches(column);
  
  // Обновляем оставшиеся признаки: исключаем использованный
  const newRemainingAttributes = remainingAttributes.filter(attr => attr.index !== bestAttr.index);
  
  uniqueValues.forEach((value) => {
    const filteredData = [currentData[0]];
    for (let i = 1; i < currentData.length; i++) {
      if (currentData[i][attrIndex] === value) {
        filteredData.push(currentData[i]);
      }
    }
    
    const childNode = new Node(`${bestAttr.name} = ${value}`, bestAttr, value);
    
    if (filteredData.length <= 1) {
      childNode.nodeName = `${currentData[0][targetColIndex]} = Unknown`;
      childNode.attribute = null;
    } else {
      // Рекурсивно строим дерево для отфильтрованных данных
      growTree(childNode, filteredData, newRemainingAttributes);
    }
    
    node.branches.push(childNode);
  });
  
  // Если по какой-то причине не создались ветви, превращаем текущий узел в лист
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
  
  // Формируем список атрибутов, исключая последний столбец – целевой признак
  const allAttributes = [];
  for (let i = 0; i < inputData[0].length - 1; i++) {
    allAttributes.push({ name: inputData[0][i], index: i });
  }
  
  const root = new Node("root", null, null);
  growTree(root, inputData, allAttributes);
  
  return root;
}

export { Node };
