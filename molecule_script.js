// Default radius of an atom, fontsize = 1.5 * R
R = 18
D = 70;
D_H = 42;
M = 70;

// Arrays of all atoms and bonds
var atoms = [];
var bonds = [];
var formula_dict = {};
var formula = "";
var molecules = {};
var func_groups = {};

// getBond[atom1.id][atom2.id] gives a Bond
// Careful! Need "getBond[atom.id] = {}" everytime a new Atom is created.
var getBond = {};

// Active atom to display properties
var active_atom;

// The group that is always centered on canvas
var fabric_group;

// Hide or show hydrogens
var H_hidden = false;

// Pick two atoms to bond mode on/off
var pick_two = false;
var two_atoms_to_bond = [];

// Pick a bond to change bond order
var pick_bond = false;
var bond_to_change;

var new_element = "";
var func_group_name = "";


/*========================= MAIN FUNCTION ================================*/
var main = function() {
	reset_all();
	load_molecule_structures();
	load_func_group_structures();
	
	$('[data-toggle="tooltip"]').tooltip(); 
	
	$("#atomOrGroup").val("default");
	$("elementSelect").val("default");
	$("boSelect").val("default");
	
	/* User picks atom or functional group */
	$("#atomOrGroup").change(function(){
		var value = $("#atomOrGroup").val();
		new_element = value;
		if (value == "atom") {
			$("#newAtom").removeClass("hidden"); // Turn on newAtom
			$("#newGroup").addClass("hidden"); // Turn off newGroup
			$("#newRing").addClass("hidden"); // Turn off newRing
			disable_pick_two();
			$("#bondBtn").prop("disabled", false);
			
		} else if (value == "group") {
			$("#newGroup").removeClass("hidden");
			$("#newAtom").addClass("hidden");
			$("#newRing").addClass("hidden");
			disable_pick_two();
			$("#bondBtn").prop("disabled", false);
			
		} else if (value == "ring") {
			$("#newRing").removeClass("hidden");
			$("#newAtom").addClass("hidden");
			$("#newGroup").addClass("hidden");
			$("#bondBtn").prop("disabled", false);
			// Enable pick_two to choose which 1 or 2 atoms to bond to the ring
			// If there is nothing on the canvas, create new ring
			// If there is something, need to pick 1 or 2 atoms to bond to
			// Prompt to pick atoms
			if (atoms.length > 0) {
				$("#pickTwoInfoRow").removeClass("hidden");
				// Enable pick two
				enable_pick_two();
			} else {
				$("#pickTwoInfoRow").addClass("hidden");
			}
		} else {
			$("#newAtom").addClass("hidden");
			$("#newGroup").addClass("hidden");
			$("#newRing").addClass("hidden");
			disable_pick_two();
			$("#bondBtn").prop("disabled", true);
		}
		
	});
	
	/* User selects the bond order */
	$("#boSelect").change(function(){
		var value = parseFloat($("#boSelect").val());
		// if "other" is selected, enable the text box.
		if (value < 0) {
			$("#boInput").removeClass("hidden");
		} else {
			$("#boInput").addClass("hidden");
		}
	});
	
	/* User selects the ring size */
	$("#ringSelect").change(function() {
		var value = parseInt($("#ringSelect").val());
		// if "other" is selected, enable the text box.
		if (value < 0) {
			$("#ringInput").removeClass("hidden");
		} else {
			$("#ringInput").addClass("hidden");
		}
	})
	
	/* Create! */
    $("#bondBtn").click(function() {
		if (new_element == "atom") {
			add_new_atom_to_canvas();
		} else if (new_element == "group") {
			add_new_group_to_canvas(func_group_name);
		} else if (new_element == "ring") {
			for (var a in two_atoms_to_bond) {
				console.log(two_atoms_to_bond[a].element);
			}
			// If these two atoms are not directly connected, alert
			disable_pick_two();
			$("#atomOrGroup").val("default");
			$("#newAtom").addClass("hidden");
			$("#newGroup").addClass("hidden");
			$("#newRing").addClass("hidden");
			$("#bondBtn").prop("disabled", true);
			
		}
    });
	
	/* Clear all */
	$("#clearBtn").click(function() {
		reset_all();
	});
	
	/* Erase something */
	$("#eraseBtn").click(function() {
		// Check if there is any active atom selected
		if (canvas.getActiveObject() && canvas.getActiveObject().text) {
			// If the active atom is only attached to one thing only
			if (active_atom.neighbors.length == 0) {
				fabric_group.remove(active_atom.fabric_atom);
				canvas.remove(active_atom.fabric_atom);
				active_atom = null;
			}else if (active_atom.neighbors.length == 1) {
				// Yes
				var neighbor = active_atom.neighbors[0];
				var bond = active_atom.bonds[0];
				var index = neighbor.neighbors.indexOf(active_atom);
				neighbor.neighbors.splice(index, 1);
				index = neighbor.bonds.indexOf(bond);
				neighbor.bonds.splice(index, 1);
				neighbor.n_bonds -= bond.order;
				// TODO: need to update the bond directions for neighbor as well
				
				fabric_group.remove(active_atom.fabric_atom);
				canvas.remove(active_atom.fabric_atom);
				fabric_group.remove(bond.fabric_bond);
				canvas.remove(bond.fabric_bond);
				
				active_atom = null;
			} else {
				// No
				$("#eraseAlert").find("p").html("Only atoms bonded to one other atom can be erased.");
				$("#eraseAlert").modal();
			}
		} else {
			$("#eraseAlert").find("p").html("Plase first select an atom to erase.\n(The atom can only be bonded to one other atom.)");
			$("#eraseAlert").modal();
		}
	});
	
	/* Show 3D */
	$("#threeDBtn").click(function() {
		// Clear everything
		scene = new THREE.Scene();
		
		// Get the structure of the molecule
		
		var sphere = new THREE.SphereGeometry(0.2, 50, 50);
		var sphere_N = new THREE.SphereGeometry(0.5, 50, 50);
		var material_N = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0x4360cc
		});
		var material_H = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0xffffff
		});
		var material_b = new THREE.MeshLambertMaterial({
			// shading: THREE.FlatShading,
			color: 0x8d8d8d
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
	
	
	/* Change Bond Order */
	$("#changeBOBtn").click(function() {
		if (pick_bond) {
			disable_pick_bond();
		} else {
			enable_pick_bond();
		}
	});
	
	$("#okChangeBO").click(function() {
		// Remove fabric_bond from canvas
		fabric_group.remove(bond_to_change.fabric_bond);
		
		// Replace with a new bond (id is the same)
		var id = bond_to_change.id; // pos in the bonds array
		var angle = bond_to_change.angle;
		var atom1 = bond_to_change.atom1;
		var atom2 = bond_to_change.atom2;
		var old_bo = bond_to_change.order;
		var new_bo = parseFloat($("#changeBOInput").val());
		var new_bond = new Bond(atom1, atom2, new_bo, angle);
		bonds.splice(id, 1, new_bond);
		
		// Replace the bond in atoms' bonds array
		var index = atom1.bonds.indexOf(bond_to_change);
		atom1.bonds.splice(index, 1, new_bond);
		index = atom2.bonds.indexOf(bond_to_change);
		atom2.bonds.splice(index, 1, new_bond);
		
		// Modify their n_bonds
		atom1.n_bonds -= old_bo;
		atom2.n_bonds -= old_bo;
		atom1.n_bonds += new_bo;
		atom2.n_bonds += new_bo;
		
		// Update canvas
		add_to_fabric_group(new_bond.fabric_bond);
		// Reset active objects
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		active_atom.fabric_atom.set('active', true);
		active_atom.get_properties();
		canvas.renderAll();
		
		disable_pick_bond();
	});
	
	$("#quitChangeBO").click(function() {
		disable_pick_bond();
	});
	
	
	/* Pick two atoms */
	// $("#pickTwoBtn").click(function() {
// 		if (pick_two) {          // If it is already in pick_two mode
// 			disable_pick_two();
// 		} else {                 // If clicked to enable pick_two mode
// 			enable_pick_two();
// 		}
// 	});
	
	$("#okPickedAtoms").click(function() {
		var start = two_atoms_to_bond[0];
		var end   = two_atoms_to_bond[1];
		if (!start || !end) {
			$("#pickTwoInfo").html("<b>Click on two atoms to bond to form an aromatic ring</b>");
			return;
		} 
		if (getBond[start.id][end.id]) {
			$("#pickTwoInfo").html("<b>The two atoms are already directly bonded</b>");
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
	
	$("#quitPickedAtoms").click(function() {
		disable_pick_two();
		$("#atomOrGroup").val("default");
		$("#newAtom").addClass("hidden");
		$("#newGroup").addClass("hidden");
		$("#newRing").addClass("hidden");
		
		$("#bondBtn").prop("disabled", true);
	});
	

	
	/* Search molecule bar animations */
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
	
	/* Search functional group bar animations */
	$("#searchFuncGroup").focusin(function() {
		if ($("#searchFuncGroup").val() != "") {
			$("#funcGroupList").removeClass("hidden");
		}
	});
	$("#searchFuncGroup").focusout(function() {
	    setTimeout(function() {
	        $("#funcGroupList").addClass("hidden");
	    }, 200);
	});	
	
	/* An imported molecule is clicked */
	$("#moleculeList").on("click", "li", function() {
		
		// If there already exists atoms, ask if user wants to clear the screen
		if (atoms.length > 0) {
			$("#importAlert").modal();
			return;
		}
		
		var text = $(this).text();
		$("#searchMolecule").val(text);
		
		// Get the structure of this molecule
		var f_name = text.substr(0,text.indexOf(" -- "));
		var structure = molecules[f_name];
		
		for (var i=0; i<structure["n_atoms"]; i++) {
			var atom_info = structure["atoms"][i];
			var newAtom = create_atom(
				atom_info["element"],
				atom_info["x_2d"] * M,
				atom_info["y_2d"] * M
			);
		}
		
		for (var i=0; i<structure["n_atoms"]; i++) {
			var atom_info = structure["atoms"][i];
			for (var j=0; j<atom_info["neighbors"].length; j++) {
				var n = atom_info["neighbors"][j];
				var newBond = create_bond(atoms[i], atoms[n], atom_info["bos"][j]);
			}
		}
		
		for (var i in atoms) {
			add_to_fabric_group(atoms[i].fabric_atom);
		}
		for (var i in bonds) {
			add_to_fabric_group(bonds[i].fabric_bond);
		}
		
		center_and_update_coords();
		
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		canvas.renderAll();
	});
	
	/* An imported functional group is clicked */
	$("#funcGroupList").on("click", "li", function() {
		
		var text = $(this).text();
		$("#searchFuncGroup").val(text);
		// Get the structure of this molecule
		func_group_name = text.substr(0,text.indexOf(" -- "));
		// add_new_group_to_canvas(common_name);
		
	});
	
	/* Search configurations */
	
}

$(document).ready(main);


/*======================== HELPER FUNCTIONS ===============================*/

/* Reset. */
function reset_all() {
	// Global variables
	active_atom = null;
	atoms = [];
	bonds = [];
	formula_dict = {};
	formula = "";
	
	// Canvas stuff
	clear_canvas();
	
	// Right sidebar properties
	$("#neighbors").empty();
	$("#factor").empty();
	$("#formula").empty();
	
	// Left selection sidebar
	$("#searchMolecule").val("");
	
	$("#pickTwoInfoRow").addClass("hidden"); // For the ring
	
	$("#bondBtn").html("Add to canvas!");
	$("#boSelect").addClass("hidden");
	$("#boSelectLabel").addClass("hidden");
	
	var group_center = new fabric.Point(fabric_group.left, fabric_group.top);
	canvas.zoomToPoint(group_center, 1);
	
	// Top toolbar
	disable_pick_two();
}
function clear_canvas() {
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
}

/* Load the molecule structures from PHP */
function load_molecule_structures() {
	$.ajax({
		type: "GET",
		url: "structure_parse.php",
	    data: {
			"is_load_molecules": true,
			},
		success: function(response){
			molecules = JSON.parse(response);
			console.log("Load molecule structures successful. Number loaded: "
			           + Object.keys(molecules).length);
		}
	});
}

/* Load the functional group structures */
function load_func_group_structures() {
	$.ajax({
		type: "GET",
		url: "structure_parse.php",
	    data: {
			"is_load_func_group": true,
			},
		success: function(response){
			func_groups = JSON.parse(response);
			console.log("Load functional group structures successful. Number loaded: "
			           + Object.keys(func_groups).length);
		}
	});
}

/* Calculate coords for creating the new atom, object with x, y as keys. */
function new_atom_coords(old_atom, distance) {
	var coords = {x: old_atom.abs_left, y: old_atom.abs_top};
	
	// Simplification: only 8 directions. Separate 360 degrees to 8 sections.
	// See if old_atom has any bonds in that direction, 0 or 1.
	var r  = old_atom.bond_dirs["right"];
	var l  = old_atom.bond_dirs["left"];
	var t  = old_atom.bond_dirs["top"];
	var b  = old_atom.bond_dirs["bottom"];
	var tr = old_atom.bond_dirs["top-right"];
	var tl = old_atom.bond_dirs["top-left"];
	var br = old_atom.bond_dirs["bottom-right"];
	var bl = old_atom.bond_dirs["bottom-left"];
	// r and l can cancel each other, t and b can cancel each other
	var r_score = r + tr + br - l - tl - bl;
	var t_score = t + tr + tl - b - br - bl;
	
	if (Math.abs(r_score) == Math.abs(t_score)) {
		// Try right, left, top, bottom, tr, tl, br, bl in order
		if (r == 0) {
			coords.x += distance;
			return coords;
		} else if (l == 0) {
			coords.x -= distance;
			return coords;
		} else if (t == 0) {
			coords.y -= distance;
			return coords;
		} else if (b == 0) {
			coords.y += distance;
			return coords;
		} else if (tr == 0) {
			coords.x += distance / 1.4142;
			coords.y -= distance / 1.4142;
			return coords;
		} else if (tl == 0) {
			coords.x -= distance / 1.4142;
			coords.y -= distance / 1.4142;
			return coords;
		} else if (br == 0) {
			coords.x += distance / 1.4142;
			coords.y += distance / 1.4142;
			return coords;
		} else if (bl == 0) {
			coords.x -= distance / 1.4142;
			coords.y += distance / 1.4142;
			return coords;
		}
		
	} else if (Math.abs(r_score) > Math.abs(t_score)) {
		// If left-right has stronger preference
		if (r_score > 0) {
			// Try left first
			if (l == 0) {
				coords.x -= distance;
				return coords;
			} else if (t_score > 0) {
				// Try bl then tl
				if (bl == 0) {
					coords.x -= distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				} else if (tl == 0) {
					coords.x -= distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				}
			} else {
				// Try tl then bl
				if (tl == 0) {
					coords.x -= distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				} else if (bl == 0) {
					coords.x -= distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				}
			}
		} else { // r_score <= 0
			// Try right first
			if (r == 0) {
				coords.x += distance;
				return coords;
			} else if (t_score > 0) {
				// Try br then tr
				if (br == 0) {
					coords.x += distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				} else if (tr == 0) {
					coords.x += distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				}
			} else {
				// Try tr then br
				if (tr == 0) {
					coords.x += distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				} else if (br == 0) {
					coords.x += distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				}
			}
			
		}
	} else {
		// If top-bottom has stronger preference
		if (t_score > 0) {
			// Try bottom first
			if (b == 0) {
				coords.y += distance;
				return coords;
			} else if (r_score > 0) {
				// Try bl then br
				if (bl == 0) {
					coords.x -= distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				} else if (br == 0) {
					coords.x += distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				}
			} else {
				// Try br then bl
				if (br == 0) {
					coords.x += distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				} else if (bl == 0) {
					coords.x -= distance / 1.4142;
					coords.y += distance / 1.4142;
					return coords;
				}
			}
		} else {
			// Try top first
			if (t == 0) {
				coords.y -= distance;
				return coords;
			} else if (r_score > 0) {
				// Try tl then tr
				if (tl == 0) {
					coords.x -= distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				} else if (tr == 0) {
					coords.x += distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				}
			} else {
				// Try tr then tl
				if (tr == 0) {
					coords.x += distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				} else if (tl == 0) {
					coords.x -= distance / 1.4142;
					coords.y -= distance / 1.4142;
					return coords;
				}
			}
		}
	}
}

/* Create & return new Atom at (x,y), update atoms, formula, and sidebar. */
function create_atom(element, x, y) {
	// The Atom object
	var a = new Atom(element, x, y);
	
	// If this is the first atom
	if (atoms.length == 0) {
		// active_atom = a;
		// a.fabric_atom.set("active", true);
		// a.get_properties();
		$("#bondBtn").html("Bond!");
		$("#boSelect").removeClass("hidden");
		$("#boSelectLabel").removeClass("hidden");
	}
	
	// Add atom to the list of atoms
	atoms.push(a);
	
	// Add the atom to the formula
	if (!formula_dict[element]) {
		formula_dict[element] = 1;
	} else {
		formula_dict[element] += 1;
	}
	
	return a;
}

/* Bond two atoms together, update bonds. Return bond. */
function create_bond(atom1, atom2, bo) {
	// Calculate the angle of the bond based on the two atoms
	var angle_rad = Math.atan( (atom1.rel_top-atom2.rel_top)/(atom1.rel_left-atom2.rel_left) );
	var angle = angle_rad * 180 / Math.PI;
	// angle is between -90 and 90
	
	// Create new bond
	var b = new Bond(atom1, atom2, bo, angle);
	
	// Add to bonds array
	bonds.push(b);
	
	// Update the bonds list for both atoms.
	atom1.bonds.push(b);
	atom2.bonds.push(b);
	atom1.n_bonds += bo;
	atom2.n_bonds += bo;
	
	// Update the neighbors list for both atoms.
	atom1.neighbors.push(atom2);
	atom2.neighbors.push(atom1);
	
	// Update the bond_dirs for both atoms.
	if (angle >= -22.5 && angle < 22.5) {
		// left-right
		if (atom1.rel_left < atom2.rel_left) {
			console.assert(atom1.bond_dirs["right"]==0, "Cannot bond, right direction occupied.", atom1);
			atom1.bond_dirs["right"] = 1;
			console.assert(atom2.bond_dirs["left"]==0, "Cannot bond, left direction occupied.", atom2);
			atom2.bond_dirs["left"] = 1;
		} else {
			console.assert(atom1.bond_dirs["left"]==0, "Cannot bond, left direction occupied.", atom1);
			atom1.bond_dirs["left"] = 1;
			console.assert(atom2.bond_dirs["right"]==0, "Cannot bond, right direction occupied.", atom2);
			atom2.bond_dirs["right"] = 1;
		}
	} else if (angle >= 22.5 && angle < 67.5) {
		// top left-bottom right
		if (atom1.rel_left < atom2.rel_left) {
			console.assert(atom1.bond_dirs["bottom-right"]==0, "Cannot bond, bottom-right direction occupied.", atom1);
			atom1.bond_dirs["bottom-right"] = 1;
			console.assert(atom2.bond_dirs["top-left"]==0, "Cannot bond, top-left direction occupied.", atom2);
			atom2.bond_dirs["top-left"] = 1;
		} else {
			console.assert(atom1.bond_dirs["top-left"]==0, "Cannot bond, top-left direction occupied.", atom1);
			atom1.bond_dirs["top-left"] = 1;
			console.assert(atom2.bond_dirs["bottom-right"]==0, "Cannot bond, bottom-right direction occupied.", atom2);
			atom2.bond_dirs["bottom-right"] = 1;
		}
	} else if (angle >= 67.5 && angle <= 90 || angle >= -90 && angle < -67.5) { 
		// top-bottom
		if (atom1.rel_top < atom2.rel_top) {
			console.assert(atom1.bond_dirs["bottom"]==0, "Cannot bond, bottom direction occupied.", atom1);
			atom1.bond_dirs["bottom"] = 1;
			console.assert(atom2.bond_dirs["top"]==0, "Cannot bond, top direction occupied.", atom2);
			atom2.bond_dirs["top"] = 1;
		} else {
			console.assert(atom1.bond_dirs["top"]==0, "Cannot bond, top direction occupied.", atom1);
			atom1.bond_dirs["top"] = 1;
			console.assert(atom2.bond_dirs["bottom"]==0, "Cannot bond, bottom direction occupied.", atom2);
			atom2.bond_dirs["bottom"] = 1;
		}
	} else if (angle >= -67.5 && angle < -22.5) {
		// top right-bottom left
		if (atom1.rel_left < atom2.rel_left) {
			console.assert(atom1.bond_dirs["top-right"]==0, "Cannot bond, top-right direction occupied.", atom1);
			atom1.bond_dirs["top-right"] = 1;
			console.assert(atom2.bond_dirs["bottom-left"]==0, "Cannot bond, bottom-left direction occupied.", atom2);
			atom2.bond_dirs["bottom-left"] = 1;
		} else {
			console.assert(atom1.bond_dirs["bottom-left"]==0, "Cannot bond, bottom-left direction occupied.", atom1);
			atom1.bond_dirs["bottom-left"] = 1;
			console.assert(atom2.bond_dirs["top-right"]==0, "Cannot bond, top-right direction occupied.", atom2);
			atom2.bond_dirs["top-right"] = 1;
		}
	}
	
	
	return b;
}

function add_new_atom_to_canvas() {
	// Get values from boxes
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
	        $("#atomOrGroup").removeClass("invalidInput");
	    }, 1000); // waiting one second
		return;
	}
	if (element == "default") {
		$("#elementSelect").addClass("invalidInput");
	    setTimeout(function() {
	        $("#elementSelect").removeClass("invalidInput");
	    }, 1000); // waiting one second
		return;
	}
	if (atoms.length > 0 && bo == "default") {
		$("#boSelect").addClass("invalidInput");
	    setTimeout(function() {
	        $("#boSelect").removeClass("invalidInput");
	    }, 1000); // waiting one second
		return;
	}
	
    // Create new atom!
	// First calculate where to put the new atom
	// Then create new Atom
	// Then add new Atom to the group and canvas and center everything
	// If it is not the first atom, bond it to something
	// Create the bond
	// Add the bond to the group and canvas and center everything
	if (atoms.length == 0) {
		var a = create_atom(element, 0, 0);
		add_to_fabric_group(a.fabric_atom);
		center_and_update_coords();
	} else {
		if (!active_atom) {
			$("#bondBtnAlert").find("p").html("Please select an atom to bond to");
			$("#bondBtnAlert").modal();
			return;
		}
		var old_atom = active_atom;
		if (element == "H") {
			var coords = new_atom_coords(old_atom, D_H); // smaller distance
		} else {
			var coords = new_atom_coords(old_atom, D);  // normal distance
		}
		var a = create_atom(element, coords.x, coords.y);
		add_to_fabric_group(a.fabric_atom);
		center_and_update_coords();
		// If the new atom is not in frame
		adjust_frame_zoom(a);

		// Bond the two atoms
		bo = parseFloat(bo);
		var b = create_bond(a, old_atom, bo);
		add_to_fabric_group(b.fabric_bond);

		// Reset active objects
		var allObjects = canvas.getObjects();
		for (var i = 0; i < allObjects.length; i++) {
			allObjects[i].set('active', false);
		}
		active_atom.fabric_atom.set('active', true);
		active_atom.get_properties();
	
	}
	canvas.renderAll();
    
}

function add_new_group_to_canvas(group_name) {
	
	
	var structure = func_groups[group_name];
	console.log(structure["formula"], structure["n_atoms"]);
	
	// The numbering offset between atoms array and the txt file
	var offset = atoms.length;
	
	for (var i in structure["atoms"]) {
		var atom_info = structure["atoms"][i];
	    // Create new atom!
		// First calculate where to put the new atom
		// Then create new Atom
		// Then add new Atom to the group and canvas and center everything
		// If it is not the first atom, bond it to something
		// Create the bond
		// Add the bond to the group and canvas and center everything
		if (atoms.length == 0) {
			var a = create_atom(atom_info["element"], 0, 0);
			active_atom = a;
			add_to_fabric_group(a.fabric_atom);
			center_and_update_coords();
		} else {
			for (var n=0; n<atom_info["neighbors"].length; n++) {
				// The one connected to the active_atom
				if (atom_info["neighbors"][n] == "") {
					var old_atom = active_atom;
					var bo = parseFloat($("#boSelect").val());
					if (bo == -1) {              // "Other" option is chosen
						bo = parseFloat($("#boInput").val());
					}
				} else {
					var old_atom_id = parseFloat(atom_info["neighbors"][n]) + offset;
				    var old_atom = atoms[old_atom_id];
					var bo = parseFloat(atom_info["bos"][n]);
				}
				
				var element = atom_info["element"];
				if (element == "H") {
					var coords = new_atom_coords(old_atom, D_H); // smaller distance
				} else {
					var coords = new_atom_coords(old_atom, D);  // normal distance
				}
				var a = create_atom(element, coords.x, coords.y);
				add_to_fabric_group(a.fabric_atom);
				center_and_update_coords();
				// If the new atom is not in frame
				adjust_frame_zoom(a);

				// Bond the two atoms
				var b = create_bond(a, old_atom, bo);
				add_to_fabric_group(b.fabric_bond);
				
			}
		}
		
	}
	// Reset active objects
	var allObjects = canvas.getObjects();
	for (var j = 0; j < allObjects.length; j++) {
		allObjects[j].set('active', false);
	}
	active_atom.fabric_atom.set('active', true);
	active_atom.get_properties();
	
	canvas.renderAll();
}

/* Take a fabric object, add to fabric_group. */
function add_to_fabric_group(fabric_obj) {
	fabric_group.addWithUpdate(fabric_obj);
	canvas.add(fabric_obj);
	// canvas._activeObject = null;
}

/* Center everything, update abs/rel coords in atoms & bonds. */
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

function adjust_frame_zoom(atom) {
	// If the new atom is not in frame
	if (atom && (atom.abs_left   < R*canvas.getZoom()  ||
	          atom.abs_right  > canvas.getWidth() - R*canvas.getZoom() ||
	          atom.abs_top    < R*canvas.getZoom() ||
	          atom.abs_bottom > canvas.getHeight() - R*canvas.getZoom())) {
		var group_center = new fabric.Point(fabric_group.left, fabric_group.top);
		var newZoom = canvas.getZoom() * 0.9;
		canvas.zoomToPoint(group_center, newZoom);
		center_and_update_coords();
	}
}

/* Find out if the searched molecule exists. */
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
				
				if (molecules[formula_key]["format"] != "full" &&
			        molecules[formula_key]["format"] != "2d") {
					continue;
				}
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

/* Find out if the searched functional group exists. */
function search_func_group(search_text) {
	// Clear the functional group list
	if (!search_text || search_text == "") {
		$("#funcGroupList").addClass("hidden");
		return;
	}
	$("#funcGroupList").removeClass("hidden");
	
	search_text = search_text.toUpperCase();
	
	// Get all the names of the functional groups
	var count = 0;
	var html_str = "";
	for (var group_name in func_groups) {
		
		var formula_name = func_groups[group_name]["formula"];
		var chemical_class = func_groups[group_name]["class"];
		
		if (formula_name.indexOf(search_text) >= 0 ||
	        group_name.toUpperCase().indexOf(search_text) >= 0 ||
	        chemical_class.toUpperCase().indexOf(search_text) >= 0) {
				
				html_str += "<li>"+group_name+" -- "+formula_name+"</li>";
				count += 1;
				// Only show 6 results at a time
				if (count >= 6) {
					break;
				}
        }
	}
	if (count == 0) {
		$("#funcGroupList").html("<li>No results found</li>");
	} else {
		$("#funcGroupList").html(html_str);
	}
}

/* Toolbar - Enable the pick two atoms to bond function. */
function enable_pick_two() {
	pick_two = true;
	// $("#pickTwoInfoRow").removeClass("hidden");
	// resizeCanvas();
	// display_atoms_to_bond();
	// Disable adding new atoms
	// $("#bondBtn").prop("disabled", true);
}

/* Toolbar - Disable the pick two atoms to bond function. */
function disable_pick_two() {
	pick_two = false;
	// $("#pickTwoInfoRow").addClass("hidden");
	// resizeCanvas();
	while (two_atoms_to_bond.length > 0) {
		var a = two_atoms_to_bond.shift();
		a.fabric_atom.fontWeight = "normal";
		a.fabric_atom.setColor("black");
	}
	canvas.renderAll();
	// Enable adding new atoms
	// $("#bondBtn").prop("disabled", false);
}

/* Toolbar - Display the existing atoms picked by the user to bond. */
function display_atoms_to_bond() {
	if (two_atoms_to_bond.length == 0) {
		$("#pickTwoInfo").html("<b>Click on 1 or 2 atoms as the base of an aromatic ring</b>");
	} else {
		$("#pickTwoInfo").html("<b>Atoms picked:</b> ");
		for (var i=0; i<two_atoms_to_bond.length; i++) {
			$("#pickTwoInfo").append(two_atoms_to_bond[i].element + " ");
		}
		if (two_atoms_to_bond.length == 2) {
			$("#okPickedAtoms").prop("disabled", false);
		} else {
			$("#okPickedAtoms").prop("disabled", true);
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


/* Toolbar - Enable the pick two atoms to bond function. */
function enable_pick_bond() {
	pick_bond = true;
	$("#changeBOInfoRow").removeClass("hidden");
	$("#tooltipBOChange").removeClass("hidden");
	resizeCanvas();
	display_bond_to_change();
}

/* Toolbar - Disable the pick two atoms to bond function. */
function disable_pick_bond() {
	pick_bond = false;
	$("#changeBOInfoRow").addClass("hidden");
	resizeCanvas();
	if (bond_to_change) {
		// For all lines in the fabric_bond group, change stroke & strokeWidth
		var lines = bond_to_change.fabric_bond._objects;
		for (var i in lines) {
			if (lines[i].get('type') == "line") {
				lines[i].stroke = "black";
				lines[i].strokeWidth = 1.5;
			}
		}
		bond_to_change = null;
	}
	canvas.renderAll();
}


/* Toolbar - Display the bond the user wants to change. */
function display_bond_to_change() {
	if (!bond_to_change) {
		$("#tooltipBOChange").removeClass("hidden");
		$("#makeBOChange").addClass("hidden");
		$("#okChangeBO").prop("disabled", true);
	} else {
		$("#tooltipBOChange").addClass("hidden");
		$("#makeBOChange").removeClass("hidden");
		$("#currBO").html("<b>"+bond_to_change.order+"</b>");
		$("#okChangeBO").prop("disabled", false);
		
	}
}



/*======================= ATOM & BOND CLASSES ==============================*/

class Atom {
	constructor(element, x, y, id=atoms.length) {
		var self = this;
		
		this.element = element;
		this.id = id;
		this.neighbors = [];
		this.bonds = [];
		this.n_bonds = 0; // Total # bonds (accounting double & triple)
		this.n_H = 0;     // Number of H's bonded to the atom
		this.bond_dirs = {
			"right"  : 0,
			"left"   : 0,
			"top"    : 0,
			"bottom" : 0,
			"top-right"    : 0,
			"top-left"     : 0,
			"bottom-right" : 0,
			"bottom-left"  : 0
		}
		this.rel_left = x; // Relative to the center of fabric_group
		this.rel_top = y;
		this.abs_left = this.rel_left;
		this.abs_top = this.rel_top;
	    this.fabric_atom = new fabric.Text(this.element, {
			fontSize   : R * 1.5,
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
		// H atoms are smaller
		if (element == "H") {
			this.fabric_atom.fontSize = R;
		}
		// Create new row for getBond[][] lookup map
		getBond[this.id] = {};
		
		this.fabric_atom.on("mousedown", function(options){
			// In the case of picking two atoms to bond...
			if (pick_two) {
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
				return;
			}
			canvas.setActiveObject(this);
			canvas.renderAll();
			active_atom = self;
			self.get_properties();
		});
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
	constructor(atom1, atom2, bo, angle, id=bonds.length) {
		var self = this;
		this.atom1 = atom1;
		this.atom2 = atom2;
		this.order = bo;
		this.angle = angle;
		this.id = id;
		// Use helper function due to styling of different bondorders
		this.fabric_bond = this.create_fabric_bond();
		// Update getBond[][] lookup map
		getBond[atom1.id][atom2.id] = this;
		getBond[atom2.id][atom1.id] = this;
		
		// TODO: Click on the bond will trigger events
		this.fabric_bond.on("mousedown", function(options){
			
			// In the case of picking a bond to change...
			if (pick_bond) {
				if (bond_to_change) {
					var old_selection = bond_to_change;
					var lines = old_selection.fabric_bond._objects;
					for (var i in lines) {
						if (lines[i].get("type") == "line") {
							lines[i].stroke = "black";
							lines[i].strokeWidth = 1.5;
						}
					}
				}
				bond_to_change = self;
				var lines = this._objects;
				for (var i in lines) {
					if (lines[i].get("type") == "line") {
						lines[i].stroke = "#d3349e";
						lines[i].strokeWidth = 2;
					}
				}

				canvas.renderAll();
				display_bond_to_change();
				return;
			}
			
			canvas.setActiveObject(this);
			canvas.renderAll();
			
		});
	}
	
	create_fabric_bond() {
		// Center coords of the bond middle point
		// Use abs if atoms are already on the canvas
		// Use rel if atoms are to be added after the bonding
		var x  = (this.atom1.abs_left + this.atom2.abs_left) / 2;
		var y  = (this.atom1.abs_top  + this.atom2.abs_top)  / 2;
		// var x  = (this.atom1.rel_left + this.atom2.rel_left) / 2;
		// var y  = (this.atom1.rel_top  + this.atom2.rel_top)  / 2;
		
		// Draw it first horizontally, then rotate to the angle
		var dx = R * 0.75;
		var dis = Math.sqrt(
		          Math.pow((this.atom1.abs_left - this.atom2.abs_left), 2) +
			      Math.pow((this.atom1.abs_top  - this.atom2.abs_top), 2)
		          );
		var start_x = x - (dis/2 - dx);
		var end_x   = x + (dis/2 - dx);
		
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
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
		} else if (this.order == 2) {
			lines.addWithUpdate(new fabric.Line([start_x, y+3, end_x, y+3], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-3, end_x, y-3], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
		} else if (this.order == 3) {
			lines.addWithUpdate(new fabric.Line([start_x, y+5, end_x, y+5], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y, end_x, y], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-5, end_x, y-5], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
		} else if (this.order > 1) {
			lines.addWithUpdate(new fabric.Line([start_x, y+3, end_x, y+3], {
			    strokeDashArray: [3, 3],
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
			lines.addWithUpdate(new fabric.Line([start_x, y-3, end_x, y-3], {
			    stroke  : 'black',
				strokeWidth: 1.5
			}));
		}
		lines.addWithUpdate(new fabric.Rect({
		    left: start_x,
		    top: y-5,
		    fill: 'rgba(0,0,0,0)',
		    width: end_x - start_x,
		    height: 10
		}));
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


