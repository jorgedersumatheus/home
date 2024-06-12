const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cors = require('cors');
const app = express();

const client_id = '1cb62fe9ab624385b5756ecf29e3edbf'; // Seu Client ID
const client_secret = '760dad93480d4cbb971e1ea1fb5f5821'; // Seu Client Secret
const redirect_uri = 'http://www.jorgematheus.mus.br/BLACKVOX_PlayPremium.html'; // Sua URL de redirecionamento

app.use(cors());

app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: 'some-state-of-my-choice'
        }));
});

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            const refresh_token = body.refresh_token;

            const uri = 'http://www.jorgematheus.mus.br/BLACKVOX_PlayPremium.html';
            res.redirect(uri + '?access_token=' + access_token + '&refresh_token=' + refresh_token);
        } else {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
        }
    });
});

app.listen(8888, () => {
    console.log('Servidor rodando na porta 8888');
});