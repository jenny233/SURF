# A Computational Tool for Determining the Thermodynamic Isotopic Factor

This is a web-based project for modeling molecules and computing the site-specific thermodynamic isotopic factor of various elements. The website is hosted at http://107.170.208.38/surf/, works best when viewed in Firefox browser. This is a 2017 SURF project at Caltech.

## What is the Thermodynamic Isotopic Factor (&beta;)?

It is a constant, specific to the molecule's structure and the atom in interest. In a reversable reaction, at equilibrium, if there is a heavy isotope (e.g. C-13 or O-18) present, the &beta; factor gives information about how likely the heavy isotope will occupy one atom's site versus another. This is particularly important in Geochemistry research.

The &beta; factors are determined by the additive approximation method in this project, originally proposed by Eric Galimov in 1985. For an atom A of interest,  &beta; is equal to 1 plus the primary bond numbers associated with its first degree neighbors (atoms that A is directly bonded to) plus the secondary bond numbers associated with its second degree neighbors. The bond numbers are constants Galimov assigned to each type of bond (e.g. C-C single bond, C-O double bond), and for the same bond, the primary bond number is greater in magnitude than the secondary bond number.

More information can be found at https://en.wikipedia.org/wiki/Equilibrium_fractionation and in *The Biological Fractionation of Isotopes* by Eric Galimov.


## How to use the website?

The interface is organized into three columns: left, middle, and right.

### Middle column: Canvas

Uses `<canvas>` element and Fabric.js to display the molecular structure that the user builds or imports.

The top toolbar is used to edit the existing structure on the canvas or show a 3D model. Below are the toolbar functionalities:

- **3D model**

  Show 3D model with Three.js (if there is 3D coordinates available for this molecule in our database).
  
- **Change atom element**

  Click on an atom to change it to another element (from nitrogen to oxygen for example).
  
- **Change atom position**

  Rotate the direction in which an atom is bonded to another, so that the structure is neater and atoms & bonds don't overlap. This only works if the atom to be moved is only bonded to one other atom.
  
- **Change bond order**

  Click on a bond to change its order (from single bond to double bond for example).

- **Clear all**

  Self-explanatory, clears all atoms and bonds on canvas.

- **Erase**

  Click on an atom to erase it and its bond. Note that it only works if the atom is bonded to 1 or 0 other atoms.

- **Center all**

  The structure is centered on the canvas by default. But if that is not the case (e.g. due to browser size changes), this button will center the structure.

### Left column: Selections

Used to add new molecules, functional groups, rings, or atoms onto the canvas.

- **Import molecule**

  Search for a molecule by its chemical formula or its common name. If there is a match in our molecular structure database, then the molecule will be added to the canvas.

- **Add a new atom**

  Select "Atom" in the "Atom / functional group / ring?" dropdown menu. 

  Then select which element you want to add. 

  If it is the first atom to be added to canvas, then just click on the "Add to canvas" button. 

  If there are already other atoms on the canvas, then make sure to click on one of the existing atoms and select the bond order for the new atom to be bonded. The reason is that the structure on the canvas needs to remain in one group for display reasons using Fabric.js.

- **Add a functional group**

  Select "Functional group" in the "Atom / functional group / ring?" dropdown menu. 

  Then search for the functional group you want to add, by its chemical formula or its common name. For example, you can find the Carboxyl group by typing in "carboxyl" or "carboxylic acid" or "COOH".

  Similarly, if there are already existing atoms on the canvas, make sure to click on one of the existing atoms and select the bond order for the new functional group to be bonded.

- **Add a ring**

  Select "Ring" in the "Atom / functional group / ring?" dropdown menu. Then select the size of the ring via the dropdown menu, or select "Other" and type in a number.

  If the canvas is empty at this point, the ring will be added to the canvas once you click "Add to canvas".

  If there are existing atoms, then there will be a prompt near the top, below the toolbar, that tells you to click on an atom or a bond as a fixed vertex or a fixed side of the new ring. Click on an atom or a bond, and the selected will turn into magenta color. Then click "Bond!".

  The selected atom or the two atoms at each end of the selected bond will be part of the new ring.

  Note that the ring is constructed out of C atoms with single bonds by default. If there are other elements or bonds of different orders, you can use the top toolbar to make changes.

### Right Column: Properties

After you get your desired molecule structure, click on an atom to see the properties:

- Chemical formula of the structure using the Hill system

- Selected atom

- The &beta; factor and the bond numbers used to calculate it

- Neighbors of the selected atom


## Built with

- [Fabric.js](fabricjs.com) - 2D canvas

- [Three.js](threejs.org) - 3D WebGL rendering

- [Bootstrap](getbootstrap.com) - Webpage structure

- [Glyphicons](http://glyphicons.com/) - Icons used in the web interface


## Author

Jieni Li, *California Institute of Technology*

Mentor: Dr. John Eiler, *California Institute of Technology*

## Acknowledgements

This project would not be possible without the discussions with my mentor Professor Eiler, as well as financial support from Caltech and Kiyo and Eiko Tomiyasu. It also benefited greatly from the help of my colleagues Surya Mathialagan and Shreya Ramachandran.

## Questions?

Email: jli5@caltech.edu


