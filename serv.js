require('dotenv').config()
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
            res.send(data.data);
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
                url: 'https://translate-plus.p.rapidapi.com/translate',
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': process.env.RAPIAPIKEY || '',
                    'X-RapidAPI-Host': 'translate-plus.p.rapidapi.com'
                },
                data: {
                    "text": text,
                    "source": "auto",
                    "target": arrayLangs[array]
                }
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
        arrayData.push({lang:responses[array].data.translations.target, text:responses[array].data.translations.translation});
    }
    return arrayData;
};

getLanguages = () => {
    return new Promise((resolve, reject) => {
        axios.request({
            method: 'GET',
            url: 'https://translate-plus.p.rapidapi.com/',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPIAPIKEY || '',
                'X-RapidAPI-Host': 'translate-plus.p.rapidapi.com'
            }
        })
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});