<?php
try {
    require_once "db_connect.php";
    $q=$_GET["q"];
    $query = "DELETE FROM disaster_supply_database.demands WHERE dem_id =" . $q;

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    echo "Donation has been cancelled!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
