// Default radius of an atom, fontsize = 1.5 * R
R = 16;
D = 60;

// Arrays of all atoms and bonds
var atoms = [];
var bonds = [];
var formula_dict = {};
var formula = "";
var molecules = {};

// getBond[atom1.id][atom2.id] gives a Bond
// Careful! Need "getBond[atom.id] = {}" everytime a new Atom is created.
var getBond = {};

// Active atom to display properties
var active_atom;

// Pick two atoms to bond mode on/off
var pick_two = false;
var two_atoms_to_bond = [];


// The group that is always centered on canvas
var fabric_group;


/*========================= MAIN FUNCTION ================================*/
var main = function() {
	reset_all();
	
	load_molecule_structures();
	
	$('#prop').scrollspy();
	
	$("#atomOrGroup").val("default");
	$("elementSelect").val("default");
	$("boSelect").val("default");
	
	/* User picks atom or functional group */
	$("#atomOrGroup").change(function(){
		var value = $("#atomOrGroup").val();
		
		if (value == "atom") {
			
			// Turn on newAtom 
			$("#newAtom").removeClass("hidden");
			// Turn off newGroup
			$("#newGroup").addClass("hidden");
			
			// TODO: If it is the first atom or group, then disable bond pick
			
			// Else enable bond pick
			if (!pick_two) {
				$("#bondBtn").prop("disabled", false);
			}
		} else if (value == "group") {
			$("#newGroup").removeClass("hidden");
			$("#newAtom").addClass("hidden");
			if (!pick_two) {
				$("#bondBtn").prop("disabled", false);
			}
		} else {
			$("#newAtom").addClass("hidden");
			$("#newGroup").addClass("hidden");
			$("#bondBtn").prop("disabled", true);
		}
	});
	
	/* User selects the bond order */
	$("#boSelect").change(function(){
		var value = $("#boSelect").val();
		// if "other" is selected, enable the text box.
		if (value < 0) {
			$("#boInput").removeClass("hidden");
		} else {
			$("#boInput").addClass("hidden");
		}
	});
	
	/* Create! */
    $("#bondBtn").click(function() {
	
		// Get values from selection/input box
		var atomOrGroup = $("#atomOrGroup").val();
		var element = $("#elementSelect").val();
		var bo = $("#boSelect").val();
		if (bo == -1) {                // "Other" option is chosen
			bo = $("#boInput").val();
		}
		// Check if any of the values are not valid
		if (atomOrGroup == "default") {
			$("#atomOrGroup").addClass("invalidInput");
		    setTimeout(function() {
		        $("#atomOrGroup").removeClass("invalidInput"); // change it back
		    }, 1000); // waiting one second
			return;
		}
		if (element == "default") {
			$("#elementSelect").addClass("invalidInput");
		    setTimeout(function() {
		        $("#elementSelect").removeClass("invalidInput"); // change it back
		    }, 1000); // waiting one second
			return;
		}
	
		createAtom(element, bo, active_atom);
    });

	/* Clear all */
	$("#clearBtn").click(function() {
		reset_all();
	});
	
	$("#threeDBtn").click(function() {
		// Clear everything
		scene = new THREE.Scene();
		
		var sphere = new THREE.SphereGeometry(0.3, 50, 50);
		var sphere_N = new THREE.SphereGeometry(0.5, 50, 50);
		var material_N = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0xd33523
		});
		var material_H = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0xffed93
		});
		var material_b = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0x1b34ad
		});
		var N = new THREE.Mesh(sphere_N, material_N);
		var H3 = new THREE.Mesh(sphere, material_H);
		var H1 = new THREE.Mesh(sphere, material_H);
		var H2 = new THREE.Mesh(sphere, material_H);
		
		N.position.set(0, 0, 0);
		H1.position.set(-0.4417, 0.2906, 0.8711);
		H2.position.set(0.7256, 0.6896, -0.1907);
		H3.position.set(0.4875, -0.8701, 0.2089);
		
		var len_NH1 = Math.sqrt(-0.4417*-0.4417 + 0.2906*0.2906 + 0.8711*0.8711);
		var len_NH2 = Math.sqrt(0.7256*0.7256 + 0.6896*0.6896 + -0.1907*-0.1907);
		var len_NH3 = Math.sqrt(0.4875*0.4875 + -0.8701*-0.8701 + 0.2089*0.2089);
		
		var vec_NH1 = new THREE.Vector3(-0.4417, 0.2906, 0.8711);
		var vec_NH2 = new THREE.Vector3(0.7256, 0.6896, -0.1907);
		var vec_NH3 = new THREE.Vector3(0.4875, -0.8701, 0.2089);
		
		var axis = new THREE.Vector3(0, 1, 0);
		
		var NH1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len_NH1), material_b);
		var NH2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len_NH2), material_b);
		var NH3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, len_NH3), material_b);
		
		NH1.quaternion.setFromUnitVectors(axis, vec_NH1.clone().normalize());
		NH2.quaternion.setFromUnitVectors(axis, vec_NH2.clone().normalize());
		NH3.quaternion.setFromUnitVectors(axis, vec_NH3.clone().normalize());

		NH1.position.set(-0.4417/2, 0.2906/2, 0.8711/2);
		NH2.position.set(0.7256/2, 0.6896/2, -0.1907/2);
		NH3.position.set(0.4875/2, -0.8701/2, 0.2089/2);
		
		group.add(NH1);
		group.add(NH2);
		group.add(NH3);
		group.add(N);
		group.add(H3);
		group.add(H1);
		group.add(H2);
		scene.add(group);
		
		var dirLight = new THREE.DirectionalLight(0xffffff, 1);
		dirLight.position.set(50, 100, 100);
		scene.add(dirLight);
		var light = new THREE.AmbientLight( 0x404040 ); // soft white light
		scene.add( light );
		
		// camera.position.x = 0.5;
		// camera.position.z = 3;
		camera.position.z = 3;
		// camera.focus = 100000;
		
	});
	
	/* Toggle H */
	// $("#toggleHBtn").click(function() {
	// 	if (!H_hidden) { // hide H
	// 		H_hidden = true;
	// 		for (var i=0; i<atoms.length; i++) {
	// 			if (atoms[i].element == "H") {
	// 				// canvas.remove(atoms[i].fabric_atom);
	// 				atoms[i].fabric_atom.visible = false;
	// 				for (var j=0; j< atoms[i].bonds.length; j++) {
	// 					atoms[i].bonds[j].fabric_bond.visible = false;
	// 				}
	// 			}
	// 		}
	// 		// disable adding more hydrogens
	// 		$("select option[value='H']").attr('disabled', true );
	// 		// change the button text
	// 		$("#toggleHBtn").html("Show Hydrogens")
	// 	} else { // show H
	// 		H_hidden = false;
	// 		for (var i=0; i<atoms.length; i++) {
	// 			if (atoms[i].element == "H") {
	// 				// canvas.add(atoms[i].fabric_atom);
	// 				// atoms[i].fabric_atom.left = atoms[i].rel_left;
	// 				// atoms[i].fabric_atom.top  = atoms[i].rel_top;
	// 				atoms[i].fabric_atom.visible = true;
	// 				for (var j=0; j< atoms[i].bonds.length; j++) {
	// 					atoms[i].bonds[j].fabric_bond.visible = true;
	// 				}
	// 			}
	// 		}
	// 		// reenable adding hydrogen to canvas
	// 		$("select option[value='H']").attr('disabled', false );
	// 		// change the button text
	// 		$("#toggleHBtn").html("Hide Hydrogens")
	// 	}
	// 	// Reset active objects
	// 	var allObjects = canvas.getObjects();
	// 	for (var i = 0; i < allObjects.length; i++) {
	// 		allObjects[i].set('active', false);
	// 	}
	// 	if (active_atom && active_atom.element != "H") {
	// 		active_atom.fabric_atom.set('active', true);
	// 		// active_atom.get_properties();
	// 	}
	//
	// 	canvas.renderAll();
	// });
	
	$("#pickTwoBtn").click(function() {
		if (pick_two) {          // If it is already in pick_two mode
			disable_pick_two();
		} else {                 // If clicked to enable pick_two mode
			enable_pick_two();
		}
	});
	
	$("#confirmPickedAtoms").click(function() {
		var start = two_atoms_to_bond[0];
		var end   = two_atoms_to_bond[1];
		if (!start || !end) {
			$("#toolbarInfo").html("<b>Click on two atoms to bond to form an aromatic ring</b>");
			return;
		} 
		if (getBond[start.id][end.id]) {
			$("#toolbarInfo").html("<b>The two atoms are already directly bonded</b>");
			return;
		}
		
		// TODO: bond the two atoms, recalculate bond angles
		var path = atoms_on_ring();
		for (var i=0; i<path.length; i++) {
			if (i > 0) {
				var a1 = path[i-1];
				var a2 = path[i];
				var b = getBond[a1.id][a2.id];
				console.log(b.atom1.element+" "+b.atom2.element);
			}
		}
		disable_pick_two();
	});
	
	$("#cancelPickedAtoms").click(function() {
		disable_pick_two();
	});
	
	$("#printInfoBtn").click(function() {
		
	});
	
	$("#searchMolecule").focusin(function() {
		if ($("#searchMolecule").val() != "") {
			$("#moleculeList").removeClass("hidden");
		}
	});
	
	$("#searchMolecule").focusout(function() {
	    setTimeout(function() {
	        $("#moleculeList").addClass("hidden");
	    }, 200);
	});	

	$("#moleculeList").on("click", "li", function() {
		var text = $(this).text();
		$("#searchMolecule").val(text);
		
		// Get the structure of this molecule
		var name = text.substr(0,text.indexOf(" -- "));
		var structure = molecules[name];
		console.log(structure["common_name"], structure["n_atoms"]);
		
		// TODO: HOW MANY NEIGHBORS???????
		for (var i=0; i<structure["n_atoms"]; i++) {
			var atom_info = structure["atoms"][i];
			var newAtom = new Atom(
				atom_info["element"],
				atom_info["x_2d"] * D,
				atom_info["y_2d"] * D
			);
			
			
			// createAtom(a["element"], a["bos"][0], atoms[a["neighbors"][0]]);
		}
		
		for (var i=0; i<structure["n_atoms"]; i++) {
			var atom_info = structure["atoms"][i];
			for (var j=0; j<atom_info["neighbors"].length; j++) {
				var n = atom_info["neighbors"][j];
				var newBond = atoms[i].bond_with(atoms[n], atom_info["bos"][j]);
				
			}
		}
		
		for (var i=0; i<atoms.length; i++) {
			add_to_fabric_group(atoms[i].fabric_atom);
		}
		for (var i=0; i<bonds.length; i++) {
			add_to_fabric_group(bonds[i].fabric_bond);
		}
		
		
		
		center_and_update_coords();
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		canvas.renderAll();
		
		
		
		
		
		
		
		
		
	});
	
	
}

$(document).ready(main);



/*======================== HELPER FUNCTIONS ===============================*/

function checkGetBond() {
	var line = "";
	line += "  ";
	for (var i=0; i<atoms.length; i++) {
		line += atoms[i].element+"  ";
	}
	console.log(line);
	for (var i=0; i<atoms.length; i++) {
		line = atoms[i].element+" ";
		for(var j=0; j<atoms.length; j++) {
			var a1 = atoms[i];
			var a2 = atoms[j];
			var b = getBond[i][j];
			if (b) {
				line += (b.atom1.element+b.atom2.element+" ");
			} else {
				line += ("   ");
			}
			
		}
		console.log(line);
	}
}

/* Reset. */
function reset_all() {
	// Global variables
	active_atom = null;
	atoms = [];
	bonds = [];
	formula_dict = {};
	formula = "";
	
	// Canvas stuff
	canvas.selection = false;
	canvas.clear();
	fabric_group = new fabric.Group([], {
		subTargetCheck : true,
		hoverCursor    : "pointer",
		selectable     : false,
		hasControls    : false,
		lockMovementX  : true,
		lockMovementY  : true,
		originX        : "center",
		originY        : "center"
	});
	canvas.add(fabric_group);
	fabric_group.center();
	fabric_group.setCoords();
	
	// Right sidebar properties
	$("#neighbors").empty();
	$("#factor").empty();
	$("#formula").empty();
	
	// Left selection sidebar
	$("#bondBtn").html("Add to canvas!");
	$("#boSelect").hide();
	$("#boSelectLabel").hide();
	
	// Top toolbar
	disable_pick_two();
}

/* Load the molecule structures from PHP */
function load_molecule_structures() {
	$.ajax({
		type: "GET",
		url: "structure_parse.php",
	    data: {
			"is_load_structures": true,
			},
		success: function(response){
			molecules = JSON.parse(response);
			console.log(Object.keys(molecules).length);
		}
	});
}

/* 2D Canvas - Create a new atom and put on the canvas. */
function createAtom(element, bo, ori_atom=active_atom) {
	
	// Create the atom object
	var a;
	
	if (atoms.length == 0) {
		// First atom, put at the center
		a = new Atom(element, 0, 0);
		active_atom = a;
		active_atom.fabric_atom.set("active", true);
		active_atom.get_properties();
		canvas.renderAll();
		
		$("#bondBtn").html("Bond!");
		$("#boSelect").show();
		$("#boSelectLabel").show();
		
		
		
		
		center_and_update_coords();
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		canvas.renderAll();
		
		
		
		
		
		
	} else {
		// If bo is not valid
		if (bo == "default") {
			$("#boSelect").addClass("invalidInput");
		    setTimeout(function() {
		        $("#boSelect").removeClass("invalidInput"); // change it back
		    }, 1000); // waiting one second
			return;
		}
		
		// Check if an atom is selected (active_atom exists)
		if (!ori_atom) {
			alert("Please select an atom to bond to");
			return;
		}
		
		// Check how many bonds the active atom has
		// These are booleans to see if the active atom has any bonds already
		var right = ori_atom.bond_dirs["right"];
		var left  = ori_atom.bond_dirs["left"];
		var up    = ori_atom.bond_dirs["top"];
		var down  = ori_atom.bond_dirs["bottom"];
		
		// Add bond to the right
		if (!right && (left || (up && down) || (!up && !down) ) ) {
			a = new Atom(element, ori_atom.abs_left+D, ori_atom.abs_top);
			a.bond_with(ori_atom, bo, 0);
			ori_atom.bond_dirs["right"] = true;
			a.bond_dirs["left"] = true;

		// Add bond to the left
		} else if (!left && (right || (up && down)) ) {
			a = new Atom(element, ori_atom.abs_left-D, ori_atom.abs_top);
			a.bond_with(ori_atom, bo, 0);
			ori_atom.bond_dirs["left"] = true;
			a.bond_dirs["right"] = true;

		// Add bond to the top
		} else if (!up && (down || (left && right)) ) {
			a = new Atom(element, ori_atom.abs_left, ori_atom.abs_top-D);
			a.bond_with(ori_atom, bo, 90);
			ori_atom.bond_dirs["top"] = true;
			a.bond_dirs["bottom"] = true;

		// Add bond to the bottom
		} else if (!down && (up || (left && right)) ) {
			a = new Atom(element, ori_atom.abs_left, ori_atom.abs_top+D);
			a.bond_with(ori_atom, bo, 90);
			ori_atom.bond_dirs["bottom"] = true;
			a.bond_dirs["top"] = true;
		
		// TODO: If >4 bonds are allowed...
		} else {
			
		}
		
		
		
		
		center_and_update_coords();
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		canvas.renderAll();
		
		
		
		
		
		
		// If the new atom is not in frame
		if (a && (a.abs_left   < R*canvas.getZoom()  ||
		          a.abs_right  > canvas.getWidth() - R*canvas.getZoom() ||
		          a.abs_top    < R*canvas.getZoom() ||
		          a.abs_bottom > canvas.getHeight() - R*canvas.getZoom())) {
			var group_center = new fabric.Point(fabric_group.left, fabric_group.top);
			var newZoom = canvas.getZoom() * 0.9;
			canvas.zoomToPoint(group_center, newZoom);
			center_and_update_coords();
		}
			
		// Keep the old active atom selected, update properties
		if (active_atom) {
			active_atom.fabric_atom.set("active", true);
			active_atom.get_properties();
			canvas.renderAll();
		}
	}
}

/* 2D Canvas - Take a fabric object, add to fabric_group, recenter everything. */
function add_to_fabric_group(obj) {
	fabric_group.addWithUpdate(obj);
	canvas.add(obj);
	
	// canvas._activeObject = null;
}

/* 2D Canvas - Center everything. */
function center_and_update_coords() {
	fabric_group.center();
	fabric_group.setCoords();
	for (var i in atoms) {
		atoms[i].update_coords();
	}
	for (var i in bonds) {
		bonds[i].update_coords();
	}
}

/* Toolbar - Enable the pick two atoms to bond function. */
function enable_pick_two() {
	pick_two = true;
	$("#toolbarInfoRow").removeClass("hidden");
	resizeCanvas();
	display_atoms_to_bond();
	// Disable adding new atoms
	$("#bondBtn").prop("disabled", true);
}

/* Toolbar - Disable the pick two atoms to bond function. */
function disable_pick_two() {
	pick_two = false;
	$("#toolbarInfoRow").addClass("hidden");
	resizeCanvas();
	while (two_atoms_to_bond.length > 0) {
		var a = two_atoms_to_bond.shift();
		a.fabric_atom.fontWeight = "normal";
		a.fabric_atom.setColor("black");
	}
	canvas.renderAll();
	// Enable adding new atoms
	$("#bondBtn").prop("disabled", false);
}

/* Toolbar - Display the existing atoms picked by the user to bond. */
function display_atoms_to_bond() {
	if (two_atoms_to_bond.length == 0) {
		$("#toolbarInfo").html("<b>Click on two atoms to bond to form an aromatic ring</b>");
	} else {
		$("#toolbarInfo").html("<b>Atoms picked:</b> ");
		for (var i=0; i<two_atoms_to_bond.length; i++) {
			$("#toolbarInfo").append(two_atoms_to_bond[i].element + " ");
		}
		if (two_atoms_to_bond.length == 2) {
			$("#confirmPickedAtoms").prop("disabled", false);
		} else {
			$("#confirmPickedAtoms").prop("disabled", true);
		}
	}
}

/* Toolbar - Return the path between two atoms selected. */
function atoms_on_ring() {
	var start = two_atoms_to_bond[0];
	var end   = two_atoms_to_bond[1];
	
	// Clear visited & parent of all atoms
	for (var i=0; i<atoms.length; i++) {
		atoms[i].visited = false;
		atoms[i].pathParent = null;
	}
	
	// A queue to visit
	var stack = [];
	stack.push(start);
	
	// The path found
	var path = [];
	
	while (stack.length > 0) {
		var current = stack.pop();
		if (current == end) {
			break;
		}
		if (!current.visited) {
			current.visited = true;
			for (var i=0; i<current.neighbors.length; i++) {
				var n = current.neighbors[i];
				if (!n.visited) {
					stack.push(n);
					n.pathParent = current;
				}
			}
		}
	}
	
	// Trace back to find the path
	var current = end;
	while (current) {
		path.push(current);
		current = current.pathParent;
	}
	
	return path;
}

/* Left bar - Find out if the searched molecule exists. */
function search_molecule(search_text) {
	// Clear the molecule list
	if (!search_text || search_text == "") {
		$("#moleculeList").addClass("hidden");
		return;
	}
	$("#moleculeList").removeClass("hidden");
	
	search_text = search_text.toUpperCase();
	
	// Get all the names of the molecules
	var count = 0;
	var html_str = "";
	for (var formula_key in molecules) {
		
		var common_name = molecules[formula_key]["common_name"];
		
		if (formula_key.indexOf(search_text) >= 0 ||
	        common_name.toUpperCase().indexOf(search_text) >= 0) {
				
				html_str += "<li>"+formula_key+" -- "+common_name+"</li>";
				count += 1;
				// Only show 6 results at a time
				if (count >= 6) {
					break;
				}
        }
	}
	if (count == 0) {
		$("#moleculeList").html("<li>No results found</li>");
	} else {
		$("#moleculeList").html(html_str);
	}
}




/*======================= ATOM & BOND CLASSES ==============================*/

class Atom {
	
	constructor(name, x, y, r=R) {
		var self = this;
		
		this.element = name;
		this.neighbors = [];
		this.bonds = [];
		this.n_bonds = 0; // Total # bonds (accounting double & triple)
		this.bond_dirs = {
			"right"  : false,
			"left"   : false,
			"top"    : false,
			"bottom" : false
		}
		this.rel_left = x;
		this.rel_top = y;
		this.abs_left = fabric_group.left + this.rel_left;
		this.abs_top = fabric_group.top + this.rel_top;
		this.radius = r;
	    this.fabric_atom = new fabric.Text(this.element, {
			fontSize   : this.radius * 1.5,
			fontFamily : "Arial",
			originX    : "center",
			originY    : "center",
			left       : this.rel_left,
			top        : this.rel_top,
			hasControls   : false,
			lockMovementX : true,
			lockMovementY : true,
			hoverCursor   : "default"
		});
		
		// Add this to the list of all atoms
		// TODO: Is it possible to remove an atom in the middle???
		this.id = atoms.length;
		atoms.push(this);
	
		// Add the atom to the formula
		if (!formula_dict[name]) {
			formula_dict[name] = 1;
		} else {
			formula_dict[name] += 1;
		}
		
		// Create new row for getBond[][] lookup map
		getBond[this.id] = {};
		
		// Add the fabric atom to the centered group
		// add_to_fabric_group(this.fabric_atom);
		
		this.fabric_atom.on("mousedown", function(options){
			
			console.log(self.rel_left, self.rel_top, "  ", self.abs_left, self.abs_top);
			
			// Normally...
			if (!pick_two) {
				canvas.setActiveObject(this);
				canvas.renderAll();
				active_atom = self;
				self.get_properties();
			}
			
			// In the case of picking two atoms to bond...
			else {
				// If the clicked atom is already selected, then deselect
				var i = two_atoms_to_bond.indexOf(self);
				if (i >= 0) {
					var old_selection = two_atoms_to_bond[i];
					old_selection.fabric_atom.fontWeight = "normal";
					old_selection.fabric_atom.setColor("black");
					two_atoms_to_bond.splice(i, 1);
				}
				// Select the new atom
				else {
					if (two_atoms_to_bond.length == 2) {
						var old_selection = two_atoms_to_bond.shift();
						old_selection.fabric_atom.fontWeight = "normal";
						old_selection.fabric_atom.setColor("black");
					}
					two_atoms_to_bond.push(self);
					// canvas.setActiveObject(this);
					this.fontWeight = "bold";
					this.setColor("#d3349e");
				}

				canvas.renderAll();
				display_atoms_to_bond();
			}
			
		});
	}

	bond_with(another_atom, bondorder, angle=30) {
		
		// Create new bond
		var bond = new Bond(this, another_atom, bondorder, angle);
		
		// Update the bonds list for both atoms.
		this.bonds.push(bond);
		this.n_bonds += bondorder;
		another_atom.bonds.push(bond);
		another_atom.n_bonds += bondorder;
		
		// Update the neighbors list for both atoms.
		this.neighbors.push(another_atom);
		another_atom.neighbors.push(this);
		
		
		return bond;
	}

	set_xy(x, y) {
		this.x = x;
		this.y = y;
	}

	get_properties() {
		
		/* DISPLAY THE CHEMICAL FORMULA WITH HILL SYSTEM: */
		$("#formula").html("<h4>Chemical formula</h4><p id=formula_line></p>");
		formula = "";
		
		// If there is C, C->H->the rest alphabetical
		if (formula_dict["C"]) {
			$("#formula_line").append("C");
			formula += "C";
			if (formula_dict["C"] > 1) {
				$("#formula_line").append("<sub>"+formula_dict["C"]+"</sub>");
				formula += formula_dict["C"];
			}
			// Append H
			if (formula_dict["H"]) {
				$("#formula_line").append("H");
				formula += "H";
				if (formula_dict["H"] > 1) {
					$("#formula_line").append("<sub>"+formula_dict["H"]+"</sub>");
					formula += formula_dict["H"];
				}
			}
			
			// Display the rest of the elements in alphabetical order.
			var elements = Object.keys(formula_dict);
			elements.sort();
			for (var i=0; i<elements.length; i++) {
			    var e = elements[i];
			    var n = formula_dict[e];
			    if (e != "C" && e != "H") {
			    	$("#formula_line").append(e);
					formula += e;
					if (n > 1) {
						$("#formula_line").append("<sub>"+n+"</sub>");
						formula += n;
					}
			    }
			} 
		} 
		// If there is no C, just alphabetical
		else {
			var elements = Object.keys(formula_dict);
			elements.sort();
			for (var i=0; i<elements.length; i++) {
			    var e = elements[i];
			    var n = formula_dict[e];
		    	$("#formula_line").append(e);
				formula += e;
				if (n > 1) {
					$("#formula_line").append("<sub>"+n+"</sub>");
					formula += n;
				}
			} 
		}
		
		/* DISPLAY ALL THE NEIGHBORS & BONDS W/ THEM: */
		$("#neighbors").html("<h4>Neighbors</h4>");
		if (this.neighbors.length == 0) {
			$("#neighbors").append("<p>None</p>");
		} else {
			for (var i = 0; i < this.neighbors.length; i++){
				$("#neighbors").append("<p>" + this.neighbors[i].element + ":&emsp;"
									 + "Bond order = " + this.bonds[i].order
									 + "</p>");
			}
		}
		
		/* DISPLAY THE DATA RETRIEVED FROM DATABASE:
		 *   For all the neighbors of this atom,
		 *     add {this, neighbor, bondorder, 1} to the array
		 *     For all the neighbors of the neighbor (excluding this atom)
		 *       add {neighbor, neineighbor, bondorder, 2} to the array
		 */
		var query_array = [];
		for (var i = 0; i < this.neighbors.length; i++) {
			var nb = this.neighbors[i];
			query_array.push({
				"Atom1": this.element,
			    "Atom2": nb.element,
			    "BondOrder": this.bonds[i].order,
			    "Proximity": 1});

			for (var j = 0; j < nb.neighbors.length; j++) {
				if (nb.neighbors[j] == this) {
					continue;
				}
				query_array.push({
					"Atom1": nb.element,
				    "Atom2": nb.neighbors[j].element,
				    "BondOrder": nb.bonds[j].order,
				    "Proximity": 2});
			}
		}
		
		// PHP call to database
		$.ajax({
			type: "GET",
			url: "ajax.php",
		    data: {
				 "is_factor_query": true,
			     "json_query": JSON.stringify(query_array)},
			success: function(response){
				$("#factor").html("<h4>Isotopic factor</h4>");
				$("#factor").append(response);
			}
		});
	}
	
	update_coords() {
		this.rel_left = this.fabric_atom.left;
		this.rel_top  = this.fabric_atom.top;
		this.abs_left = this.rel_left + fabric_group.left;
		this.abs_top  = this.rel_top + fabric_group.top;
	}
}

class Bond {
	
	/* Takes two Atom objects and bond them together. */
	constructor(atom1, atom2, bondorder, angle) {
		this.atom1 = atom1;
		this.atom2 = atom2;
		this.order = bondorder;
		this.angle = angle;
		this.fabric_bond = this.create_fabric_bond();
		
		// Add this bond to the list of bonds.
		// TODO: Will the id access cause out of bounds problems???
		this.id = bonds.length;
		bonds.push(this);
		
		// Update getBond[][] lookup map
		getBond[atom1.id][atom2.id] = this;
		getBond[atom2.id][atom1.id] = this;
		
		// Add the fabric bond to the centered group
		// add_to_fabric_group(this.fabric_bond);
		
		// TODO: Click on the bond will trigger events
		this.fabric_bond.on("mousedown", function(options){
			canvas.setActiveObject(this);
			canvas.renderAll();

			// Access atom and its properties
			
			// TODO: Allow user to break the bond
		});
	}
	
	create_fabric_bond() {
		var x  = (this.atom1.rel_left + this.atom2.rel_left) / 2;
		var y  = (this.atom1.rel_top  + this.atom2.rel_top)  / 2;
		// var x  = (this.atom1.abs_left + this.atom2.abs_left) / 2;
		// var y  = (this.atom1.abs_top  + this.atom2.abs_top)  / 2;
		var dx = R * 0.75;
		
		var start_x = x - (D/2 - dx);
		var end_x   = x + (D/2 - dx);
		
		var lines = new fabric.Group([], {
			hoverCursor    : "pointer",
			selectable     : true,
			hasControls    : false,
			lockMovementX  : true,
			lockMovementY  : true,
			originX        : "center",
			originY        : "center"
		});
		if (this.order == 1) {
			lines.addWithUpdate(new fabric.Line([start_x, y, end_x, y], {
			    stroke  : 'black'
			}));
		} else if (this.order == 2) {
			lines.addWithUpdate(new fabric.Line([start_x, y+3, end_x, y+3], {
			    stroke  : 'black'
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-3, end_x, y-3], {
			    stroke  : 'black'
			}));
		} else if (this.order == 3) {
			lines.addWithUpdate(new fabric.Line([start_x, y+5, end_x, y+5], {
			    stroke  : 'black'
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y, end_x, y], {
			    stroke  : 'black'
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-5, end_x, y-5], {
			    stroke  : 'black'
			}));
		} else if (this.order > 1) {
			lines.addWithUpdate(new fabric.Line([start_x, y+3, end_x, y+3], {
			    strokeDashArray: [3, 3],
			    stroke  : 'black'
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-3, end_x, y-3], {
			    stroke  : 'black'
			}));
		}
		lines.setAngle(this.angle);
		return lines;
	}
	
	update_coords() {
		this.rel_left = this.fabric_bond.left;
		this.rel_top  = this.fabric_bond.top;
		this.abs_left = this.rel_left + fabric_group.left;
		this.abs_top  = this.rel_top + fabric_group.top;
	}
}