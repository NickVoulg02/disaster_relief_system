<?php
require_once 'db_connect.php';

$longtitude = $_POST['longtitude'];
$latitude = $_POST['latitude'];

$query = 'UPDATE disaster_supply_database.base SET longtitude='. $longtitude.',latitude='.$latitude.'WHERE id=1';
$stmt = $pdo-> prepare($query);
$stmt-> execute();