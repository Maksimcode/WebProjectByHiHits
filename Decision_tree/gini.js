export let data = [];

// Функция для получения массива значений столбца матрицы, начиная с индекса start
// По умолчанию start = 1, чтобы пропустить заголовок.
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

// Функция для получения уникальных элементов массива
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

// Функция для получения списка атрибутов для дерева решений.
// Возвращает все столбцы, кроме последнего (целевого признака).
export function getTreeNodes(inputData) {
  if (!inputData || inputData.length <= 1) {
    return [];
  }
  
  data = inputData;
  
  const attributes = [];
  for (let i = 0; i < data[0].length - 1; i++) {
    attributes.push({ name: data[0][i], index: i });
  }
  return attributes;
}
