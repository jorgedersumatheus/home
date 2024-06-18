from flask import Flask, redirect, request, session, jsonify
import requests
import base64
import json
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

client_id = 'SEU_CLIENT_ID'
client_secret = 'SEU_CLIENT_SECRET'
redirect_uri = 'https://www.jorgematheus.mus.br/BLACKVOX_PlayPremium.html'

# Função para obter o token de acesso
def get_token(code):
    auth_string = f"{client_id}:{client_secret}"
    auth_bytes = auth_string.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri
    }

    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    response_data = response.json()
    
    # Armazene o token de atualização
    session['refresh_token'] = response_data.get('refresh_token')
    
    return response_data

@app.route('/callback')
def callback():
    code = request.args.get('code')
    token_data = get_token(code)
    access_token = token_data.get('access_token')
    token_type = token_data.get('token_type')
    expires_in = token_data.get('expires_in')
    refresh_token = session.get('refresh_token')
    
    return redirect(f"{redirect_uri}#access_token={access_token}&token_type={token_type}&expires_in={expires_in}&refresh_token={refresh_token}")

# Função para renovar o token
def refresh_access_token(refresh_token):
    auth_string = f"{client_id}:{client_secret}"
    auth_bytes = auth_string.encode('ascii')
    auth_base64 = base64.b64encode(auth_bytes).decode('ascii')

    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }

    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    return response.json()

@app.route('/refresh_token')
def refresh_token():
    refresh_token = request.args.get('refresh_token')
    new_token_data = refresh_access_token(refresh_token)
    return jsonify(new_token_data)

if __name__ == '__main__':
    app.run(debug=True)




