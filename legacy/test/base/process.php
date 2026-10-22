<?php
try {
    require_once "db_connect.php";

    $pr_name = $_GET['pr_name'];
    $det_name = $_GET['det_name'];
    $det_val = $_GET['det_val'];
    $cat_name = $_GET['cat_name'];
    $q = $_GET['id'];

    if($q == "undefined"){
        $query = "SELECT cat_id FROM disaster_supply_database.categories WHERE cat_name ='" . $cat_name."'";

        $stmt = $pdo->prepare($query);
        $stmt->execute();

        $id = $stmt->fetch(PDO::FETCH_ASSOC);

        $query = "INSERT INTO disaster_supply_database.product VALUES ('".$pr_name."', NULL, ".$id['cat_id'].",'".$det_name."',".$det_val.")";
        $stmt = $pdo->prepare($query);
        $stmt->execute();

        require_once "./citizen/json_creator.php";

        echo "Product Added";
    }

    else{
        $query = "SELECT cat_id FROM disaster_supply_database.categories WHERE cat_name ='" . $cat_name."'";

        $stmt = $pdo->prepare($query);
        $stmt->execute();

        $id = $stmt->fetch(PDO::FETCH_ASSOC);

        $query = "UPDATE disaster_supply_database.product
        SET pr_name = '".$pr_name."', detail_name = '".$det_name."', detail_value = ".$det_val.", pr_cat_id = ".$id['cat_id']."
        WHERE pr_id = ".$q;

        $stmt = $pdo->prepare($query);
        $stmt->execute();

        require_once "./citizen/json_creator.php";

        echo "Product Submitted";
    }

    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
