<?php
session_start();
try {    
    require_once "db_connect.php";
    $pr_ann=$_GET["pr_ann"];                            // we have product name and donated quantity
    $ann_value=$_GET["ann_value"];

    $id = "SELECT pr_id FROM disaster_supply_database.product WHERE pr_name = '".$pr_ann."'";
    $stmt = $pdo->prepare($id);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);           // fetching product id

    $query = "INSERT INTO disaster_supply_database.demands VALUES(NULL, " . $_SESSION['userid'] . ", " . $result['pr_id'] . ", ".$ann_value.", 'donation')";
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

    echo "Donation has been submitted.";
    
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
