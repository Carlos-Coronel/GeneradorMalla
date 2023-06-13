<?php
include 'Conexion.php';

function obtenerDatosDesdeBD() {
    $link = conectar();

    $statement = $link->prepare("SELECT idmalla, nombre, imagen, modelos FROM malla");
    $statement->execute();

    $datos = array(); // Array para almacenar los datos

    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        $idmalla = $row['idmalla'];
        $nombre = $row['nombre'];
        $imagen = $row['imagen'];
        $modelos = $row['modelos'];

        // Construir un array asociativo con los datos
        $datos[] = array(
            'idmalla' => $idmalla,
            'nombre' => $nombre,
            'imagen' => base64_encode($imagen),
            'modelos' => base64_encode($modelos)
        );
    }

    return $datos;
}

// Obtener los datos desde la base de datos
$datosDesdeBD = obtenerDatosDesdeBD();

// Convertir los datos a formato JSON
$json = json_encode($datosDesdeBD);

// Enviar el JSON como respuesta
header('Content-Type: application/json');
echo $json;
?>
