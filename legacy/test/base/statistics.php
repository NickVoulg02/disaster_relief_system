<?php
require_once 'db_connect.php';
$datetime = $_POST['dateDisplay'];
$query = "SELECT count(task_id) as count FROM disaster_supply_database.task inner join disaster_supply_database.demands on task_dem_id = dem_id where task_status = 'Complete' and dem_type='request' and task_submission_date>='".$datetime."'";
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data=[]; 
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
array_push($data, $result);}

$query = "SELECT count(task_id) as count from disaster_supply_database.task inner join disaster_supply_database.demands on task_dem_id = dem_id where task_status = 'Not Complete' and dem_type='request' and task_submission_date>='".$datetime."'";
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
array_push($data, $result);}

$query = "SELECT count(task_id) as count from disaster_supply_database.task inner join disaster_supply_database.demands on task_dem_id = dem_id where task_status = 'Not Complete' and dem_type='donation' and task_submission_date>='".$datetime."'";
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
array_push($data, $result);}

$query = "SELECT count(task_id) as count from disaster_supply_database.task inner join disaster_supply_database.demands on task_dem_id = dem_id where task_status = 'Complete' and dem_type='donation' and task_submission_date>='".$datetime."'";
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
array_push($data, $result);}

echo json_encode($data);

