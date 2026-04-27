<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>Xadrez VOV</title>

<script src="chess.min.js"></script>

<style>
body{
  font-family:Arial;
  background:#000;
  color:#fff;
  text-align:center;
}

#tabuleiro{
  display:grid;
  grid-template-columns:repeat(8,50px);
  width:400px;
  margin:20px auto;
}

.casa{
  width:50px;
  height:50px;
  line-height:50px;
  font-size:24px;
  cursor:pointer;
}

.branca{ background:#eee; color:#000; }
.preta{ background:#444; }

.panel{
  background:#111;
  padding:15px;
  border-radius:10px;
  max-width:400px;
  margin:auto;
}
</style>
</head>

<body>

<h1>♟️ Xadrez VOV</h1>

<div id="tabuleiro"></div>

<div class="panel">
<div><strong>FEN:</strong> <span id="fen"></span></div>
<div><strong>IA:</strong> <span id="ia">--</span></div>
<div><strong>Hexagrama:</strong> <span id="hex">--</span></div>
</div>

<button onclick="novoJogo()">Novo</button>

<script>

// ===== MOTOR =====
let game = new Chess();
let selecionada = null;

// ===== DESENHO =====
function desenhar(){

  let tab = document.getElementById("tabuleiro");
  tab.innerHTML = "";

  let casas = game.board();

  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){

      let casa = document.createElement("div");

      let cor = (i+j)%2==0 ? "branca" : "preta";
      casa.className = "casa " + cor;

      let p = casas[i][j];

      if(p){
        casa.innerText = p.type.toUpperCase();
      }

      let coord = String.fromCharCode(97+j) + (8-i);

      casa.onclick = function(){
        clique(coord);
      };

      tab.appendChild(casa);
    }
  }

  document.getElementById("fen").innerText = game.fen();
}

// ===== CLIQUE =====
function clique(c){

  if(!selecionada){
    selecionada = c;
    return;
  }

  let move = game.move({
    from: selecionada,
    to: c,
    promotion:'q'
  });

  selecionada = null;

  if(move){
    comentar();
    desenhar();
  }
}

// ===== COMENTÁRIO VOV =====
function comentar(){

  let frases = [
    "Fluxo em movimento.",
    "Energia se reorganiza.",
    "Decisão em transformação.",
    "Momento de atenção.",
    "Caminho se abre."
  ];

  let hex = [
    "1 — Criativo",
    "2 — Receptivo",
    "35 — Progresso",
    "19 — Aproximação"
  ];

  document.getElementById("ia").innerText =
    frases[Math.floor(Math.random()*frases.length)];

  document.getElementById("hex").innerText =
    hex[Math.floor(Math.random()*hex.length)];
}

// ===== NOV
