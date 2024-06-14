const salvarBtn = document.getElementById('salvar');
salvarBtn.addEventListener('click', () => {
  // Pega o conteúdo do editor
  const conteudo = document.getElementById('editor').innerHTML;
  
  // Salva o conteúdo em um arquivo usando a API de FileSaver.js
  saveAs(new Blob([conteudo], { type: 'text/html;charset=utf-8' }), 'documento.html');
});

const salvarComoBtn = document.getElementById('salvar-como');
salvarComoBtn.addEventListener('click', () => {
  // Pega o conteúdo do editor
  const conteudo = document.getElementById('editor').innerHTML;
  
  // Cria uma janela de diálogo de salvar como
  const nomeArquivo = prompt('Digite um nome para o arquivo:');
  
  // Salva o conteúdo em um arquivo com o nome fornecido usando a API de FileSaver.js
  saveAs(new Blob([conteudo], { type: 'text/html;charset=utf-8' }), `${nomeArquivo}.html`);
});
