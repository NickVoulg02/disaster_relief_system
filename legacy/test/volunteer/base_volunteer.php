<?php
require_once 'db_connect.php';
session_start();
$user_id = $_SESSION['userid'];

$query = "SELECT vol_long,vol_lat FROM disaster_supply_database.volunteer WHERE vol_id = ".$user_id;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
$data['volunteer']=[];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['volunteer'], $result);}



$data['base']=[];
$query = 'SELECT longtitude,latitude FROM disaster_supply_database.base';
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['base'], $result);}


echo json_encode($data);