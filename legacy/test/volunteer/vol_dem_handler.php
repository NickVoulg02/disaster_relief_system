<?php
require_once 'db_connect.php';

//$user_name = "sergkrist";

$query="SELECT dem_type,cit_name,cit_laname, cit_number, cit_lat,cit_long, task_id, task_submission_date,pr_name, dem_value
FROM disaster_supply_database.demands 
LEFT JOIN disaster_supply_database.task 
ON task_dem_id = dem_id 
LEFT JOIN disaster_supply_database.citizen 
ON cit_id = dem_cit_id
LEFT JOIN disaster_supply_database.product
ON dem_pr_id = pr_id
WHERE task_acceptance_date IS NULL;";

$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){
	array_push($data, $result);
}



echo json_encode($data);