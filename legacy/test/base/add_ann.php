<?php
try {
    require_once "db_connect.php";

    $ann_id = $_GET['ann_id'];
    $ann_num = $_GET['ann_num'];

    $query = "INSERT INTO disaster_supply_database.announcements VALUES (NULL, ".$ann_id.",".$ann_num.")";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    require_once "json_creator.php";

    echo "Announcement Added";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
