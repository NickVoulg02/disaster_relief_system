<?php


if($_SERVER["REQUEST_METHOD"] == "POST"){
    $username = $_POST["username"];
    $pwd = $_POST["pwd"];
    $citname = $_POST["citname"];
    $citlname = $_POST["citlname"];
    $citlong = $_POST["citlong"];
    $citlat = $_POST["citlat"];
    $citnum = $_POST["citnum"];

    try{
        require_once "db_connect.php";
        require_once "signup_functions.php";
        require_once "signup_view.php";
        // ERROR HANDLERS
        $errors = [];

        if(empty($username) || empty($pwd) || empty($citname) || empty($citlname) || empty($citlong) || empty($citlat) || empty($citnum)) 
        {
            $errors["empty_input"] = "Fill in all fields";
        }
        if(get_username($pdo, $username)) {
            $errors["username"] = "Username already taken";
        }
        
        require_once "config_session.php";

        if ($errors){
            $_SESSION["errors_signup"] = $errors;
            header("Location: /test/form.php");
            die();
        }
       
        create_user($pdo, $username, $pwd, $citname, $citlname, $citlong, $citlat, $citnum);

        $pdo = null;
        $stmt = null;

        header("Location: /test/form.php?signup=success");
        die();

    } catch (PDOException $e) {
        die("Query failed: " .$e->getMessage());
    }
}
else{
    header("Location: /test/form.php");
}