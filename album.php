<?php
// Conexão com o banco de dados
$conn = mysqli_connect("localhost", "username", "password", "database");

// Verificar conexão
if (!$conn) {
    die("Erro de conexão: ". mysqli_connect_error());
}

// Consulta para recuperar as imagens do banco de dados
$query = "SELECT * FROM imagens";
$result = mysqli_query($conn, $query);

// Verificar se há resultados
if (mysqli_num_rows($result) > 0) {
    // Criar um array para armazenar as imagens
    $imagens = array();

    // Loop para recuperar as imagens
    while ($row = mysqli_fetch_assoc($result)) {
        $imagens[] = array(
            'nome' => $row['nome'],
            'imagem' => $row['imagem']
        );
    }

    // Fechar conexão com o banco de dados
    mysqli_close($conn);

    // Retornar as imagens em formato JSON
    echo json_encode($imagens);
} else {
    echo "Nenhuma imagem encontrada";
}
?>
}
?>