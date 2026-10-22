<?php
require_once 'db_connect.php';

$query = 'SELECT Cit.cit_lat, Cit.cit_long, Cit.cit_id, task_acceptance_date,task_submission_date,Cit.cit_name,Cit.cit_laname, Cit.cit_number, task_completion_date, Dem.dem_type, Dem.dem_value, accepts.acc_vol_id, accepts.acc_task_id,veh.veh_id, Pro.pr_name, User.user_name
FROM disaster_supply_database.citizen Cit
RIGHT JOIN disaster_supply_database.demands Dem ON Cit.cit_id = Dem.dem_cit_id
LEFT JOIN disaster_supply_database.task ON task_dem_id = Dem.dem_id
LEFT JOIN disaster_supply_database.accepts ON task.task_id = accepts.acc_task_id
LEFT JOIN disaster_supply_database.vehicle Veh ON Veh.veh_vol_id = accepts.acc_vol_id
LEFT JOIN disaster_supply_database.volunteer Vol ON Veh.veh_vol_id = Vol.vol_id
LEFT JOIN disaster_supply_database.users User ON Vol.vol_id = User.user_id
LEFT JOIN disaster_supply_database.product Pro ON Pro.pr_id = Dem.dem_pr_id
WHERE task_completion_date IS NULL;
';
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data=[];
$data['Demands'] = [];
$data['Vehicles'] = [];
$data['VehLoad'] = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['Demands'], $result);}



$query = 'SELECT veh_id,longtitude,latitude,user_name,vol_name,vol_lname FROM disaster_supply_database.users
INNER JOIN disaster_supply_database.volunteer ON user_id = vol_id
INNER JOIN disaster_supply_database.vehicle ON vol_id=veh_vol_id
';
$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['Vehicles'], $result);}


$query = 'SELECT pr_name, veh_load_id FROM disaster_supply_database.product
INNER JOIN disaster_supply_database.veh_load on veh_load_prod = pr_id
INNER JOIN disaster_supply_database.vehicle on veh_load_id = veh_id';

$stmt = $pdo-> prepare($query);
$stmt-> execute();

while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data['VehLoad'], $result);}


echo json_encode($data);