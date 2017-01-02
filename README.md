# Rime
Rime is a neural network for categorising a pair of words e.g. ["CAT", "HAT"] as RHYMING or NOT RHYMING.

## Structure
The network is a simple perceptron.
* 781 input neurons (15 letters x 2 words x 26 letters + 1 bias)
* 20 hidden neurons in 1 layer
* 2 output neurons (rhyming/not rhyming classification)

## Acknowledgements
Built using Synaptic by Cazala