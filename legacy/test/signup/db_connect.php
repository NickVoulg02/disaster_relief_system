<?php

$dsn = "mysql:host=localhost:3307;dname=disaster_supply_database";
$dbusername = "root";
$dbpassword = "Thedarkknight1";

try {
    $pdo = new PDO($dsn, $dbusername, $dbpassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

