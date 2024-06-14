<<<<<<< HEAD
import json

def save_artist_info(artist_info, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(artist_info, f, ensure_ascii=False, indent=4)

# Buscar e salvar informações de vários artistas
for artist_name in artist_names:
    try:
        artist_info = get_artist_info(artist_name, access_token)
        save_artist_info(artist_info, f"{artist_name.replace(' ', '_')}_info.json")
        print(f"Saved info for {artist_name} to {artist_name.replace(' ', '_')}_info.json")
    except Exception as e:
=======
import json

def save_artist_info(artist_info, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(artist_info, f, ensure_ascii=False, indent=4)

# Buscar e salvar informações de vários artistas
for artist_name in artist_names:
    try:
        artist_info = get_artist_info(artist_name, access_token)
        save_artist_info(artist_info, f"{artist_name.replace(' ', '_')}_info.json")
        print(f"Saved info for {artist_name} to {artist_name.replace(' ', '_')}_info.json")
    except Exception as e:
>>>>>>> 9bf90f6bd409f91c56e1d8c3f6959d71622b6345
        print(f"Failed to fetch information for {artist_name}: {e}")