<?php
// Incluir el archivo de conexión
include 'Conexion.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

// Recuperar los datos enviados mediante POST
$id = $_POST['id'];
$nombre = $_POST['nombre'];
$imagen = file_get_contents($_FILES['imagen']['tmp_name']);
$modelos = file_get_contents($_FILES['modelos']['tmp_name']);
$conn = conectar();

try {
  // Preparar la consulta SQL
  $stmt = $conn->prepare("UPDATE malla SET nombre = ?, imagen = ?, modelos = ? WHERE idmalla = ?");
  $stmt->bindParam(1, $nombre);
  $stmt->bindParam(2, $imagen, PDO::PARAM_LOB);
  $stmt->bindParam(3, $modelos, PDO::PARAM_LOB);
  $stmt->bindParam(4, $id);

  // Ejecutar la consulta y comprobar el resultado
  if ($stmt->execute()) {
    // La actualización se realizó correctamente
    echo "OK";
  } else {
    // Ocurrió un error al actualizar los datos
    echo "Error";
  }
} catch (PDOException $e) {
  // Manejo de excepciones en caso de error en la conexión o la consulta
  echo "Error: " . $e->getMessage();
}
}
?>
