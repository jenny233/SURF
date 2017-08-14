<?php
$servername = "127.0.0.1";
$username = "root";
$password = "SURF2017";
$db = "molecules";

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// sql to create table
$sql = "CREATE TABLE st (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
email VARCHAR(50),
reg_date TIMESTAMP
)";


echo "YAYY";

$handle = @fopen("data.txt", "r");

while (!feof($handle)) // Loop til end of file.
{
$buffer = fgets($handle, 4096);
 // Read a line.
list($a,$b,$c)=explode("|",$buffer);
//Separate string by the means of |
echo $a."-".$b."-".$c."<br>";
$sql = "INSERT INTO data_table (iddata, name, age) VALUES('".$a."','".$b."',".$c.")";   
mysql_query($sql,$conn) or die(mysql_error());
}


$conn->close();

?>