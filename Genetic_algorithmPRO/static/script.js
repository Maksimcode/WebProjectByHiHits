class Genotype {
  constructor(fitness, setGeneNumbers, firstSetGenes, secondSetGenes) {
    this.fitness = fitness;
    this.setGeneNumbers = setGeneNumbers;
    this.firstSetGenes = firstSetGenes;
    this.secondSetGenes = secondSetGenes;
  }
}

const populationSize = 200;
const numberGenerations = 100;
const probabilityMutation = 50;

const genes = [
  "\t\t\t\t\tlet fib1 = ",
  "0;\n",
  "\t\t\t\t\tlet fib2 = ",
  "1;\n",
  "\t\t\t\t\tlet fibSum = ",
  "0;\n",
  "\t\t\t\t\tfor(let i = 0; i < n - 2; ++i){\n",
  "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tfibSum = fib1 + ",
  "fib2;\n",
  "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t[fib1, fib2] = ",
  "[fib2, fibSum];\n",
];

let genotypes = [];
let intervalID;

function fibonacci(n) {
  let fib1 = 0;
  let fib2 = 1;
  let fibSum = 0;

  if (n === 1) {
    fibSum = 0;
  } else if (n === 2) {
    fibSum = 1;
  } else {
    for (let i = 0; i < n - 2; ++i) {
      fibSum = fib1 + fib2;
      [fib1, fib2] = [fib2, fibSum];
    }
  }

  return fibSum;
}

function calculateFitness(currentGenotype) {
  let fitness = 0;

  function check(currentGenotype) {
    try {
      for (let n = 1; n <= genes.length; ++n) {
        eval(
          currentGenotype.firstSetGenes +
            "if(n == 1){fibSum = 0}" +
            "else if(n == 2){fibSum = 1}" +
            "else{" +
            currentGenotype.secondSetGenes +
            "}}" +
            "fitness += Math.abs(fibonacci(n) - fibSum);"
        );
      }
    } catch {
      fitness = Infinity;
    }
  }

  check(currentGenotype);

  return fitness;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function genGeneration() {
  let gen = Array.from({ length: genes.length }, (element, index) => index);

  for (let j = 0; j < genes.length; ++j) {
    let pos = getRandomNumber(j, genes.length);
    [gen[j], gen[pos]] = [gen[pos], gen[j]];
  }

  return gen;
}

function sortGenes() {
  for (let i = 0; i < genotypes.length - 1; ++i) {
    for (let j = i + 1; j < genotypes.length; ++j) {
      if (genotypes[i].fitness > genotypes[j].fitness) {
        [genotypes[i], genotypes[j]] = [genotypes[j], genotypes[i]];
      }
    }
  }
}

function generatePopulation() {
  for (let i = 0; i < populationSize; ++i) {
    let currentGenotype = new Genotype(
      Infinity,
      new Array(genes.length),
      "",
      ""
    );

    for (let j = 0; j < currentGenotype.setGeneNumbers.length; ++j) {
      currentGenotype.setGeneNumbers = genGeneration();
    }

    for (let k = 0; k < 6; ++k) {
      currentGenotype.firstSetGenes += genes[currentGenotype.setGeneNumbers[k]];
    }
    for (let m = 6; m < currentGenotype.setGeneNumbers.length; ++m) {
      currentGenotype.secondSetGenes +=
        genes[currentGenotype.setGeneNumbers[m]];
    }

    currentGenotype.fitness = calculateFitness(currentGenotype);
    genotypes.push(currentGenotype);
  }
}

function crossing(firstParent, secondParent) {
  let separator = 0;
  let breakIndex = getRandomNumber(1, firstParent.setGeneNumbers.length - 2);
  let child = new Genotype(Infinity, new Array(), Infinity, "", "");

  for (let i = 0; i < breakIndex; ++i) {
    child.setGeneNumbers.push(firstParent.setGeneNumbers[i]);

    if (separator < 6) {
      child.firstSetGenes += genes[firstParent.setGeneNumbers[i]];
    } else {
      child.secondSetGenes += genes[firstParent.setGeneNumbers[i]];
    }

    separator++;
  }

  for (let i = breakIndex; i < secondParent.setGeneNumbers.length; ++i) {
    if (
      child.setGeneNumbers.includes(secondParent.setGeneNumbers[i]) === false
    ) {
      child.setGeneNumbers.push(secondParent.setGeneNumbers[i]);

      if (separator < 6) {
        child.firstSetGenes += genes[secondParent.setGeneNumbers[i]];
      } else {
        child.secondSetGenes += genes[secondParent.setGeneNumbers[i]];
      }

      separator++;
    }
  }

  for (let i = 0; i < secondParent.setGeneNumbers.length; ++i) {
    if (
      child.setGeneNumbers.includes(secondParent.setGeneNumbers[i]) === false
    ) {
      child.setGeneNumbers.push(secondParent.setGeneNumbers[i]);

      if (separator < 6) {
        child.firstSetGenes += genes[secondParent.setGeneNumbers[i]];
      } else {
        child.secondSetGenes += genes[secondParent.setGeneNumbers[i]];
      }

      separator++;
    }
  }

  if (getRandomNumber(1, 100) < probabilityMutation) {
    child = mutation(child);
  } else {
    child.fitness = calculateFitness(child);
  }

  return child;
}

function mutation(child) {
  let firstGen = getRandomNumber(0, child.setGeneNumbers.length - 1);
  let secondGen = getRandomNumber(0, child.setGeneNumbers.length - 1);

  while (firstGen === secondGen) {
    secondGen = getRandomNumber(0, child.setGeneNumbers.length - 1);
  }

  [child.setGeneNumbers[firstGen], child.setGeneNumbers[secondGen]] = [
    child.setGeneNumbers[secondGen],
    child.setGeneNumbers[firstGen],
  ];

  child.firstSetGenes = "";
  child.secondSetGenes = "";

  for (let k = 0; k < 6; ++k) {
    child.firstSetGenes += genes[child.setGeneNumbers[k]];
  }

  for (let m = 6; m < child.setGeneNumbers.length; ++m) {
    child.secondSetGenes += genes[child.setGeneNumbers[m]];
  }

  child.fitness = calculateFitness(child);

  return child;
}

function outputValue(n) {
  try {
    eval(
      genotypes[0].firstSetGenes +
        "if(n === 1){fibSum = 0}" +
        "else if(n === 2){fibSum = 1}" +
        "else{" +
        genotypes[0].secondSetGenes +
        "}}" +
        "document.getElementById('answer').innerHTML = 'Число Фибоначчи под номером ' + n + ' равно ' + fibSum"
    );
  } catch {
    document.getElementById("answer").innerHTML =
      "Число Фибоначчи под номером " + n + " равно " + Infinity;
  }
}

function geneticAlgorithm() {
  document.getElementById("description").style.display = "flex";

  clearInterval(intervalID);
  genotypes = [];

  generatePopulation();
  let count = 0;
  let index = getRandomNumber(0, genotypes[0].setGeneNumbers.length - 1);

  function geneticAlgorithmAnimation() {
    for (let i = 0; i < numberGenerations; ++i) {
      let firstParent = getRandomNumber(0, populationSize - 1);
      let secondParent = getRandomNumber(0, populationSize - 1);

      while (firstParent === secondParent) {
        secondParent = getRandomNumber(0, populationSize - 1);
      }

      genotypes.push(crossing(genotypes[firstParent], genotypes[secondParent]));
    }

    sortGenes();

    for (let k = 0; k < numberGenerations; ++k) {
      genotypes.pop();
    }

    if (count > 20) {
      index = getRandomNumber(0, genotypes[0].setGeneNumbers.length - 1);
      count = 0;
    }

    if (genotypes[0].fitness !== Infinity) {
      index = 0;
    }

    document.getElementById("output").innerHTML =
      "function fibonacci(n) {<br>" +
      genotypes[index].firstSetGenes
        .replace(/\n/g, "<br>")
        .replace(/\t/g, "&nbsp;") +
      "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if(n === 1){<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fibSum = 0;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>" +
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else if(n === 2){<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fibSum = 1;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>" +
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;else{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
      genotypes[index].secondSetGenes
        .replace(/\n/g, "<br>")
        .replace(/\t/g, "&nbsp;") +
      "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}" +
      "<br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return fibSum;" +
      "<br>}";

    count++;

    if (genotypes[0].fitness === 0) {
      document.getElementById("description").style.display = "none";
      clearInterval(intervalID);
    }

    outputValue(document.getElementById("genetic_number").value);
  }

  intervalID = setInterval(geneticAlgorithmAnimation, 10);

  geneticAlgorithmAnimation();
}

document.getElementById("start").addEventListener("click", () => {
  geneticAlgorithm();
});

document.getElementById("clear").addEventListener("click", () => {
  clearInterval(intervalID);
  document.getElementById("answer").innerHTML = "";
  document.getElementById("output").innerHTML = "";
  document.getElementById("description").style.display = "none";
  genotypes = [];
});
