from flask import Flask, render_template, request, redirect, url_for, flash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['DEBUG'] = True  # Habilitar o modo de depuração

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    try:
        username = request.form['username']
        email = request.form['email']
        whatsapp = request.form['whatsapp']
        mensagem = request.form['mensagem']

        # Configuração do email
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        smtp_user = 'www.jorgematheus.mus.br@gmail.com'
        smtp_password = 'dqua lyrj atat aggg'  # Substitua pela senha do app gerada

        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = smtp_user
        msg['Subject'] = 'Novo Registro de Usuário'

        body = f'Nome: {username}\nEmail: {email}\nWhatsApp: {whatsapp}\nMensagem: {mensagem}'
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, smtp_user, msg.as_string())
        server.quit()
        flash('Registro bem-sucedido! Verifique seu e-mail para mais informações.', 'success')
    except Exception as e:
        flash(f'Falha ao enviar o e-mail. Por favor, tente novamente. Erro: {str(e)}', 'danger')
        app.logger.error(f'Erro ao processar registro: {str(e)}')  # Log de erro detalhado

    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(port=5000)



