from flask import Flask, request, redirect

app = Flask(__name__)

# Configurações do Spotify
CLIENT_ID = 'SEU_CLIENT_ID_DO_SPOTIFY'
CLIENT_SECRET = 'SEU_CLIENT_SECRET_DO_SPOTIFY'
REDIRECT_URI = 'https://jorgedersumatheus.github.io/home/BLACKVOX_PlayPremium.html'

@app.route('/')
def home():
    return 'Página inicial do seu aplicativo'

@app.route('/login-spotify')
def login_spotify():
    auth_url = f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope=user-read-private%20user-read-email%20playlist-read-private%20playlist-read-collaborative&redirect_uri={REDIRECT_URI}'
    return redirect(auth_url)

if __name__ == '__main__':
    app.run(debug=True)




if __name__ == '__main__':
    app.run(debug=True)

