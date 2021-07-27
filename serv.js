const express = require('express');
const app = express();
const hbs = require('hbs');
const axios = require('axios').default;
const bodyParser = require('body-parser');


const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));



app.get('/', (req, res) => {
    res.render('index.html');
});
app.post('/languages', bodyParser.json(), (req, res) => {
    getLanguages()
        .then((data) => {
            res.send(data);
        })
        .catch((error) => {
            res.json({
                error: error
            });
        });

});
app.post('/translate', bodyParser.json(), (req, res) => {
    let text = req.body.text;
    let arrayLangs = req.body.arrayLangs;
    buildTranslate(text, arrayLangs)
        .then((data) => {
            res.send(data);
        })
        .catch((error) => {
            res.json({
                error: error
            });
        });

});
buildTranslate = async (text, arrayLangs) => {
    return await translate(text, arrayLangs);
};
translate = (text, arrayLangs) => {
    return new Promise((resolve, reject) => {
        let arrayRequests = [];
        for (array in arrayLangs) {
            arrayRequests.push(axios.request({
                method: 'POST',
                url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
                params: {
                    'api-version': '3.0',
                    to: arrayLangs[array],
                    textType: 'plain',
                    profanityAction: 'NoAction'
                },
                headers: {
                    'content-type': 'application/json',
                    'x-rapidapi-key': process.env.RAPIAPIKEY || '',
                    'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com'
                },
                data: [{ Text: text }]
            }));
        }


        axios.all(arrayRequests)
            .then(axios.spread((...responses) => {
                resolve({ data: extractData(responses) });
            }))
            .catch((error) => {
                reject({ data: error });
            });
        arrayRequests = [];
    });
};

extractData = (responses) => {
    let arrayData = [];
    for (array in responses) {
        arrayData.push(responses[array].data[0]);
    }
    return arrayData;
};

getLanguages = () => {
    return new Promise((resolve, reject) => {
        axios.request({
            method: 'GET',
            url: 'https://microsoft-translator-text.p.rapidapi.com/languages',
            params: {
                'api-version': '3.0',
            },
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-key': process.env.RAPIAPIKEY || '',
                'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com'
            }
        })
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});