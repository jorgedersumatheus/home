<?php
// upload.php

// Conexão com o banco de dados
$conn = mysqli_connect("localhost", "seu_usuario", "sua_senha", "seu_banco_de_dados");

// Verificar conexão
if (!$conn) {
    die("Erro de conexão: " . mysqli_connect_error());
}

// Verificar se o formulário foi enviado
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Verificar se as imagens foram enviadas
    if (isset($_FILES["imagens"])) {
        $imagens = $_FILES["imagens"];
        $response = array();

        // Loop para cada imagem enviada
        foreach ($imagens["name"] as $key => $value) {
            $nome = $imagens["name"][$key];
            $tipo = $imagens["type"][$key];
            $tamanho = $imagens["size"][$key];
            $tmp_name = $imagens["tmp_name"][$key];

            // Verificar se o arquivo é uma imagem
            if (in_array($tipo, array("image/jpeg", "image/png", "image/gif"))) {
                // Upload da imagem para a pasta uploads
                $upload_dir = "uploads/";
                $nome_arquivo = uniqid() . "_" . $nome;
                move_uploaded_file($tmp_name, $upload_dir . $nome_arquivo);

                // Inserir imagem no banco de dados
                $query = "INSERT INTO imagens (nome, arquivo) VALUES ('$nome_arquivo', '$nome_arquivo')";
                mysqli_query($conn, $query);

                // Adicionar imagem à resposta
                $response[] = array("nome" => $nome_arquivo);
            }
        }

        // Retornar a resposta em formato JSON
        echo json_encode($response);
    }
}

// Fechar conexão com o banco de dados
mysqli_close($conn);
?>