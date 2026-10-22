<?php
require_once 'db_connect.php';

$longtitude = $_POST['longtitude'];
$latitude = $_POST['latitude'];
$vol_username = 'markkennei';
$query = "SELECT user_id FROM disaster_supply_database.users WHERE user_name= :vol_username";
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':vol_username', $vol_username);
$stmt-> execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC);           // fetching vol id

$query = "UPDATE disaster_supply_database.volunteer SET vol_long= :vol_long ,vol_lat= :vol_lat WHERE vol_id = ".$result['user_id'];
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':vol_long', $longtitude);
$stmt->bindParam(':vol_lat', $latitude);
$stmt-> execute();

echo 'ok';