import os
from flask import Flask, render_template, request, redirect
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')

mail = Mail(app)

@app.route('/')
def home():
    return render_template('index.html')

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
    user_msg.body = f'Olá {username},\n\nObrigado pelo seu interesse no BLACKVOX.\n\nAqui está a URL principal para acesso ao BLACKVOX: [URL_DO_BLACKVOX]\n\nAtenciosamente,\nEquipe BLACKVOX'

    mail.send(user_msg)

    return redirect('/')

