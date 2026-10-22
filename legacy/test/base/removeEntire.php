<?php
try {
    require_once "db_connect.php";

    $id = $_GET['id'];
    $basequantiy = $_GET['basequantiy'];

    $query = "SELECT * FROM disaster_supply_database.base_load WHERE asdaa =" . $id;
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($basequantiy == $result['pr_quantity'])
    {
        $query = "DELETE FROM disaster_supply_database.base_load WHERE asdaa =".$id;
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        echo "Product removed from base";
    }  
    elseif ($result['pr_quantity'] > $basequantiy)
    {
        $new_quantity =  $result['pr_quantity'] - $basequantiy;
        $query = "UPDATE disaster_supply_database.base_load SET pr_quantity =".$new_quantity." WHERE asdaa =".$id;
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        echo "Quantity removed from base";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
