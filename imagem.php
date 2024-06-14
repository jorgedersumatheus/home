<<<<<<< HEAD
<?php
// Conexão com o banco de dados
$pdo = new PDO("mysql:host=localhost; dbname=album_fotos", "jorgelamatheus", "#DersuMatheus24#");

// Mostrar imagem
$id = $_GET['id'];
$stmt = $pdo->prepare("SELECT arquivo FROM imagens WHERE id = :id");
$stmt->execute(array(':id' => $id));
$imagem = $stmt->fetch();

header("Content-Type: image/jpeg");
echo $imagem['arquivo'];
=======
<?php
// Conexão com o banco de dados
$pdo = new PDO("mysql:host=localhost; dbname=album_fotos", "jorgelamatheus", "#DersuMatheus24#");

// Mostrar imagem
$id = $_GET['id'];
$stmt = $pdo->prepare("SELECT arquivo FROM imagens WHERE id = :id");
$stmt->execute(array(':id' => $id));
$imagem = $stmt->fetch();

header("Content-Type: image/jpeg");
echo $imagem['arquivo'];
>>>>>>> 9bf90f6bd409f91c56e1d8c3f6959d71622b6345
?>