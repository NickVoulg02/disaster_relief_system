<?php
try {
    require_once "db_connect.php";

    $id = $_GET['id'];
    $basequantiy = $_GET['basequantiy'];

    $query = "SELECT * FROM disaster_supply_database.base_load WHERE asdaa =" . $id;

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($basequantiy > $result['pr_quantity'])
        echo "Requested quantity is not available";
    
    else{
        $new_quantity =  $result['pr_quantity'] - $basequantiy;
        
        if ($new_quantity == 0)
        {
            $query = "DELETE FROM disaster_supply_database.base_load WHERE asdaa =".$id;
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            echo "Product no longer available";
        }  
        elseif ($result['pr_quantity'] > $basequantiy)
        {
            $query = "UPDATE disaster_supply_database.base_load SET pr_quantity = ".$new_quantity."
            WHERE asdaa = ".$id;
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            echo "Quantity available has been updated";
        }


        // updating value for product table
        $query = "SELECT * FROM disaster_supply_database.product WHERE pr_id =" . $result['pr_id'];
        $stmt = $pdo->prepare($query);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $new_quantity = $result['detail_value'] + $basequantiy;
        $query = "UPDATE disaster_supply_database.product SET detail_value = ".$new_quantity."
        WHERE pr_id =" . $result['pr_id'];
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        require_once "json_creator.php";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
