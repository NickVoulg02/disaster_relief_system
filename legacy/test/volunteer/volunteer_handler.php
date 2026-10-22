<?php
require_once 'db_connect.php';

$user_id = 5;

$query = 'SELECT longtitude,latitude FROM vehicle WHERE veh_vol_id='. $user_id;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data, $result);}

echo json_encode($data);