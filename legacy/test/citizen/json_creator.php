<?php

require_once "db_connect.php";

$query = "SELECT pr_name, pr_id, pr_cat_id, detail_name, detail_value, cat_name FROM disaster_supply_database.product INNER JOIN disaster_supply_database.categories on pr_cat_id=cat_id";
$stmt = $pdo->prepare($query);
$stmt->execute();

while($product = $stmt->fetch(PDO::FETCH_ASSOC)){
    $products[] = $product;
}

$encoded_data = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
file_put_contents('data.json', $encoded_data);


