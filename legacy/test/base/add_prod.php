<?php
try {
    require_once "db_connect.php";

    $pr_name = $_GET['pr_name'];
    $det_name = $_GET['det_name'];
    $det_val = $_GET['det_val'];
    $cat_name = $_GET['cat_name'];

    $query = "SELECT cat_id FROM disaster_supply_database.categories WHERE cat_name ='" . $cat_name."'";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $id = $stmt->fetch(PDO::FETCH_ASSOC);

    $query = "INSERT INTO disaster_supply_database.product VALUES ('".$pr_name."', NULL, ".$id['cat_id'].",'".$det_name."',".$det_val.")";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    require_once "json_creator.php";

    echo "Product Added";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
