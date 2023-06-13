<?php
include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    $link = conectar();

    $idmalla = $_POST['idmalla'];

    $statement = $link->prepare("DELETE FROM malla WHERE idmalla = ?");

    $statement->bindParam(1, $idmalla);

    if ($statement->execute()) {
        echo 'La malla se eliminó correctamente.';
    } else {
        echo 'Ocurrió un error al eliminar la malla.';
    }
}
?>
