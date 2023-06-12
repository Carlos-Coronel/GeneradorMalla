<?php
include 'Conexion.php';

function mostrarDatosDesdeBD() {
    $link = conectar();

    $statement = $link->prepare("SELECT nombre, imagen, modelos, datos FROM malla");
    $statement->execute();

    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        $nombre = $row['nombre'];
        $imagen = $row['imagen'];
        $modelos = $row['modelos'];
        $datos = json_decode($row['datos'], true);

        echo "Nombre: " . $nombre . "<br>";
        echo "Imagen: <br>";
        echo '<img src="data:image/jpeg;base64,' . base64_encode($imagen) . '"><br>'; // Mostrar la imagen en formato base64
        echo "Modelos: <br>";
        echo '<pre>' . print_r($modelos, true) . '</pre><br>'; // Mostrar los modelos en formato base64
        echo "Datos: " .  base64_encode($datos) . "<br><br>";
    }
}

mostrarDatosDesdeBD();
?>
