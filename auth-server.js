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
                'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64'))
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

// Outras rotas e configuração do servidor...

const port = process.env.PORT || 8888;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
    console.log(`Servidor rodando na porta ${port}`);
});



