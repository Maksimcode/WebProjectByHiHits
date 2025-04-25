export let data = []; 
 const ERROR_CODE = -400;
 
 export function getColumn(matrix, columnIndex, start = 1) {
     if (!matrix || matrix.length <= start) {
         return [];
     }
     
     let column = [];
 
     for (let i = start; i < matrix.length; i++) {
         column.push(matrix[i][columnIndex]);
     }
 
     return column;
 }
 
 export function getUniqueElements(arr) {
     if (!arr || arr.length === 0) {
         return [];
     }
     
     let uniqueArr = [];
 
     for (let i = 0; i < arr.length; i++) {
         if (!uniqueArr.includes(arr[i])) {
             uniqueArr.push(arr[i]);
         }
     }
 
     return uniqueArr;
 }
 
 function calculateGiniIndex(column) {
     if (!column || column.length === 0) {
         return 0;
     }
     
     const counts = column.reduce((acc, val) => {
         if (val !== undefined) {
             acc[val] = (acc[val] || 0) + 1;
         }
         return acc;
     }, {});
     
     let impurity = 1;
     for (const key in counts) {
         const p = counts[key] / column.length;
         impurity -= p * p;
     }
     
     return impurity;
 }
 
 function getUniqueMatrix(columnIndex, columnValue) {
     if (!data || data.length <= 1) {
         return [];
     }
     
     let uniqueMatrix = [data[0]];
 
     for (let i = 1; i < data.length; i++) {
         if (data[i][columnIndex] === columnValue) {
             uniqueMatrix.push(data[i]);
         }
     }
 
     return uniqueMatrix;
 }
 
 function calculateGiniGain(column, columnIndex) {
     if (!column || column.length === 0 || columnIndex === undefined) {
         return ERROR_CODE;
     }
     
     const uniqueClasses = getUniqueElements(column);
     
     if (uniqueClasses.length <= 1) {
         return ERROR_CODE;
     }
 
     const minSamplesPerClass = 1;
     if (column.length / uniqueClasses.length < minSamplesPerClass) {
         return ERROR_CODE;
     }
 
     const targetColumn = getColumn(data, data[0].length - 1);
     const totalGini = calculateGiniIndex(targetColumn);
     
     let weightedGiniSum = 0;
     const totalRows = data.length - 1; 
 
     for (let i = 0; i < uniqueClasses.length; i++) {
         const uniqueMatrix = getUniqueMatrix(columnIndex, uniqueClasses[i]);
         if (uniqueMatrix.length > 1) {
             const subsetSize = uniqueMatrix.length - 1; 
             const probability = subsetSize / totalRows;
             const subsetColumn = getColumn(uniqueMatrix, uniqueMatrix[0].length - 1);
             
             if (subsetColumn.length > 0) {
                 const subsetGini = calculateGiniIndex(subsetColumn);
                 weightedGiniSum += probability * subsetGini;
             }
         }
     }

     const giniGain = totalGini - weightedGiniSum;
     
     return giniGain;
 }
 
 function getAttributes(giniGains) {
     if (!giniGains || giniGains.length === 0) {
         return [];
     }
     
     let attributes = [];
 
     for (let i = 0; i < data[0].length - 1; i++) {
         if (giniGains[i] !== ERROR_CODE) {
             attributes.push({name: data[0][i], index: i});
         }
     }
 
     return attributes;
 }
 
 function sortAttributes(attributes, giniGains) {
     if (!attributes || attributes.length === 0 || !giniGains || giniGains.length === 0) {
         return;
     }
     
     let pairs = [];
     for (let i = 0; i < attributes.length; i++) {
         pairs.push({
             attribute: attributes[i],
             giniGain: giniGains[attributes[i].index]
         });
     }
     
     pairs.sort((a, b) => b.giniGain - a.giniGain);
     
     return pairs.map(pair => pair.attribute);
 }
 
 export function getTreeNodes(input) {
     if (!input || input.length <= 1) {
         return [];
     }
     
     data = input;
     var giniGains = [];
 
     for (let i = 0; i < data[0].length - 1; i++) {
         const columnGain = calculateGiniGain(getColumn(data, i), i);
         giniGains.push(columnGain);
     }
 
     let attributes = getAttributes(giniGains);
     
     if (attributes.length === 0) {
         return [];
     }
 
     attributes = sortAttributes(attributes, giniGains);
     
     return attributes;
 }