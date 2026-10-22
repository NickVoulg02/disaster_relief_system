<?php
try {
    require_once "db_connect.php";

    $id = $_GET['id'];
    $basequantity = $_GET['basequantiy'];
    /*
    $query = "SELECT * FROM disaster_supply_database.product WHERE pr_id =" . $id;

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($basequantiy > $result['detail_value'])
        echo "Requested quantity is not available";
    
    else{
        $new_quantity =  $result['detail_value'] - $basequantiy;
        $query = "INSERT INTO disaster_supply_database.base_load VALUES (NULL, 1, ".$id.",".$basequantiy.")";
        $stmt = $pdo->prepare($query);
        $stmt->execute();


        $query = "UPDATE disaster_supply_database.product SET detail_value = ".$new_quantity."
        WHERE pr_id =" . $id;*/
        $query = "CALL disaster_supply_database.add_to_base(".$id.",".$basequantity.")";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        require_once "json_creator.php";
        echo "Product Added to Base";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
