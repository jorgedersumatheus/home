@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    email = request.form['email']
    whatsapp = request.form['whatsapp']
    mensagem = request.form['mensagem']

    # Envia e-mail para você
    admin_msg = Message('Novo Registro de Usuário',
                        sender=os.environ.get('MAIL_USERNAME'),
                        recipients=[os.environ.get('MAIL_USERNAME')])
    admin_msg.body = f'Username: {username}\nEmail: {email}\nWhatsapp: {whatsapp}\nMensagem: {mensagem}'

    mail.send(admin_msg)

    # Envia e-mail para o usuário com a URL principal do BLACKVOX
    user_msg = Message('Acesso ao BLACKVOX',
                       sender=os.environ.get('MAIL_USERNAME'),
                       recipients=[email])
    user_msg.body = f'Olá {username},\n\nObrigado pelo seu interesse no BLACKVOX.\n\nAqui está a URL principal para acesso ao BLACKVOX: https://www.jorgematheus.mus.br/BLACKVOX_PlayPremium.html\n\nAtenciosamente,\nEquipe BLACKVOX'

    mail.send(user_msg)

    return redirect('/')


