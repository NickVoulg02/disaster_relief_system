<?php
require_once 'db_connect.php';

$query = 'SELECT product.pr_id,pr_quantity,pr_name FROM disaster_supply_database.base_load as base
LEFT JOIN disaster_supply_database.product
ON base.pr_id = product.pr_id
WHERE base_id= 1';
$stmt = $pdo-> prepare($query);
$stmt-> execute();

$data = [];
while($result= $stmt-> fetch(PDO::FETCH_ASSOC) ){

array_push($data, $result);}

echo json_encode($data);