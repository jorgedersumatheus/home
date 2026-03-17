export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { nome, email, mensagem } = req.body;

  console.log('Novo contato:', nome, email, mensagem);

  return res.status(200).json({ success: true });

}
