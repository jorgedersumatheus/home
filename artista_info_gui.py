import tkinter as tk
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

def show_artist_info():
    artist_name = entry.get()
    try:
        artist_info = get_artist_info(artist_name, access_token)
        artist_info_window = tk.Toplevel(root)
        artist_info_window.title("Informações do Artista")
        artist_info_label = tk.Label(artist_info_window, text=f"Nome: {artist_info['name']}\nGêneros: {', '.join(artist_info['genres'])}\nSeguidores: {artist_info['followers']['total']}\nPopularidade: {artist_info['popularity']}")
        artist_info_label.pack()
    except Exception as e:
        tk.messagebox.showerror("Erro", f"Falha ao buscar informações para {artist_name}: {e}")

# Obter o token de acesso
access_token = get_access_token(client_id, client_secret)

# Criar a janela principal
root = tk.Tk()
root.title("BLACKVOX - Áudios & Playlists")

# Criar um rótulo
label = tk.Label(root, text="Digite o nome do artista:")
label.pack()

# Criar uma entrada de texto
entry = tk.Entry(root)
entry.pack()

# Criar um botão para buscar informações do artista
button = tk.Button(root, text="Buscar", command=show_artist_info)
button.pack()

# Executar o loop principal da janela
root.mainloop()