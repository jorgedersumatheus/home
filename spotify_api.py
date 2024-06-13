python
Copiar código
import requests
import base64

# Suas credenciais do Spotify
client_id = "1cb62fe9ab624385b5756ecf29e3edbf"
client_secret = "760dad93480d4cbb971e1ea1fb5f5821"

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

def get_artist_info(artist_name, access_token):
    search_url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "q": artist_name,
        "type": "artist",
        "limit": 1
    }

    response = requests.get(search_url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json()["artists"]["items"][0]
    else:
        raise Exception("Failed to fetch artist information", response.text)

def print_artist_info(artist_info):
    print(f"Name: {artist_info['name']}")
    print(f"Genres: {', '.join(artist_info['genres'])}")
    print(f"Followers: {artist_info['followers']['total']}")
    print(f"Popularity: {artist_info['popularity']}")
    print(f"Spotify URL: {artist_info['external_urls']['spotify']}")
    print("Images:")
    for image in artist_info['images']:
        print(f"  - {image['url']} ({image['height']}x{image['width']})")
    print()

# Obter o token de acesso
access_token = get_access_token(client_id, client_secret)
print(f"Access Token: {access_token}\n")

# Lista de artistas
artist_names = ["Taylor Swift", "Ed Sheeran", "Adele"]  # Substitua pelos nomes dos artistas que deseja buscar

# Buscar e imprimir informações de vários artistas
for artist_name in artist_names:
    try:
        artist_info = get_artist_info(artist_name, access_token)
        print_artist_info(artist_info)
    except Exception as e:
        print(f"Failed to fetch information for {artist_name}: {e}")