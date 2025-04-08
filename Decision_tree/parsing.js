export function readFile(text) {
    
  let resultArray = []; 

  let currentLineSymbols = [];

  for (let position = 0; position <= text.length; position++) {

    let currentChar = text[position] || '';

    if (currentChar === '\n' || position === text.length) {

      let lineString = currentLineSymbols.join('');

      let parts = lineString.split(',').map(p => p.trim());

      if (lineString !== '') {
        resultArray.push(parts);
      }
      
      currentLineSymbols = [];
    } else {

      currentLineSymbols.push(currentChar);
    }
  }
  return resultArray.filter(arr => arr.length > 0);
}