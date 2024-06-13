const axios = require('axios');
const qs = require('qs');

// Configurações para autenticação no Spotify
const CLIENT_ID = '1cb62fe9ab624385b5756ecf29e3edbf';
const CLIENT_SECRET = '760dad93480d4cbb971e1ea1fb5f5821';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const API_ENDPOINT = 'https://api.spotify.com/v1/recommendations';

// Função para obter token de acesso
async function getAccessToken() {
    const response = await axios.post(TOKEN_ENDPOINT, qs.stringify({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return response.data.access_token;
}

// Função para obter recomendações do Spotify
async function getRecommendations() {
    const accessToken = await getAccessToken();

    const response = await axios.get(API_ENDPOINT, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            seed_tracks: '7MffyPzHHH1YUoUwBzV3W2,4hQ6UGyWQIGJmHSo0J88JW,4F1yvJfQ7gJkrcgFJQDjOr,4XPWKmy05Rcff6TLHNoNF8,6Gcv1c96EIihHdJeERkpc8',
            limit: 5
        }
    });

    return response.data.tracks;
}

// Chamar função para obter recomendações e imprimir no console
getRecommendations().then((recommendations) => {
    console.log('Recomendações do Spotify:', recommendations);
}).catch((error) => {
    console.error('Erro ao obter recomendações do Spotify:', error.response.data);
});