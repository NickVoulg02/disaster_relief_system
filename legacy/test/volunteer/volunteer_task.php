<?php
require_once 'db_connect.php';
session_start();

$user_id = $_SESSION['userid'];
$task_id = $_POST['task_id'];

$query = "SELECT vol_long,vol_lat FROM disaster_supply_database.volunteer WHERE vol_id = ".$user_id;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
$data['volunteer']=[];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['volunteer'], $result);}



$data['task']=[];
$query = "SELECT cit_long, cit_lat FROM disaster_supply_database.citizen INNER JOIN disaster_supply_database.demands ON cit_id = dem_cit_id INNER JOIN disaster_supply_database.task ON dem_id=task_dem_id WHERE task_id=".$task_id;
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['task'], $result);}




echo json_encode($data);

