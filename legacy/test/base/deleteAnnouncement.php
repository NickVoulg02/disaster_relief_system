<?php
try {    
    require_once "db_connect.php";
    $id = $_GET['id'];
    $query = "DELETE FROM disaster_supply_database.announcements where ann_id =".$id;
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    echo "Announcement Deleted!";

    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}