javascript
Copiar código
const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const app = express();

const clientId = '1cb62fe9ab624385b5756ecf29e3edbf';
const clientSecret = '760dad93480d4cbb971e1ea1fb5f5821';
const redirectUri = 'https://jorgedersumatheus.github.io/home/BLACKVOX_PlayPremium.html';

app.use(cors());
app.use(express.json());

app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: 'some-state-of-my-choice'
        }));
});

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const accessToken = body.access_token;
                const refreshToken = body.refresh_token;

                res.redirect('/#' +
                    querystring.stringify({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.post('/get_artist_info', (req, res) => {
    const { artist_name } = req.body;

    const options = {
        url: `https://api.spotify.com/v1/search?q=${artist_name}&type=artist`,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const artist = body.artists.items[0];
            res.json(artist);
        } else {
            res.status(response.statusCode).json(body);
        }
    });
});

app.post('/get_spotify_playlists', (req, res) => {
    const { spotify_user_id } = req.body;

    const options = {
        url: `https://api.spotify.com/v1/users/${spotify_user_id}/playlists`,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json(body);
        } else {
            res.status(response.statusCode).json(body);
        }
    });
});

const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});



