<?php
session_start();
try {
    require_once "db_connect.php";
    require_once "json_creator.php";

    $product = $_GET["product"];
    $value = $_GET["value"];

    $json = file_get_contents("./data.json");               // Read the JSON file  
    $json_data = json_decode($json,true);                   // Decode the JSON file 


    foreach ($json_data as $result) {
        if($result['pr_name'] == $product){
            $pr_id = $result['pr_id'];
        }
    }

    $query = "INSERT INTO disaster_supply_database.demands VALUES(NULL,".$_SESSION['userid'].", " . $pr_id . ", ".$value.",  'request')";
    $id = "SELECT dem_id FROM disaster_supply_database.demands ORDER BY dem_id DESC LIMIT 1";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $stmt = $pdo->prepare($id);
    $stmt->execute();

    $results = $stmt->fetch(PDO::FETCH_ASSOC);
    // echo $results['dem_id'];
    $query2 = "INSERT INTO disaster_supply_database.task VALUES(NULL, " . $results['dem_id'] . ",CURRENT_TIMESTAMP,NULL,NULL,'Not Complete')";

    $stmt = $pdo->prepare($query2);
    $stmt->execute();

    echo "Request has been submitted.";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}