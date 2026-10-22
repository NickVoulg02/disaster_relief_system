<?php
require_once 'db_connect.php';

$query = 'SELECT longtitude,latitude FROM disaster_supply_database.base';
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data, $result);}

echo json_encode($data);