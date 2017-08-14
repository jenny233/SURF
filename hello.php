<?php
date_default_timezone_set('UTC');
$day = date('l');
?>
<!doctype html>
<html>
	<head>
		<title>Hello World</title>
		<link rel="stylesheet" type="text/css" href="hello.css"/>
		<link rel="stylesheet" 
		href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" 
		integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" 
		crossorigin="anonymous">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,700' 
		rel='stylesheet' type='text/css'>
		<script 
		src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<script src="fabric.min.js"></script>
		<script src="app.js"></script>
	</head>

	<body>
		
		<header class="container">
			<!-- <div class="row">
				<div class="col-sm-4">
					<button class='btn' id='ajaxbtn'>Test ajax</button>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-12">
					<p id="data"></p>
				</div>
			</div> -->
			
			<div class="row">
				<div class="col-sm-4">
					<?php echo "Hello World"; ?>
				</div>
				<div class="col-sm-6">
					<p>
						Today is <?php echo $day; ?>
					</p>
				</div>
			</div>
			
		</header>
		
		<div class="container">

			
			<div class="row">
				<div class="col-sm-2">
					<button class='btn' id='togglebtn'>Toggle</button>
				</div>
				
				<div class="col-sm-2">
					<button class='btn' id='H1'>Create an H</button>
				</div>
				
				<div class="col-sm-2">
					<button class='btn' id='H2'>Create another H</button>
				</div>
				
				<div class="col-sm-2">
					<button class='btn' id='bond'>Bond!</button>
				</div>
			</div>

			<div class="row">
				<canvas id="canvas" width="640" height="200"></canvas>
				<script>

					var fabric_canvas = new fabric.Canvas('canvas');
					//
					// fabric.Object.prototype.originX = true;
					// fabric.Object.prototype.originY = true;
					//
					// var fabric_molecule = new fabric.Group({subTargetCheck: true});
					// // fabric_molecule.center();
					// fabric_canvas.add(fabric_molecule);
					// console.log("fabric_molecule:");
					// console.log(fabric_molecule.get('left'), fabric_molecule.get('top'));
				</script>
			</div>
			
			<div class="row">
				<div class="col-sm-12" id='properties_bar'>
				</div>
			</div>
			
			<div class="row">
				<div class="col-sm-12" id='properties'>
				</div>
			</div>

		</div>

	</body>
</html>
