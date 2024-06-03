<?php
// Conexão com o banco de dados
$pdo = new PDO("mysql:host=localhost; dbname=album_fotos", "test_user", "PASSWORD");

// Função para carregar imagem
function carregarImagem($imagem) {
    $stmt = $pdo->prepare("INSERT INTO imagens (nome, arquivo) VALUES (:nome, :arquivo)");
    $stmt->execute(array(
        ':nome' => $imagem['name'],
        ':arquivo' => file_get_contents($imagem['tmp_name'])
    ));
}

// Carregar imagem
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $imagem = $_FILES['imagem'];
    carregarImagem($imagem);
    header("Location: album.php");
    exit;
}

// Mostrar imagens
$stmt = $pdo->query("SELECT * FROM imagens");
$imagens = $stmt->fetchAll();

// HTML para mostrar as imagens
?>
<html>
<head>
    <title>Álbum de Fotografias</title>
</head>
<body>
    <h1>Álbum de Fotografias</h1>
    <form action="" method="post" enctype="multipart/form-data">
        <input type="file" name="imagem">
        <button type="submit">Carregar</button>
    </form>
    <ul>
        <?php foreach ($imagens as $imagem) {?>
            <li>
                <img src="imagem.php?id=<?php echo $imagem['id'];?>" alt="<?php echo $imagem['nome'];?>">
            </li>
        <?php }?>
    </ul>
</body>
</html>