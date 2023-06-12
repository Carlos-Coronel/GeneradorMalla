<?php
include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $link = conectar();
    
    $nombre = $_POST['nombre'];
    $imagen = file_get_contents($_FILES['imagen']['tmp_name']);
    $modelos = file_get_contents($_FILES['modelos']['tmp_name']);
    $datos = json_decode($_POST['datos'], true);

    $statement = $link->prepare("INSERT INTO malla (nombre, imagen, modelos, datos) VALUES (?, ?, ?, ?)");

    $statement->bindParam(1, $nombre);
    $statement->bindParam(2, $imagen, PDO::PARAM_LOB);
    $statement->bindParam(3, $modelos, PDO::PARAM_LOB);
    $statement->bindParam(4, $datos, PDO::PARAM_LOB);

    if ($statement->execute()) {
        header('Location: listar.php');
    } else {
        echo 'Ocurrió un error al insertar los datos en la base de datos.';
    }
}
?>
