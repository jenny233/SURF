<?php

// Global variable, an array for all the structures in the file.
$molecules = array();
$func_groups = array();

/* Load structures from file to the global $molecules array. */
function load_molecules($filepath) {
	/*
	 * $molecules is an array of molecule structures, with formulas as the keys
	 *
	 * Every molecule has its own $structure dictionary.
	 * $structure has the following keys:
	 *         "common_name"    common name         water
	 *         "formula"        molecular formula   H2O
	 *         "pubchem_cid"    CID at PubChem      1234
	 *         "format"         full/2d/3d          3d
	 *         "n_atoms"        number of atoms     3
	 *         "n_bonds"        number of bonds     2
	 *         "atoms"          array of atoms      [...]
	 * Every atom occupies one spot in "atoms". Its index is its id in the molecule.
	 * "atoms" is a simple array of $atom_info dictionaries.
	 *         $structure["atoms"][0]: atom info for C (e.g.)
	 * $atom_info contains the info for each atom in the molecule.
	 *         "element"        element name
	 *         "x_2d"           2d coords
	 *         "y_2d"           ..
	 *         "x_3d"           3d coords
	 *         "y_3d"           ..
	 *         "z_3d"           ..
	 *         "neighbors"      an array of neighbors by index in $structure
	 *         "bos"            an array of bond orders of each neighbor
	 * "neighbors" is a simple array of ints (atom index)
	 * "bos" is a simple array of ints (bond order)
	 * The indices of neighbors & bonds are arbitrary.
	 */
	
	global $molecules;
	
	$handle = fopen($filepath, "r");
	ini_set("auto_detect_line_endings", true);
	
	
	while (!feof($handle)) // Loop till end of file.
	{
		
		$line = fgets($handle);
		
		// list($common_name, $formula, $pubchem_cid, $format, $n_atoms, $n_bonds, $data) = explode("|", $line);
		
		// An array that holds all segments separated by "|"
		$mol_buf = explode("|", $line);
		
		$structure = array(
		    "common_name" => $mol_buf[0],
		    "formula"     => $mol_buf[1],
			"pubchem_cid" => $mol_buf[2],
			"format"      => $mol_buf[3],
			"n_atoms"     => $mol_buf[4],
			"n_bonds"     => $mol_buf[5]
		);
		
		
		// An array for all the atoms in the molecule, matching name with id
		$structure["atoms"] = array();
		
		for ($i = 0; $i < $structure["n_atoms"]; $i++) {
			// The line for one atom looks like this:
			// element|coord1|coord2|...|coordn,neighbor1-bo,neighbor2-bo,...
			
			// A dictionary to store all info of one atom
			$atom_info = array();
			
			if ($structure["format"] == "full") {
				
				// Element and coordinates
			    list(
				$atom_info["element"], 
				$atom_info["x_2d"], 
				$atom_info["y_2d"], 
				$atom_info["x_3d"], 
				$atom_info["y_3d"], 
				$z_3d_bonding                            // separate var
					) = explode(" ", $mol_buf[$i + 6]);
				
				// Separate last coordinate from the bonding info
				// Now z_3d_bonding becomes an array
				$z_3d_bonding = explode(",", $z_3d_bonding);
				// Get z_3d coordinate
				$atom_info["z_3d"] = $z_3d_bonding[0];
				// Use 2 arrays to store all neighbors & their bo
				$atom_info["neighbors"] = array();
				$atom_info["bos"] = array();
				for ($b = 1; $b < count($z_3d_bonding); $b++) {
					list($neighbor, $bo) = explode("-", $z_3d_bonding[$b]);
					$atom_info["neighbors"][] = $neighbor;
					$atom_info["bos"][] = $bo;
				}
				
				
				
				
				// echo count($atom_info["neighbors"]);
				// if (count($atom_info["neighbors"]) > 1) {
				// 	echo $structure["common_name"]." ".$atom_info["element"]."<br>";
				// }
				
				
				
				
				
			} elseif ($structure["format"] == "2d") {
				
			    list(
				$atom_info["element"], 
				$atom_info["x_2d"],
				$y_2d_bonding
					) = explode(" ", $mol_buf[$i + 6]);
				
				// Separate last coordinate from the bonding info
				// Now y_2d_bonding becomes an array
				$y_2d_bonding = explode(",", $y_2d_bonding);
				// Get y_2d coordinate
				$atom_info["y_2d"] = $y_2d_bonding[0];
				// Use 2 arrays to store all neighbors & their bo
				$atom_info["neighbors"] = array();
				$atom_info["bos"] = array();
				for ($b = 1; $b < count($y_2d_bonding); $b++) {
					list($neighbor, $bo) = explode("-", $y_2d_bonding[$b]);
					$atom_info["neighbors"][] = $neighbor;
					$atom_info["bos"][] = $bo;
				}
				
				
				
				
				
				// echo count($atom_info["neighbors"]);
				// if (count($atom_info["neighbors"]) > 1) {
				// 	echo $structure["common_name"]." ".$atom_info["element"]."<br>";
				// }
				
				
				
				
				
				
			} elseif ($structure["format"] == "3d") {
				
			    list(
				$atom_info["element"], 
				$atom_info["x_3d"], 
				$atom_info["y_3d"], 
				$z_3d_bonding
					) = explode(" ", $mol_buf[$i + 6]);
				
				// Separate last coordinate from the bonding info
				// Now z_3d_bonding becomes an array
				$z_3d_bonding = explode(",", $z_3d_bonding);
				// Get z_3d coordinate
				$atom_info["z_3d"] = $z_3d_bonding[0];
				// Use 2 arrays to store all neighbors & their bo
				$atom_info["neighbors"] = array();
				$atom_info["bos"] = array();
				for ($b = 1; $b < count($z_3d_bonding); $b++) {
					list($neighbor, $bo) = explode("-", $z_3d_bonding[$b]);
					$atom_info["neighbors"][] = $neighbor;
					$atom_info["bos"][] = $bo;
				}
				
				
				
				
				// echo count($atom_info["neighbors"]);
			
				// if (count($atom_info["neighbors"]) > 1) {
				// 	echo $structure["common_name"]." ".$atom_info["element"]."<br>";
				// }
				
				
				
				
				
				
			} else {
				
			}
			
			// Add this atom to atoms list to keep track of bondings among atoms
			$structure["atoms"][] = $atom_info;
			
		}
		// Add this structure to the list of molecule structures.
		$molecules[$structure["formula"]] = $structure;
		// echo count($molecules);
		// Testing
		// vardump($structure);
		// echo $structure["common_name"]."<br>";
		// echo $structure["formula"]."<br>";
		// echo $structure["pubchem_cid"]."<br>";
		// echo $structure["format"]."<br>";
		// echo $structure["n_atoms"]."<br>";
		// echo $structure["n_bonds"]."<br>"."<br>";
		// for ($x = 0; $x < $structure["n_atoms"]; $x++) {
		// 	$a = $structure["atoms"][$x];
		// 	echo $a["element"]."<br>";
		// 	echo $a["x_2d"]." ";
		// 	echo $a["y_2d"]."<br>";
		// 	echo $a["x_3d"]." ";
		// 	echo $a["y_3d"]." ";
		// 	echo $a["z_3d"]."<br>";
		// 	for ($y = 0; $y < count($a["neighbors"]); $y++) {
		// 		$neighbor_id = $a["neighbors"][$y];
		// 		echo $structure["atoms"][$neighbor_id]["element"]." ";
		// 		echo $a["bos"][$y]."<br>";
		// 	}
		// 	echo "<br>"."<br>";
		// }
		
	}
	fclose($handle);
	
}

/* Load structures to the func_groups array. */
function load_func_groups($filepath) {
	/*
	 * $func_groups is an array of functional group structures, with formulas as the keys
	 *
	 * Every molecule has its own $structure dictionary.
	 * $structure has the following keys:
	 *         "common_name"    common name         water
	 *         "formula"        molecular formula   H2O
	 *         "n_atoms"        number of atoms     3
	 *         "atoms"          array of atoms      [...]
	 * Every atom occupies one spot in "atoms". Its index is its id in the molecule.
	 * "atoms" is a simple array of $atom_info dictionaries.
	 *         $structure["atoms"][0]: atom info for C (e.g.)
	 * $atom_info contains the info for each atom in the molecule.
	 *         "element"        element name
	 *         "neighbors"      an array of neighbors by index in $structure
	 *         "bos"            an array of bond orders of each neighbor
	 * "neighbors" is a simple array of ints (atom index)
	 * "bos" is a simple array of ints (bond order)
	 * The indices of neighbors & bonds are arbitrary.
	 */
	
	global $func_groups;
	
	$handle = fopen($filepath, "r");
	ini_set("auto_detect_line_endings", true);
	
	
	while (!feof($handle)) // Loop till end of file.
	{
		
		$line = fgets($handle);
		
		// An array that holds all segments separated by "|"
		$func_buf = explode("|", $line);
		
		$structure = array(
		    "group_name"  => $func_buf[0],
			"class"       => $func_buf[1],
		    "formula"     => $func_buf[2],
			"n_atoms"     => $func_buf[3]
		);
		
		// An array for all the atoms in the molecule, matching name with id
		$structure["atoms"] = array();
		
		for ($i = 0; $i < $structure["n_atoms"]; $i++) {
			// The line for one atom looks like this:
			// element|coord1|coord2|...|coordn,neighbor1-bo,neighbor2-bo,...
			
			// A dictionary to store all info of one atom
			$atom_info = array();
			
			// Element and coordinates
		    list(
			$atom_info["element"],
			$bonding                            // separate var
				) = explode(" ", $func_buf[$i + 4]);
			$bonding = explode(",", $bonding);
			
			// Use 2 arrays to store all neighbors & their bo
			$atom_info["neighbors"] = array();
			$atom_info["bos"] = array();
			for ($b = 0; $b < count($bonding); $b++) {
				list($neighbor, $bo) = explode("-", $bonding[$b]);
				$atom_info["neighbors"][] = $neighbor;
				$atom_info["bos"][] = $bo;
			}
			
			// Add this atom to atoms list to keep track of bondings among atoms
			$structure["atoms"][] = $atom_info;
		}
		// Add this structure to the list of functional group structures.
		$func_groups[$structure["group_name"]] = $structure;
	}
}

if (isset($_GET["is_load_molecules"])) {

	load_molecules("collection-molecules.txt");
	load_molecules("other-molecules.txt");
	echo json_encode($molecules);
}

if (isset($_GET["is_load_func_group"])) {
	load_func_groups("functional_groups.txt");
	echo json_encode($func_groups);
}


if (isset($_GET["is_get_structure"])) {
	list($formula, $common_name) = explode(" -- ", $_GET["text"]);
	// echo $formula;
	echo json_encode($molecules[$formula]);
}

 

?>