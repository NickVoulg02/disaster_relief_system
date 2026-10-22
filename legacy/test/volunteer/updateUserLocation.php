<?php
require_once 'db_connect.php';
session_start();
$longtitude = $_POST['longtitude'];
$latitude = $_POST['latitude'];
$user_id = $_SESSION['userid'];

$query = "UPDATE disaster_supply_database.volunteer SET vol_long= :vol_long ,vol_lat= :vol_lat WHERE vol_id = ".$user_id;
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':vol_long', $longtitude);
$stmt->bindParam(':vol_lat', $latitude);
$stmt-> execute();

$query = "UPDATE disaster_supply_database.vehicle SET longtitude= :vol_long ,latitude= :vol_lat WHERE veh_vol_id = ".$user_id;
$stmt = $pdo-> prepare($query);
$stmt->bindParam(':vol_long', $longtitude);
$stmt->bindParam(':vol_lat', $latitude);
$stmt-> execute();

echo 'ok';