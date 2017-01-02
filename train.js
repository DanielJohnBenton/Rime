"use strict";

// useful for larger networks:
// --max_old_space_size=4096

let fs = require("fs");
let synaptic = require('synaptic');
let Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

/*
	Log (
		ANYTHING, ANYTHING, ...
	): VOID
*/
function Log()
{
	for(let i = 0, c = arguments.length; i < c; i++)
	{
		console.log(arguments[i]);
	}
}

Log("Starting.");
Log("If this crashes, try using option '--max_old_space_size=4096'.");

/*
	OBJECT Perceptron (
		INTEGER input,
		INTEGER hidden,
		INTEGER output
	)
*/
function Perceptron(input, hidden, output)
{
    let inputLayer = new Layer(input);
    let hiddenLayer = new Layer(hidden);
    let outputLayer = new Layer(output);

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
}

Perceptron.prototype = new Network();
Perceptron.prototype.constructor = Perceptron;

// Create a vector for each letter e.g. A = [1, 0, 0, ...] B = [0, 1, 0, ...]
let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let zeroes = [];
let inputs = [];

for(let iAlphabet = 0, c = alphabet.length; iAlphabet < c; iAlphabet++)
{
	zeroes.push(0);
}

for(let iAlphabet = 0, c = alphabet.length; iAlphabet < c; iAlphabet++)
{
	inputs["_"+ alphabet[iAlphabet]] = zeroes.slice();
	inputs["_"+ alphabet[iAlphabet]][iAlphabet] = 1;
}

// Input neurons required: 26 letters in alphabet x 15 letter maximum input x 2 (rhyming pair) = 780 + 1 (bias) = 781

/*
	SanitiseWord (
		STRING word
	): STRING
	
	Sanitises a word for training/testing the neural network.
	Only allows upper case LETTERS.
	Any word longer than the allowed number of letters will be cut down to that length.
	Unusually, this is not a truncation from the end but rather the start, since it's presumed that the end of the word will matter more for rhyming.
*/
function SanitiseWord(word)
{
	let allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	word = word.toUpperCase();
	
	let sanitised = "";
	
	for(let i = 0, l = word.length; i < l; i++)
	{
		if(allowed.indexOf(word.charAt(i)) != -1)
		{
			sanitised += word.charAt(i);
		}
	}
	
	if(sanitised.length > 15)
	{
		sanitised = sanitised.substring(sanitised.length - 15, sanitised.length);
	}
	
	return sanitised;
}

/*
	EncodeWord (
		STRING word
	): ARRAY code [INTEGER] = INTEGER
*/
function EncodeWord(word)
{
	let code = [];
	
	for(let i = 0, l = word.length; i < l; i++)
	{
		code = code.concat(inputs["_"+ word.charAt(i)]);
	}
	
	while(code.length < 390)
	{
		code.push(0);
	}
	
	return code;
}

/*
	EncodePair (
		STRING word1,
		STRING word2
	): ARRAY [INTEGER] = INTEGER
	
	Note - words should be sanitised (SanitiseWord) before passing to EncodePair.
*/
function EncodePair(word1, word2)
{
	let code = EncodeWord(word1).concat(EncodeWord(word2));
	
	code.push(1);
	
	return code;
}

/*
	Random (
		INTEGER min,
		INTEGER max
	): INTEGER
*/
function Random(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
	UniqueRandom (
		INTEGER min,
		INTEGER max,
		INTEGER count
	): ARRAY [INTEGER] = INTEGER
*/
function UniqueRandom(min, max, count)
{
	let a = [];
	
	for(let i = min; i <= max; i++)
	{
		a.push(min + (max - i));
	}
	
	let r = [];
	
	for(let i = 0; i < count; i++)
	{
		r.push(a.splice(Random(0, a.length - 1), 1)[0]);
	}
	
	return r;
}

Log("Assembling training data.");

let lines = fs.readFileSync("rhymelist.txt", "utf8").toString().toUpperCase().split("\r\n");
let words = [];
for(let iLines = 0, c = lines.length; iLines < c; iLines++)
{
	words[iLines] = lines[iLines].split(" ");
	
	for(let iWords = 0, cWords = words[iLines].length; iWords < cWords; iWords++)
	{
		words[iLines][iWords] = SanitiseWord(words[iLines][iWords]);
	}
}

let trainingData = [];
let trainingDataLookup = [];

let cTrainingRhymingPairs = 0;
let cTrainingNonRhymingPairs = 0;

/*
	Create a well of training data by pairing up rhyming and non-rhyming words.
	Doing this using random selections because it should be used with a much larger rhyming list!
*/
for(let i = 0; i < 50000; i++)
{
	// add a rhyming pair
	let xRhymingLine = Random(0, words.length - 1);
	let xRhymingWords = UniqueRandom(0, words[xRhymingLine].length - 1, 2);
	let rhymingWord1 = words[xRhymingLine][xRhymingWords[0]];
	let rhymingWord2 = words[xRhymingLine][xRhymingWords[1]];
	
	let id = "_"+ rhymingWord1 +"@"+ rhymingWord2;
	
	if(typeof(trainingDataLookup[id]) == "undefined")
	{
		let rhymingCode = EncodePair(rhymingWord1, rhymingWord2);
		
		trainingData.push(
			{
				input: rhymingCode,
				output: [1, 0]
			}
		);
		
		trainingDataLookup[id] = true;
		
		cTrainingRhymingPairs++;
	}
}

for(let i = 0; i < 50000; i++)
{
	// add a non-rhyming pair
	let xNonRhymingLines = UniqueRandom(0, words.length - 1, 2);
	let nonRhymingWord1 = words[xNonRhymingLines[0]][Random(0, words[xNonRhymingLines[0]].length - 1)];
	let nonRhymingWord2 = words[xNonRhymingLines[1]][Random(0, words[xNonRhymingLines[1]].length - 1)];
	
	let id = "_"+ nonRhymingWord1 +"@"+ nonRhymingWord2;
	
	if(typeof(trainingDataLookup[id]) == "undefined")
	{
		let nonRhymingCode = EncodePair(nonRhymingWord1, nonRhymingWord2);
		
		trainingData.push(
			{
				input: nonRhymingCode,
				output: [0, 1]
			}
		);
		
		trainingDataLookup[id] = true;
		
		if(++cTrainingNonRhymingPairs >= cTrainingRhymingPairs)
		{
			break;
		}
	}
}

let cTrainingData = trainingData.length;

Log("Training Begins.");

let rime = new Perceptron(781, 20, 2);

let bestAccuracy = 0;

// Run many short training sessions using small chunks of the training data. Due to the input size, anything much larger at time breaks JS! :^(
for(let i = 1; i <= 20000; i++)
{
	let trainingSet = [];
	let xTrainingSet = UniqueRandom(0, trainingData.length - 1, 15);
	for(let iTrainingSet = 0, c = xTrainingSet.length; iTrainingSet < c; iTrainingSet++)
	{
		trainingSet.push(trainingData[xTrainingSet[iTrainingSet]]);
	}

	let trainer = new Trainer(rime);
	trainer.train(trainingSet, {
		rate: .2,
		iterations: 10,
		error: .0001,
		shuffle: true,
		log: 0,
		cost: Trainer.cost.MSE
	});
	
	let cCorrect = 0;
	
	for(let iTrainingData = 0; iTrainingData < cTrainingData; iTrainingData++)
	{
		let run = rime.activate(trainingData[iTrainingData].input);
		
		let expected = ((trainingData[iTrainingData].output[0] == 1) ? "YES" : "NO");
		let result = ((run[0] > run[1]) ? "YES" : "NO");
		
		if(result == expected)
		{
			cCorrect++;
		}
	}
	
	let accuracy = (cCorrect / cTrainingData) * 100;
	
	if(accuracy > bestAccuracy)
	{
		bestAccuracy = accuracy;
		Log();
		Log("Round "+ i +" complete. New best accuracy found: "+ bestAccuracy.toFixed(3) +" %\t\t--> SAVING NEURAL NETWORK");
		
		fs.writeFileSync("network.json", JSON.stringify(rime.toJSON(), null, "\t"), "utf8");
		
		if(bestAccuracy >= 100)
		{
			Log("Finishing with 100% accuracy!");
			
			break;
		}
	}
	else if(i % 500 == 0)
	{
		Log("Round "+ i +" complete.");
	}
}

Log("Training ends.");

// Force exit as it sometimes hangs here
process.exit();




