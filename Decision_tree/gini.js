export let data = []; 
const ERROR_CODE = -999;

// Возврат массива с элементами столбца таблицы
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

// Удаление повторяющихся элементов из массива
export function getUniqueElements(arr) {
    if (!arr || arr.length === 0) {
        return [];
    }
    
    // Массив уникальных элементов
    let uniqueArr = [];

    // Добавление в массив уникальных элементов
    for (let i = 0; i < arr.length; i++) {
        if (!uniqueArr.includes(arr[i])) {
            uniqueArr.push(arr[i]);
        }
    }

    return uniqueArr;
}

// Нахождение индекса Джини в колонке
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

// Составление матрицы с колонкой, состоящей из уникальных элементов
function getUniqueMatrix(columnIndex, columnValue) {
    if (!data || data.length <= 1) {
        return [];
    }
    
    let uniqueMatrix = [data[0]]; // Всегда добавляем заголовок

    for (let i = 1; i < data.length; i++) {
        if (data[i][columnIndex] === columnValue) {
            uniqueMatrix.push(data[i]);
        }
    }

    return uniqueMatrix;
}

// Нахождение величины Gini Gain в колонке
function calculateGiniGain(column, columnIndex) {
    if (!column || column.length === 0 || columnIndex === undefined) {
        return ERROR_CODE;
    }
    
    const uniqueClasses = getUniqueElements(column); // Уникальные классы в колонке
    
    // Если слишком мало данных для разбиения, пропускаем этот атрибут
    if (uniqueClasses.length <= 1) {
        return ERROR_CODE;
    }

    // Если слишком много уникальных значений относительно размера данных,
    // это может указывать на атрибут с низкой информативностью (например, ID)
    const minSamplesPerClass = 1;
    if (column.length / uniqueClasses.length < minSamplesPerClass) {
        return ERROR_CODE;
    }

    // Общий индекс Джини для всего набора данных (целевой столбец)
    const targetColumn = getColumn(data, data[0].length - 1);
    const totalGini = calculateGiniIndex(targetColumn);
    
    let weightedGiniSum = 0; // Взвешенная сумма индексов Джини для подмножеств
    const totalRows = data.length - 1; // Общее количество строк без заголовка

    // Нахождение индекса Джини для каждого уникального класса колонки
    for (let i = 0; i < uniqueClasses.length; i++) {
        const uniqueMatrix = getUniqueMatrix(columnIndex, uniqueClasses[i]);
        
        // Проверяем, есть ли строки данных (кроме заголовка)
        if (uniqueMatrix.length > 1) {
            const subsetSize = uniqueMatrix.length - 1; // -1 для учета заголовка
            const probability = subsetSize / totalRows;
            const subsetColumn = getColumn(uniqueMatrix, uniqueMatrix[0].length - 1);
            
            if (subsetColumn.length > 0) {
                const subsetGini = calculateGiniIndex(subsetColumn);
                // Суммирование взвешенных индексов Джини
                weightedGiniSum += probability * subsetGini;
            }
        }
    }

    // Нахождение величины Gini Gain в колонке
    const giniGain = totalGini - weightedGiniSum;
    
    return giniGain;
}

// Нахождение всех атрибутов
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

// Сортировка атрибутов по уменьшению их Gini Gain
function sortAttributes(attributes, giniGains) {
    if (!attributes || attributes.length === 0 || !giniGains || giniGains.length === 0) {
        return;
    }
    
    // Создаем пары [атрибут, giniGain] для правильной сортировки
    let pairs = [];
    for (let i = 0; i < attributes.length; i++) {
        pairs.push({
            attribute: attributes[i],
            giniGain: giniGains[attributes[i].index]
        });
    }
    
    // Сортируем по убыванию Gini Gain
    pairs.sort((a, b) => b.giniGain - a.giniGain);
    
    // Возвращаем отсортированные атрибуты
    return pairs.map(pair => pair.attribute);
}

// Нахождение последовательности атрибутов для построения дерева
export function getTreeNodes(input) {
    if (!input || input.length <= 1) {
        return [];
    }
    
    data = input;               // Таблица с данными
    var giniGains = [];         // Прирост Джини для атрибута

    // Вычисление Gini Gain для каждого атрибута
    for (let i = 0; i < data[0].length - 1; i++) {
        const columnGain = calculateGiniGain(getColumn(data, i), i);
        giniGains.push(columnGain);
    }

    // Нахождение всех атрибутов
    let attributes = getAttributes(giniGains);
    
    // Если нет подходящих атрибутов, возвращаем пустой массив
    if (attributes.length === 0) {
        return [];
    }

    // Сортировка атрибутов по уменьшению их Gini Gain
    attributes = sortAttributes(attributes, giniGains);
    
    return attributes;
}