<?php
require_once 'config_session.php';
require_once 'login_view.php';
require_once 'signup_view.php';
?>

<!DOCTYPE html> 
<html> 

<head>
<meta name="viewport" content="width=device-width, initial-scale=1">

<title> Log In/Sign Up </title>
<link rel="stylesheet" href="style1.css">
<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
</head>  



<body>  

    <div class="wrapper">
    <center><h2> 
        <?php
            output_user();
        ?>
    </h2></center>
   
    <form action="login_handler.php" method="post">
	<center> <h1> Log In </h1> </center> 
        <div class="input-box">
            <input type="text" placeholder="Enter Username" name="username">
			<i class='bx bxs-user-circle'></i>
		</div>
		 <div class="input-box"> 
            <input type="password" placeholder="Enter Password" name="pwd">
			<i class='bx bxs-lock-alt' ></i>
		</div> 
	  <button type="submit"  class="btn"><strong>Login </strong></button>
    </form>   
	
    <?php
        check_login_errors();
    ?>

    <script>
    // Check if geolocation is supported by the browser
    if ("geolocation" in navigator) {
    // Prompt user for permission to access their location
    navigator.geolocation.watchPosition(
        // Success callback function
        function(position) {
        // Get the user's latitude and longitude coordinates
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Update the map with the user's new location
        console.log(`Latitude: ${lat}, longitude: ${lng}`);
        document.getElementById("citlong").value = lng;
        document.getElementById("citlat").value = lat;
        },
        // Error callback function
        function(error) {
        // Handle errors, e.g. user denied location sharing permissions
        console.error("Error getting user location:", error);
        }
    );
    } else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
    }
    </script>

    <center> <h3> Want to create new account? </h3> </center> 
    <center> <h1> Sign Up </h1> </center> 
    <form action="signup_handler.php" method="post">
        <div class="input-box"> 
            
            <input type="text" placeholder="Enter Username" name="username">
            
            <input type="password" placeholder="Enter Password" name="pwd">
            
			<input type="text" placeholder="Enter Citizen Name" name='citname'>
            
            <input type='text' placeholder="Enter Citizen Lastname" name='citlname'>
            
            <input type='hidden' name='citlong' id='citlong'>
            <input type='hidden' name='citlat' id='citlat'>
            <input type='text'placeholder="Enter Telephone Number" name='citnum'>
            <button type="submit" class="btn"><strong>Sign Up </strong></button> 
        </div> 
    </form>   


<?php
        check_signup_errors();
    ?>
   
<center> <h1> Log Out </h1> </center>
    <form action="logout_handler.php" method="post"> 
	     <div class="input-box">
            <button  class="btn"><strong> Log Out</strong></button>
		</div>
    </form>
</div>
</body>   
</html>