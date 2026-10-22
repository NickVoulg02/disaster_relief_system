<?php
try {
    require_once "db_connect.php";

    $cat_name = $_GET['category'];
    $query = "INSERT INTO disaster_supply_database.categories VALUEs(NULL,'".$cat_name."')";

    $stmt = $pdo->prepare($query);
    $stmt->execute();

    echo "Category Added!";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
