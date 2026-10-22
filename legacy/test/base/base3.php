<?php
    session_start();
    if ($_SESSION["usertype"] != 'admin' || $_SESSION["usertype"] == NULL){ 
      header("Location: /test/signup/form.php");
    }
    require_once "json_creator.php";
?>


<!DOCTYPE html> 
<html>
<title>Base</title>
<link rel="stylesheet" href="style3.css">

<script src = "base_options.js"></script>

<script>
    function addVolunteer() {
      let username=document.getElementById("username").value;
      let pass=document.getElementById("pass").value;
      let volname=document.getElementById("volname").value;
      let vollname=document.getElementById("vollname").value;
      let vollong=document.getElementById("vollong").value;
      let vollat=document.getElementById("vollat").value;
      let volnum=document.getElementById("volnum").value;
      const str = "username="+username+"&pass="+pass+"&volname="+volname+"&vollname="+vollname+"&vollong="+vollong+"&vollat="+vollat+"&volnum="+volnum;
      console.log(str)
      var xmlhttp=new XMLHttpRequest();
      xmlhttp.onreadystatechange=function() {
        if (this.readyState==4 && this.status==200) {
          document.getElementById("txtHint4").innerHTML = this.responseText;
        }
      }
      xmlhttp.open("GET","newvolunteer.php?"+str,true);
      xmlhttp.send();
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
    <div class = "btn-group">
      <button onclick="base1()">Base Items and Announcements</button>
      <button onclick="base2()">Map and Item Overview</button>
      <button onclick="base3()">Volunteer Account Management</button>
    </div>

    <?php 
      echo "<h3 style='color: white; font-size:16px; margin-left: 440px;'>Welcome, ".$_SESSION['user_username']."!</h3>";
  ?>
    <div class = "main">
    <div class = "block">
    <div><b>Create New Volunteer Account</b></div> 
          <br>
          <input type="text" placeholder="Enter Username" id='username'>
          <input type="password" placeholder="Enter Password" id='pass'><br>     
          <input type="text" placeholder="Enter Volunteer Name" id='volname'>
          <input type='text' placeholder="Enter Volunteer Surname" id='vollname'><br>
          <input type='text' placeholder="Enter Volunteer Longtitude" name='citlong' id='vollong'>
          <input type='text' placeholder="Enter Volunteer Latitude" name='citlat' id='vollat'><br>
          <input type='text' placeholder="Enter Volunteer Phone Number" id='volnum'>
          <button type="reset" class="signup" onclick = "addVolunteer()">Sign Up</button>
          <div id="txtHint4"><b></b></div>  
  </div></div>

    <form style="text-align:center;" action="logout_handler.php" method="post"> 
      <button class="logout"> Log Out</button>
    </form>

</body>
</html>


