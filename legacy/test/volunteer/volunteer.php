<?php
    session_start();
    if ($_SESSION["usertype"] != 'volunteer'){ 
		header("Location: /test/signup/form.php");
    }
    require_once "db_connect.php";
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Volunteer</title>
		
		<link rel = "stylesheet" href = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css"/>
		
		<script src = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
		<meta charset="UTF-8">
 		<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
		 <link rel="stylesheet" href="style.css">

</head>
		
<body>
	<?php 
      echo "<h3 style='color: white; font-size:16px; margin-left: 440px;'>Welcome, ".$_SESSION['user_username']."!</h3>";
    ?>
	<div class="main">
		<div><b>Check up on Citizen Demands. Drag and drop your Vehicle to change location. Click on a demand to accept it.</b></div><br>
		<table class='map_table'><tr><td>Base Location <img src=purple_marker.png style="width:12px"></img></td>
		<td>Your Location <img src=green_marker.png style="width:12px"></img></td>
		<td>Accepted Requests <img src=red_marker.png style="width:12px"></img></td></tr>
		<tr><td>Accepted Offers <img src=dark_blue_marker.png style="width:12px"></img></td>
		<td>Pending Requests <img src=orange_marker.png style="width:12px"></img></td>
		<td>Pending Offers <img src=blue_marker.png style="width:12px"></img></td></tr></table>
		<br>
		<div class='block'>
		<div class="container">
		<font color='purple'> Base: </font> <input type="checkbox" id="baseSwitch" onclick="switchBase()"
						class="checkbox" />
			<label for="switch" class="toggle">
				<!--User: <input type="checkbox" id="UserSwitch" onclick="switchUser()"
						class="checkbox" />
				<label for="switch" class="toggle">-->
		<font color='green'>User: </font> <input type="checkbox" id="switch3" onclick="functionUser()"
						class="checkbox" />
			<label for="switch" class="toggle">
				<font color='orange'>Accepted Requests: </font> <input type="checkbox" id="AccReq" onclick="switchAccReq()"
						class="checkbox" />
		<font color='LightBlue'>Accepted Offers: </font> <input type="checkbox" id="AccOff" onclick="switchAccOff()"
						class="checkbox" />
		<font color='orange'>Pending Requests: </font> <input type="checkbox" id="PendReq" onclick="switchPendReq()"
						class="checkbox" />
		<font color='LightBlue'>Pending Offers: </font> <input type="checkbox" id="PendOff" onclick="switchPendOff()"
						class="checkbox" />
		<font color='red'>Lines: </font> <input type="checkbox" id="Lines" onclick="switchLines()"
						class="checkbox" />
	
				<p>    </p> 
				</label>
			</div>
		<div id = "map" style = "width: 900px; height: 580px"></div>
		</div>
	</div>
		
		
		<div class='main'>
			<h4>Load Items from Base and Unload anything you don't need. The load of your Vehicle is seen below.</h4>
			<div class='block'>
			<table id="myTable" style='width:60%;'>
			<thead>
					<th></th>
					<th style="display:none;">ID</th>
					<th>Product Name</th>
					<th>Quantity Available in Base</th>
					<th></th>
			</thead>
			</table><br>
	
			<button type="button" onclick='Load()'>Load</button> 
			<button style='margin-left:5px;' type="button" onclick='Unload()'>Unload</button>
			</div>
			<div class='block'>
			<table style='width:40%;'>
				<thead>
						<th>Product Name</th>
						<th>Quantity inside Vehicle</th>
				</thead>
				<tbody id="vehLoad"></tbody>
			</table>
			</div>
		</div>
		<script src=volunteermapoptions.js></script>

		<div class="tasks-holder">
			<!-- Add tasks here -->
		</div>

		<br>
		
		<form style="text-align:center" action="logout_handler.php" method="post"> 
			<button class='logout'> Log Out</button>
		</form>





  <script>
	loadTasksPanel();
	vehLoad();
	
	function vehLoad(){
		var xhttp = new XMLHttpRequest();
      	xhttp.onreadystatechange = function() {
      	if (this.readyState == 4 && this.status == 200) {
        	document.getElementById("vehLoad").innerHTML = this.responseText;
        }
      	};
      	xhttp.open("GET", "vehLoad.php", true);     // add button select number
      	xhttp.send();
	}


	function loadTasksPanel(){
		var tasksBody = document.getElementsByClassName("tasks-holder");
		tasksBody = tasksBody[0];
		tasksBody.innerHTML = '';
		const tasksTitle = document.createElement('tasksTitle');
		var newPlot = '<h1>Tasks Panel</h1>';
		tasksTitle.innerHTML = newPlot;
		tasksBody.appendChild(tasksTitle);
		$.ajax({
					type: "POST",
					url: "tasks_panel.php",
					crossDomain: true,
					success: function2,
					error: function(error) {console.error('Error fetching data:', error);},
					dataType: "json"
		});
	}
				
	function function2(data){
			var tasksBody = document.getElementsByClassName("tasks-holder");
			tasksBody = tasksBody[0];
			
			for (var i = 0; i < data.length; i++) {
				var newPlot = '<div class="task-block"><div class="task-content'+ i +
				'">Name: '+ data[i]['cit_name']+
				'<br>Last Name: '+ data[i]['cit_laname']+
				'<br>Phone Number: '+ data[i]['cit_number']+
				'<br>Task Submission Date: '+ data[i]['task_submission_date']+
				'<br>Product: '+ data[i]['pr_name']+
				'<br>Product Size: '+ data[i]['sum']+
				'<br><button resID="' + data[i]['task_id'] + '"onclick="funComplete(this)">Complete</button>' +
				'<button resID="' + data[i]['task_id'] + '"onclick="funCancel(this)">Cancel</button><br><br><div id="result'+data[i]['task_id']+'"></div>' +
				'</div></div>';
				
				const task = document.createElement('task');
				task.innerHTML = newPlot;
				tasksBody.appendChild(task);
            }
	}
		function funCancel(button) {
			var task_id = button.getAttribute('resID');
			$.ajax({
				type: "POST",
				data: {task_id: task_id},
				url: "cancelTaskButton.php",
				crossDomain: true,
				success: function(){
					loadTasksPanel();
				},
				error: function(error) {console.error('Error fetching data:', error);},
				dataType: "json"
			});
				
		}
		function funComplete(button) {
			var task_id = button.getAttribute('resID');
				
				TaskDistanceCheck(task_id).then(
					function(value) {
						if (value == true) {
							$.ajax({
								type: "POST",
								data: {task_id: task_id},
								url: "completeTaskButton.php",
								crossDomain: true,
								success: function(){
									loadTasksPanel();
									vehLoad();
								},
								error: function(error) {console.error('Error fetching data:', error);},
								dataType: "json"
							});
						} else {
							document.getElementById('result'+task_id).innerText = 'Unable to complete task.';
						}
			});
		}
			
	function haversine(lat1, lon1, lat2, lon2) {
				const R = 6371e3;  // radius of Earth in meters
				const phi1 = lat1 * Math.PI / 180;
				const phi2 = lat2 * Math.PI / 180;
				const delta_phi = (lat2 - lat1) * Math.PI / 180;
				const delta_lambda = (lon2 - lon1) * Math.PI / 180;
	
				const a = Math.sin(delta_phi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda / 2) ** 2;
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				console.info(R * c);
				return R * c;
			}

	async function TaskDistanceCheck(task_id){
				console.log(task_id)
				var lat1,lat2,lng1,lng2;
				let response = await $.ajax({
					type: "POST",
					data: {task_id: task_id},
					url: "volunteer_task.php",
					crossDomain: true,
					success: function (data) {
						lat1 = data['volunteer'][0]['vol_lat'];
						lng1 = data['volunteer'][0]['vol_long'];
						lat2 = data['task'][0]['cit_lat'];
						lng2 = data['task'][0]['cit_long'];
						console.log(lat1)
						console.log(lng1)
						console.log(lat2)
						console.log(lng2)
					},
					error: error,
					dataType: "json"
				});
				if(haversine(lat1,lng1,lat2,lng2) <=50){ return true; }
				else return false;
	}
	function error(error){console.info(error);}
  // volunteer.vol_name,volunteer.vol_lname, volunteer.vol_num,task.task_submission_date,product.pr_name, sum
	</script>

	</body>
</html>
