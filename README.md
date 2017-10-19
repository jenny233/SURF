# A Computational Tool for Determining the Thermodynamic Isotopic Factor
SURF 2017

## Introduction
This is a web-based project for modeling molecules and computing the site-specific thermodynamic isotopic factor of various elements. The website is hosted at http://107.170.208.38/surf/

### What is the Thermodynamic Isotopic Factor (&beta;)?
It is a constant, specific to the molecule's structure and the atom in interest. In a reversable reaction, at equilibrium, if there is a heavy isotope (e.g. C-13 or O-18) present, the &beta; factor gives information about how likely the heavy isotope will occupy one atom's site versus another. This is particularly important in Geochemistry research.

The &beta; factors are determined by the additive approximation method in this project, originally proposed by Eric Galimov in 1985. For an atom A of interest,  &beta; is equal to 1 plus the primary bond numbers associated with its first degree neighbors (atoms that A is directly bonded to) plus the secondary bond numbers associated with its second degree neighbors. The bond numbers are constants Galimov assigned to each type of bond (e.g. C-C single bond, C-O double bond), and for the same bond, the primary bond number is greater in magnitude than the secondary bond number.

More information can be found at https://en.wikipedia.org/wiki/Equilibrium_fractionation and in *The Biological Fractionation of Isotopes* by Eric Galimov.
