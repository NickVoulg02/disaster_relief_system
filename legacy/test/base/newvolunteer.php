<?php
try {
    require_once "db_connect.php";


    $username = $_GET['username'];
    $pass = $_GET["pass"];
    $volname = $_GET["volname"];
    $vollname = $_GET["vollname"];
    $vollong = $_GET["vollong"];
    $vollat = $_GET["vollat"];
    $volnum = $_GET["volnum"];
    $query = "INSERT INTO disaster_supply_database.users (user_name,user_pass,user_type) VALUES (:username,:pwd,'volunteer');";
    $stmt = $pdo->prepare($query);

    $options = [
        'cost' => 12
    ];

    //$hashedPwd = password_hash($pwd, PASSWORD_BCRYPT, $options); 
    $stmt->bindParam(":username", $username);
    //$stmt->bindParam(":pwd", $hashedPwd);
    $stmt->bindParam(":pwd", $pass);

    $stmt->execute();


    $id = "SELECT * FROM disaster_supply_database.users ORDER BY user_id DESC LIMIT 1";
    $stmt = $pdo->prepare($id);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $query2 = "INSERT INTO disaster_supply_database.volunteer VALUES('".$volname."','".$vollname."',".$result['user_id'].",".$vollong.",".$vollat.",".$volnum.")";
    $stmt = $pdo->prepare($query2);
    $stmt->execute();

    echo "Volunteer Added!";

    $query2 = "INSERT INTO disaster_supply_database.vehicle VALUES(NULL,".$result['user_id'].",0,".$vollong.",".$vollat.")";
    $stmt = $pdo->prepare($query2);
    $stmt->execute();

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
