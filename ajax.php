<?php
$servername = "localhost";
$username = "root";
$password = "surf2017";
$db = "molecules";

// Create connection
$conn = new mysqli($servername, $username, $password, $db);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Table names
$PRIMARY_TB = "primary_factor";
$SECONDARY_TB = "secondary_factor";

// Adjustment for aromatic rings
$l_0 = -0.0029;


/* Function: get factor from database
 * Parameter: Atom1, Atom2, bond order, primary/secondary table
 * Return: Factor
 */
function get_factor($Atom1, $Atom2, $BondOrder, $tb_name) {
	
	global $conn;
	global $PRIMARY_TB;
	
	// Check if all the parameters are valid
	if (!$Atom1) {
		die("Atom 1 is not specified.");
	} elseif (!$Atom2) {
		die("Atom 2 is not specified.");
	} elseif (!$BondOrder) {
		die("Bond order is not specified.");
	}

	$query_str = "SELECT Factor FROM $tb_name ".
	             "WHERE (Atom1='$Atom1' AND Atom2='$Atom2')".
	             "AND BondOrder=$BondOrder";
	$result = $conn->query($query_str);
	
	
	// Everything is ok
	if ($result->num_rows == 1) {
		$row = $result->fetch_assoc();
		return $row['Factor'];
	}
	
	// There is something wrong
	if ($BondOrder == 1) {
		$boName = "single";
	} elseif ($BondOrder == 2) {
		$boName = "double";
	} elseif ($BondOrder == 3) {
		$boName = "tripple";
	} else {
		$boName = $BondOrder;
	}

	// If such bond DNE, print error
	if($result->num_rows == 0) {
		if ($tb_name == $PRIMARY_TB) {
			die("The $Atom1-$Atom2 $boName bond does not exist in the database.");
		} else {
			return 0;
		}
	}
	
	// If there are multiple entries
	if ($result->num_rows > 1) {
		die("There are multiple entries in the database of the $Atom1-$Atom2 $boName bond.");
	}
	
}



/*
 * For all of the associative arrays passed through $_GET
 *   if (Proximity == 1) 
 *     get_factor($Atom1, $Atom2, $BondOrder, $primary_tb);
 *     get_factor($Atom1, $Atom2, $BondOrder, $secondary_tb);
 *     primary - secondary is the number.
 *   else
 *     get_factor($Atom1, $Atom2, $BondOrder, $secondary_tb);
 *
 * Add everything together, and that is the answer.
 */
function process_factor_query($is_aromatic_ring) {
	
	global $PRIMARY_TB, $SECONDARY_TB, $l_0;
	
	$bonds = json_decode($_GET['json_query'], true);
	$sum = 0;
	foreach ($bonds as $bond) {
		// $bond has keys: Atom1, Atom2, BondOrder, Proximity
		if ($bond["Proximity"] == 1) {
			$f = get_factor($bond["Atom1"], $bond["Atom2"], $bond["BondOrder"], $PRIMARY_TB);
			$l_char = "<i>L</i>";
		} elseif ($bond["Proximity"] == 2) {
			$f = get_factor($bond["Atom1"], $bond["Atom2"], $bond["BondOrder"], $SECONDARY_TB);
			$l_char = "<i>l</i>";
		}
		$sum += $f;
		if ($bond["BondOrder"] == 1) {
			$bond_char = "-";
		} elseif ($bond["BondOrder"] == 2) {
			$bond_char = "=";
		} elseif ($bond["BondOrder"] == 3) {
			$bond_char = "&equiv;";
		}
		echo "<p>".$l_char."<sub>".$bond["Atom1"].$bond_char.$bond["Atom2"]."</sub> = ".$f."</p>";
	}
	if ($is_aromatic_ring) {
		$sum += $l_0;
		echo "<p>l<sub>0</sub> = ".$l_0."</p>";
	}
	echo "<h4>&beta; = ".($sum+1)."</h4>";
}



if (isset($_GET['is_factor_query'])) {
	process_factor_query($_GET['is_aromatic_ring']);
}

$conn->close();


?>