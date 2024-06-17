from flask import Flask, request, redirect, jsonify
import requests

app = Flask(__name__)

# Configurações do Spotify
CLIENT_ID = '1cb62fe9ab624385b5756ecf29e3edbf'
CLIENT_SECRET = '760dad93480d4cbb971e1ea1fb5f5821'
REDIRECT_URI = 'https://jorgedersumatheus.github.io/home/BLACKVOX_PlayPremium.html'

@app.route('/')
def home():
    return 'Página inicial do seu aplicativo'

@app.route('/login')
def login_spotify():
    auth_url = f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope=user-read-private%20user-read-email%20playlist-read-private%20playlist-read-collaborative%20user-library-read%20user-top-read&redirect_uri={REDIRECT_URI}'
    return redirect(auth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    response = requests.post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    })

    tokens = response.json()
    access_token = tokens.get('access_token')
    refresh_token = tokens.get('refresh_token')
    redirect_uri_with_tokens = f'{REDIRECT_URI}#access_token={access_token}&refresh_token={refresh_token}'
    return redirect(redirect_uri_with_tokens)

@app.route('/get_user_info')
def get_user_info():
    access_token = request.args.get('access_token')
    response = requests.get('https://api.spotify.com/v1/me', headers={
        'Authorization': f'Bearer {access_token}'
    })
    return jsonify(response.json())

@app.route('/get_user_playlists')
def get_user_playlists():
    access_token = request.args.get('access_token')
    response = requests.get('https://api.spotify.com/v1/me/playlists', headers={
        'Authorization': f'Bearer {access_token}'
    })
    return jsonify(response.json())

@app.route('/get_playlist_tracks')
def get_playlist_tracks():
    access_token = request.args.get('access_token')
    playlist_id = request.args.get('playlist_id')
    response = requests.get(f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks', headers={
        'Authorization': f'Bearer {access_token}'
    })
    return jsonify(response.json())

@app.route('/search_track')
def search_track():
    access_token = request.args.get('access_token')
    query = request.args.get('query')
    response = requests.get(f'https://api.spotify.com/v1/search?q={query}&type=track', headers={
        'Authorization': f'Bearer {access_token}'
    })
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)



