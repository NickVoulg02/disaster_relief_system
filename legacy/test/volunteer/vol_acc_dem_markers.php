<?php
require_once 'db_connect.php';
session_start();
$user_id = $_SESSION['userid'];

$query="SELECT dem_type,cit_name,cit_laname, cit_number, cit_lat,cit_long, dem_id, task_submission_date,pr_name, dem_value, task_acceptance_date, user_name
FROM disaster_supply_database.volunteer
JOIN disaster_supply_database.accepts ON volunteer.vol_id = accepts.acc_vol_id
JOIN disaster_supply_database.task ON accepts.acc_task_id = task.task_id
JOIN disaster_supply_database.demands ON task.task_dem_id = demands.dem_id
JOIN disaster_supply_database.citizen ON demands.dem_cit_id = citizen.cit_id
JOIN disaster_supply_database.product ON pr_id = dem_pr_id
JOIN disaster_supply_database.users ON user_id = vol_id
WHERE vol_id =".$user_id;

$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data=[];
$data['accDem'] = [];
$data['userInfo'] = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
	array_push($data['accDem'], $result);
}
$query="
SELECT  vol_id, vol_name, vol_lname, vol_long, vol_lat, vol_num, user_name FROM disaster_supply_database.volunteer JOIN disaster_supply_database.users ON user_id = vol_id WHERE vol_id=".$user_id;

$stmt = $pdo-> prepare($query);
$stmt-> execute();


while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
	array_push($data['userInfo'], $result);
}



echo json_encode($data);
