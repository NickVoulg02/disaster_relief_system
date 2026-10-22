<?php

if($_SERVER["REQUEST_METHOD"] == "POST"){
    $username = $_POST["username"];
    $pwd = $_POST["pwd"];

    try{
        require_once "db_connect.php";
        require_once "login_functions.php";
        require_once "login_view.php";
        // ERROR HANDLERS
        $errors = [];

        if(empty($username) || empty($pwd)) {
            $errors["empty_input"] = "Fill in all fields";
        }

        $result = get_user($pdo, $username);

        if(!$result) {
            $errors["username"] = "Incorrect username";
        }

        if(strcmp($pwd,$result["user_pass"])!=0){
            $errors["password"] = "Incorrect password";
        }
        
        
        require_once "config_session.php";

        if ($errors){
            $_SESSION["errors_login"] = $errors;
            header("Location: /test/form.php");
            die();
        }
       
        // $newSessionId = session_create_id();
        // $sessionId = $newSessionId . "_" . $result["user_id"];
        // session_id($sessionId);

        $_SESSION["userid"] = $result["user_id"];
        $_SESSION["user_username"] = $result["user_name"];
        $_SESSION["usertype"] = $result["user_type"];

        if ($_SESSION["usertype"] == 'admin'){ 
            header("Location: /test/base/base1.php");
        }
		if ($_SESSION["usertype"] == 'citizen'){ 
            header("Location: /test/citizen/civ3_test.php");
        }
        if ($_SESSION["usertype"] == 'volunteer'){ 
            header("Location: /test/volunteer/volunteer.php");
        }


        $pdo = null;
        $stmt = null;
        die();

    } catch (PDOException $e) {
        die("Query failed: " .$e->getMessage());
    }


}
else{
    header("Location: /test/form.php");
}