<?php
require_once 'db_connect.php';

session_start();
$user_id = $_SESSION['userid'];

$query="SELECT task_id,citizen.cit_name,citizen.cit_laname, cit_lat, cit_long, citizen.cit_number,task.task_submission_date,product.pr_name, demands.dem_value as sum
FROM disaster_supply_database.users
LEFT JOIN disaster_supply_database.volunteer
ON vol_id = user_id
LEFT JOIN disaster_supply_database.accepts
ON  acc_vol_id = vol_id
LEFT JOIN disaster_supply_database.task
ON task_id = acc_task_id
LEFT JOIN disaster_supply_database.demands
ON task_dem_id = dem_id
LEFT JOIN disaster_supply_database.product
ON dem_pr_id = pr_id
LEFT JOIN disaster_supply_database.citizen
ON dem_cit_id = cit_id
WHERE acc_vol_id = :user_id;";

$stmt = $pdo-> prepare($query);
$stmt->bindParam(':user_id', $user_id);
$stmt-> execute();
$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data, $result);}

echo json_encode($data);
