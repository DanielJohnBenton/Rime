# Rime
Rime is a neural network for categorising a pair of words e.g. ["CAT", "HAT"] as RHYMING or NOT RHYMING.

## Structure
The network is a simple three-layer perceptron.
* **781** input neurons (15 letters x 2 words x 26 letters + 1 bias)
* **20** hidden neurons in 1 layer
* **2** output neurons (rhyming/not rhyming classification)
I wish to experiment with deeper layers as this may aid the pattern recognition.

## Data
It's hard to find a set of rhyming words for input. I ended up creating a tiny one myself, by typing up some rhyming words. I think it would work better with a much larger dataset if I can find or create one. The neural network understands specific rhyming patterns it has been taught but does not really get the concept of 'rhyming' so it will not say that e.g. ["HOUSE", "MOUSE"] rhyme unless similar rhyming words exist in the training data.

## Training
The training was performed in many small chunks, and the neural network was saved to a file whenever an improvement in the accuracy occurred.
The accuracy on the training data was around **92.5%** on the last run. At this point the rate of improvement had diminished enormously.

## Use
Use of the 'dotheyrhyme' script looks like this:

```
PS D:\code\rime\14> node dotheyrhyme rhyme time

YES - I believe that 'RHYME' rhymes with 'TIME'.

PS D:\code\rime\14> node dotheyrhyme cat hat

YES - I believe that 'CAT' rhymes with 'HAT'.

PS D:\code\rime\14> node dotheyrhyme cat has

NOPE - I think that 'CAT' does not rhyme with 'HAS'.

PS D:\code\rime\14> node dotheyrhyme actually factually

YES - I believe that 'ACTUALLY' rhymes with 'FACTUALLY'.

PS D:\code\rime\14> node dotheyrhyme atone alone

YES - I believe that 'ATONE' rhymes with 'ALONE'.

PS D:\code\rime\14> node dotheyrhyme thrown throne

YES - I believe that 'THROWN' rhymes with 'THRONE'.

PS D:\code\rime\14> node dotheyrhyme throne thorn

YES - I believe that 'THRONE' rhymes with 'THORN'.

PS D:\code\rime\14> node dotheyrhyme trout throughout

YES - I believe that 'TROUT' rhymes with 'THROUGHOUT'.

PS D:\code\rime\14> node dotheyrhyme people steeple

YES - I believe that 'PEOPLE' rhymes with 'STEEPLE'.

PS D:\code\rime\14> node dotheyrhyme people throughout

NOPE - I think that 'PEOPLE' does not rhyme with 'THROUGHOUT'.
```

## Acknowledgements
Neural network built and trained using [Synaptic by Cazala](https://github.com/cazala/synaptic).