<?php
    session_start();
    if ($_SESSION["usertype"] != 'citizen'){ 
      header("Location: /test/signup/form.php");
    }
    //echo "Logged in: ".$_SESSION['user_username'];
    require_once "db_connect.php";
?>


<!DOCTYPE html> 
<html> 
<link rel="stylesheet" href="style.css">




  <head>
    <title>Civilian</title>
  </head>

  <script src = "options.js"></script>

  <script>

    function showCategory(str) {
      if (str=="") {
        document.getElementById("txtHint").innerHTML="";
        return;
      }
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint").innerHTML = "";
          document.getElementById("categorytable").innerHTML = this.responseText;
        }
      }
      xmlhttp.open("GET","getcategory.php?q="+str,true);
      xmlhttp.send();
    }


    function requestProduct() {
      let product = document.getElementById("products").value;
      let value = document.getElementById("people").value;
      const str = "product="+product+"&value="+value;
      console.log(str);

      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint2").innerHTML = this.responseText;
          loadDemands();
        }
      }
      xmlhttp.open("GET","requestproduct.php?"+str,true);
      xmlhttp.send();
    }


    function loadDemands() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("demandtable").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "request_history.php", true);     // add button select number
      xhttp.send();
    }

    function showAnnouncements(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("ann_table").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "announcement_table.php", true);     // add button select number
      xhttp.send();
    }

    function showAnnouncementProducts(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("pr_ann").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "announcement_products.php", true);     // add button select number
      xhttp.send();
    }

    function donateProd(){
      let pr_ann = document.getElementById("pr_ann").value;
      let ann_value = document.getElementById("ann_value").value;
      const str = "pr_ann="+pr_ann+"&ann_value="+ann_value;
      console.log(str);
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("txtHint3").innerHTML = this.responseText;
        showDonations();
        }
      };
      xhttp.open("GET", "donate.php?"+str, true);     // add button select number
      xhttp.send();
    }


    function showDonations(){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("don_table").innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "donation_table.php", true);     // add button select number
      xhttp.send();
    }


    function deleteTask(str){
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("txtHint4").innerHTML = this.responseText;
        showDonations();
        }
      };
      xhttp.open("GET", "delete.php?q="+str, true);     // add button select number
      xhttp.send();
    }

  </script>

    <body> 
    <?php 
      echo "<h3 style='color: white; font-size:16px; margin-left: 440px;'>Welcome, ".$_SESSION['user_username']."!</h3>";
    ?>
    <div class='main'>
    <h3>Requesting a Product</h3>
    <h4>Select a category to check product availability. Request a product for each of your family members</h4>
      <div class = 'block'>
        Select Category:<br>
        <select name="categories" id="categories" onchange="showCategory(this.value)"></select><br><br>
        <table id="categorytable"></table><br>
        <div id="txtHint"><b>Category info will be listed here...</b></div>
      </div>
      <div class = 'block'>
        <div class = "autocomplete">
              Select Product:<br>
              <input class="search" type="text" name="products" id="products">
        </div>
        <br>
          Insert number of family members:<br>
          <input type="number" id="people"><br><br>
          <button type = "button" id="prbutton" onclick="requestProduct()">Submit</button><br>
          <div id="txtHint2"><b>Select product and number of people to be requested...</b></div>
      </div>
  </div>

    <div class = 'main'>
    <h3>Request History</h3>
    <h4>Check the status of your previous requests</h4>
      <div class='block'>
        <div id='button'>
          <table id = 'demandtable'>
          <script>loadDemands()</script>
          </table>
        </div>
      </div></div>

      <div class = 'main'>
      <h3>Announcements</h3>
    <h4>Check the announcements issued from the base</h4>
      <div class='block'>
          <table style="width:40%">
          <thead>
            <tr><th>Product Name</th><th>Requested Quantity</th></tr>
          </thead>
          <tbody id="ann_table">
            <script>showAnnouncements()</script>
          </tbody>
          </table>

          <br>
          Select Product:<br>
          <select id="pr_ann"></select>
          <script>showAnnouncementProducts()</script>
          <br><br>
          Product quantity to be donated:<br>
          <input type="number" id="ann_value"><br><br>
          <button type = "button" id="annbutton" onclick="donateProd()">Submit</button><br>

          <div id='txtHint3'><b>Select product to be donated...</b></div>
          <br>
          </div>
        </div>



      
    <div class = 'main'>
      <h3>Donation History</h3>
    <h4>Check the status of your donations. Feel free to cancel any that are still incomplete</h4>
      <div class='block'>
        <table>
          <thead>
            <tr><th>Product Name</th><th>Donation Submission Date</th><th>Donation Acceptance Date</th><th>Donation Completion Date</th>
            <th>Donation Status</th><th>Cancel</th></tr>
          </thead>
          <tbody id = "don_table">
            <script>showDonations()</script>
          </tbody>
          </table>
          <div id="txtHint4"><b>Select donation to be cancelled...</b></div>
  </div>
  </div>

        <br>

        <form style="text-align:center" action="logout_handler.php" method="post"> 
          <button class='logout'> Log Out</button>
        </form>


  </body>
</html>