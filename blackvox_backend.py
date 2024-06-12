import base64
import webview
import requests
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

def get_access_token(client_id, client_secret):
    auth_url = "https://accounts.spotify.com/api/token"
    auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(auth_url, headers=headers, data=data)

    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception("Failed to get access token", response.text)

class API:
    def __init__(self, access_token):
        self.access_token = access_token

    def get_artist_info(self, artist_name):
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        params = {
            "q": artist_name,
            "type": "artist"
        }
        response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        if response.status_code == 200:
            artists = response.json()["artists"]["items"]
            if artists:
                return artists[0]
            else:
                return {"error": "Artista não encontrado"}
        else:
            return {"error": "Erro ao obter informações do artista"}

    def get_spotify_playlists(self, spotify_user_id):
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        response = requests.get(f"https://api.spotify.com/v1/users/{spotify_user_id}/playlists", headers=headers)
        if response.status_code == 200:
            return response.json()["items"]
        else:
            return {"error": "Erro ao obter playlists"}

# Obtenha o token de acesso
client_id = "1cb62fe9ab624385b5756ecf29e3edbf"
client_secret = "760dad93480d4cbb971e1ea1fb5f5821"
access_token = get_access_token(client_id, client_secret)
api = API(access_token)

@app.route('/get_artist_info', methods=['POST'])
def get_artist_info():
    artist_name = request.json['artist_name']
    return jsonify(api.get_artist_info(artist_name))

@app.route('/get_spotify_playlists', methods=['POST'])
def get_spotify_playlists():
    spotify_user_id = request.json['spotify_user_id']
    return jsonify(api.get_spotify_playlists(spotify_user_id))

if __name__ == '__main__':
    webview.create_window('BLACKVOX', 'index.html')
    webview.start(app)