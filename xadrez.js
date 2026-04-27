let game = new Chess();

function novaPartida() {
  game = new Chess();
  atualizar();
}

function fazerJogada(origem, destino) {
  const move = game.move({
    from: origem,
    to: destino,
    promotion: 'q'
  });

  if (move === null) return false;

  comentarJogada(move);
  atualizar();
  return true;
}

function atualizar() {
  document.getElementById("fen").innerText = game.fen();
}

function comentarJogada(move) {
  const comentarios = [
    "Movimento sólido.",
    "Aqui há intenção estratégica.",
    "Cuidado com a exposição.",
    "Avanço com energia.",
    "Momento de leitura do jogo.",
    "A posição se transforma."
  ];

  const hexagramas = [
    "1 — Criativo",
    "2 — Receptivo",
    "11 — Paz",
    "35 — Progresso",
    "63 — Após a Conclusão",
    "19 — Aproximação"
  ];

  const comentario = comentarios[Math.floor(Math.random() * comentarios.length)];
  const hex = hexagramas[Math.floor(Math.random() * hexagramas.length)];

  document.getElementById("ia").innerText = comentario;
  document.getElementById("hex").innerText = hex;
}

function gerarPDF() {
  window.print();
}
