<?php
  if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = $_POST["nome"];
    $email = $_POST["email"];
    $mensagem = $_POST["mensagem"];

    // Verificar se os campos estão vazios
    if (empty($nome) || empty($email) || empty($mensagem)) {
      echo "Por favor, preencha todos os campos.";
    } else {
      // Enviar e-mail
      $to = "jorge@jorgematheus.mus.br";
      $subject = "Contato do site";
      $body = "Nome: $nome\nE-mail: $email\nMensagem: $mensagem";
      $headers = "From: $email\r\nReply-To: $email";

      if (mail($to, $subject, $body, $headers)) {
        echo "Mensagem enviada com sucesso!";
      } else {
        echo "Erro ao enviar mensagem.";
      }
    }
  }
?>