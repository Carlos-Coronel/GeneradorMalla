<?php
function conectar(){
    try {
        $pdo = new PDO("mysql:host=localhost;port=3306; dbname=bd_malla", "root", "97620040");
        // habilita el modo de excepción para reportar errores
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "Error al conectar a la base de datos: " . $e->getMessage();
    }
}
?>