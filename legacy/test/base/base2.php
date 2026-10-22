<?php
    session_start();
    if ($_SESSION["usertype"] != 'admin' || $_SESSION["usertype"] == NULL){ 
      //die("Not Authorized to Access this File.");
      header("Location: /test/signup/form.php");
    }
    require_once "json_creator.php";
?>


<!DOCTYPE html> 
<html>
<title>Base</title>
<link rel = "stylesheet" href = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css"/>
<script src = "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"> </script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<link rel="stylesheet" href="style2.css">
<script src = "filter_options.js"></script>

<script>
  
    showFilters();

    function viewBaseAnalysis() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("baseanalysis").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "viewBaseAnalysis.php", true);     // add button select number
      xhttp.send();
    }

    function filter(str) {
      //console.log(str)
      var t = document.getElementById("baseanalysis");
      var trs = t.getElementsByTagName("tr");
      var checkBox = document.getElementById(str);

      var tds = null;
      for (var i=0; i<trs.length; i++)
      {
          tds = trs[i].getElementsByTagName("td");
          if(str == tds[2].innerHTML){
            console.log(tds[2].innerHTML)
            // If the checkbox is checked, display the output text
            if (checkBox.checked == true){
              trs[i].style.display = "table-row";
            } else {
              trs[i].style.display = "none";
            }
          }
          if(str == "ALL"){
            if (checkBox.checked == true){
              trs[i].style.display = "table-row";
            } else {
              trs[i].style.display = "none";
            }
          }
      }
    }

    function taskDate(str)
    {
      var date = new Date();

      console.log(date) 
      if(str=='day'){
        date.setDate(date.getDate() - 1)
        console.log(date) }
      else if(str=='week'){
        date.setDate(date.getDate() - 7)
        console.log(date) }
      else if(str=='month'){
        date.setMonth(date.getMonth() - 1)
        console.log(date) }
      else if(str=='6month'){
        date.setMonth(date.getMonth() - 6)
        console.log(date) }
      else if(str=='year'){
        date.setFullYear(2023)
        console.log(date)}

      var dateDisplay = date.toISOString().slice(0, 19).replace('T', ' ');
      loadTask(dateDisplay)
    }

    function loadTask(dateDisplay){
      console.log(dateDisplay)
        $.ajax({
            type: "POST",
            url: "statistics.php",
            data: {dateDisplay},
            crossDomain: true,
            success: drawChart,
            error: error,
            dataType: "json"
          });
        }

    function error(data){
					alert("Error getting datas from DB");
					console.log("Error getting datas from DB");
					console.log(data);

				}


    function drawChart(data) {
      data1 = data[0]['count']
      data2 = data[1]['count']
      data3 = data[2]['count']
      data4 = data[3]['count']
      yValues = [data1, data2, data3, data4]
      xValues = ['Completed Requests','Incomplete Requests','Incomplete Donations','Completed Donations']

      // Set Data
      // const statistics = google.visualization.arrayToDataTable([
      //   ['Contry', 'Mhl'],
      //   ['Completed Requests', data['tasks'][0]['count']],
      //   ['Incomplete Requests', data['tasks'][1]['count']],
      //   ['Incomplete Donations', data['tasks'][2]['count']],
      //   ['Completed Donations', data['tasks'][3]['count']]
      // ]);
      
      var barColors = [
        "red",
        "blue",
        "green",
        "yellow",
      ];

      new Chart("myChart", {
        type: "pie",
        data: {
          labels: xValues,
          datasets: [{
            backgroundColor: barColors,
            data: yValues
          }]
        },
        options: {
          title: {
            display: true,
            text: "Tasks"
          }
        }
      });

    }
    
    function base1() {
      window.open("base1.php",true);
    }
    function base2() {
      window.open("base2.php",true);
    }
    function base3() {
      window.open("base3.php",true);
    }
</script>


<body>
    <br>
    <div class="btn-group">
      <button onclick="base1()">Base Items and Announcements</button>
      <button onclick="base2()">Map and Item Overview</button>
      <button onclick="base3()">Volunteer Account Management</button>
    </div>

    <?php 
      echo "<h3 style='color: white; font-size:16px; margin-left: 440px;'>Welcome, ".$_SESSION['user_username']."!</h3>";
  ?>
    <div class="main">
      <div><b>Check up on Citizen Demands and Vehicle locations. Drag and drop Base to change location. Click on markers to view details.</b></div><br>
      <table class='map_table'><tr><td>Base Location <img src=purple_marker.png style="width:12px"></img></td>
      <td>Vehicle Locations <img src=green_marker.png style="width:12px"></img></td>
      <td>Accepted Requests <img src=red_marker.png style="width:12px"></img></td></tr>
      <tr><td>Accepted Offers <img src=dark_blue_marker.png style="width:12px"></img></td>
      <td>Pending Requests <img src=orange_marker.png style="width:12px"></img></td>
      <td>Pending Offers <img src=blue_marker.png style="width:12px"></img></td></tr></table>
      <br>
      <div class="block">
      <div class="container">
      <font color='purple'> Base: </font> <input type="checkbox" id="baseSwitch" onclick="switchBase()"
                      class="checkbox" />
        <label for="switch" class="toggle">
        <!--User: <input type="checkbox" id="UserSwitch" onclick="switchUser()"
                      class="checkbox" />
        <label for="switch" class="toggle">-->
        <font color='Blue'> Vehicles: </font> <input type="checkbox" id="VehSwitch" onclick="switchVehicles()"
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


		<script src = mapoptions.js></script>

    <div class="main">
      <div class="block">
      <div><b> Check up on the status of every product inside the Base or inside a Vehicle. Use filters to show only certain categories</b></div><br>
      <div id='filter_buttons'></div>
        <table>
        <thead><tr><td>Product Name</td><td style='display:none;'></td><td>Category</td><td>Base Quantity</td><td>Current Location</td><td>Vehicle Volunteer</td></tr></thead>
        <tbody id ="baseanalysis">
        <script>viewBaseAnalysis()</script>
        <tbody id = "baseanalysis">
        </table><br>
      </div>
    </div>

    <div class="main">
      <div><b>Service Statistics</b></div>
      <div class="block">
          Check statistics for specific time periods:
          <select name="period" id="period" onchange="taskDate(this.value)">
          <option value="" selected disabled hidden>Choose here</option>
          <option value="day">Last Day</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="6month">Last 6 Months</option>
          <option value="year">Last Year</option>
          </select>

      <div style="margin-left:200px; margin-bottom:10px">
        <canvas id="myChart" style="width:100%; max-width:400px; height:400px;"></canvas>
      </div>
      </div>
  </div>

    <form style="text-align:center;" action="logout_handler.php" method="post"> 
      <button class="logout"> Log Out</button>
    </form>

    </body>
</html>