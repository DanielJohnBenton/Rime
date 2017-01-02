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

function Log()
{
	for(let i = 0, c = arguments.length; i < c; i++)
	{
		console.log(arguments[i]);
	}
}

let rime = Network.fromJSON(JSON.parse(fs.readFileSync("network.json", "utf8").toString()));


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
	
	while(code.length < 780)
	{
		code.push(0);
	}
	
	code.push(1);
	
	return code;
}

if(process.argv.length != 4)
{
	Log("Please give two words.");
	process.exit();
}

let run = rime.activate(EncodePair(SanitiseWord(process.argv[2]), SanitiseWord(process.argv[3])));
let yes = run[0];
let no = run[1];

Log("");

if(yes > no)
{
	Log("YES - I believe that '"+ process.argv[2].toUpperCase() +"' rhymes with '"+ process.argv[3].toUpperCase() +"'.");
}
else
{
	Log("NOPE - I think that '"+ process.argv[2].toUpperCase() +"' does not rhyme with '"+ process.argv[3].toUpperCase() +"'.");
}

Log("");

process.exit();