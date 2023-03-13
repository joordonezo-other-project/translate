//const { response } = require("express");

/*create list languages in dDOM*/
function createLanguagesList(languagesList) {
    /**
     * get table tableLang 
     */
    let tableLang = document.getElementById('tableLang');
    /**
     * clean table tableLang
     */
    while (tableLang.firstChild) {
        tableLang.removeChild(tableLang.firstChild);
    }

    /**
     * draw languages in table tableLang
     */
    let languages = document.createElement('tbody');
    for (let i = 0; i < languagesList.length; i++) {
        let language = document.createElement('tr');
        /**
         * for each 0 to 2
         */
        for (let j = 0; j < 3; j++) {
            let td = document.createElement('td');
            j == 0 ? td.innerText = languagesList[i].code :
                j == 1 ? td.innerText = languagesList[i].name : '';
            if (j == 2) {
                btnDelete = document.createElement('button');
                btnDelete.className = 'btn btn-default btn-xs';
                btnDelete.title = 'Delete language';
                span = document.createElement('span');
                span.className = 'bi bi-trash2-fill';
                btnDelete.appendChild(span);
                td.appendChild(btnDelete);
                btnDelete.addEventListener('click', function () {
                    languagesList.splice(i, 1);
                    createLanguagesList(languagesList);
                });
            }
            language.appendChild(td);
        }
        languages.appendChild(language);
    }
    tableLang.appendChild(languages);

}

/**
 * function generate table from currentData no innerHTML with headers and rows
 */
function drawTable(currentData, arrayLangs) {
    let headers = ['language', 'to', 'text', 'tag bondle'];
    /**
     * restore table from DOM
     */
    let table = document.getElementById('tableResults');
    /**
         * clean table tableLang
         */
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    /**
     * generate headers for DOM
     */
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    for (let i = 0; i < headers.length; i++) {
        let td = document.createElement('th');
        td.scope = 'col';
        td.innerText = headers[i];
        tr.appendChild(td);
    }
    thead.appendChild(tr);
    /**
     * generate rows for DOM
     */
    let tbody = document.createElement('tbody');
    for (let i = 0; i < currentData.length; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < headers.length; j++) {
            let td = document.createElement('td');
            j == 0 ? td.innerText = currentData[i].detectedLanguage.language :
                j == 1 ? td.innerText = currentData[i].translations[0].to + ' - ' + arrayLangs.find(x => x.code == currentData[i].translations[0].to).name :
                    j == 2 ? td.innerText = currentData[i].translations[0].text :
                        j == 3 ? td.innerText = document.getElementById('tag').value + ' = ' + replaceSimbolForUnicode(currentData[i].translations[0].text) : '';
            if (j >= 2) {
                /**
                 * add button copy to clipboard
                 */
                let copyButton = document.createElement('button');
                copyButton.className = 'btn btn-default btn-xs';
                copyButton.title = 'Copy to clipboard';
                /** create span for copy button */
                let span = document.createElement('span');
                span.className = 'bi bi-clipboard';
                copyButton.appendChild(span);

                copyButton.addEventListener('click', function () {
                    span.className = 'bi bi-clipboard-check';
                    copyToClipboard(td.innerText);
                });
                td.appendChild(copyButton);
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    /**
     * add headers and rows to DOM
     */
    table.appendChild(thead);
    table.appendChild(tbody);
}

function copyToClipboard(text) {
    let textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}
function buildLangInSelect(languagesList) {
    let select = document.getElementById('lang');
    for (code in languagesList) {
        let option = document.createElement('option');
        option.value = code;
        option.innerText = languagesList[code].name + ' - ' + languagesList[code].nativeName;
        select.appendChild(option);
    }
}

/**
 * function replace all symbol for unicode /uXXXX/ except characters who " .-"
 */
function replaceSimbolForUnicode(text) {
    let textForUnicode = text.replace(/[^\w\s]/gi, function (x) {
        let code = x.charCodeAt(0).toString(16).toUpperCase();
        code = code.length == 1 ? '000' + code :
            code.length == 2 ? '00' + code :
                code.length == 3 ? '0' + code : code;
        return '\\u' + code;
    });
    return textForUnicode;
}


/** document ready */
$(document).ready(function () {
    let arrayLangs = [
        { code: 'de', name: "German" },
        { code: 'es', name: "Spanish" },
        { code: 'es-US', name: 'Spanish (EEUU)' },
        { code: 'fr-CA', name: 'French (Canada)' },
        { code: 'fr', name: 'French' },
        { code: 'en', name: 'English' },
        { code: 'en-GB', name: 'English (GB)' },
        { code: 'nl', name: 'Nederlands' },
        { code: 'pl', name: 'Polonais' }
    ];
    let allLangs = [];
    function executeQuery() {
        if (!document.getElementById('text').value) {
            return false;
        }
        let temArrayLangs = arrayLangs.map(item => {
            return item.code;
        });

        /**
         * request fetch to post translate 
         */
        fetch('./translate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: document.getElementById('text').value,
                arrayLangs: temArrayLangs
            }),
        })
            .then(response => response.json())
            .then((data) => {
                if (!data.error) {
                    drawTable(data.data, arrayLangs);
                }
            });
    }
    document.getElementById('execute-translate').addEventListener('click', executeQuery);
    document.getElementById('text').addEventListener('keyup', function (e) {
        if (e.key !== undefined && e.key.toLowerCase() === 'enter') {
            executeQuery();
        }
    });
    document.getElementById('tag').addEventListener('keyup', function (e) {
        if (e.key !== undefined && e.key.toLowerCase() === 'enter') {
            executeQuery();
        }
    });
    /**
     * add event click to openModal
     */
    document.getElementById('openModal').addEventListener('click', function (e) {
        if (allLangs.length == 0) {
            /**
             * generate request to get languages
             */
            fetch('./languages', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json())
                .then((data) => {
                    allLangs = data.translation;
                    buildLangInSelect(data.translation);
                });
        }
    });

    /**
     * add event click to addLanguage
     */
    document.getElementById('addLanguage').addEventListener('click', function () {

        let searchLang = document.getElementById('searchLang');
        let lang = searchLang.value;
        if (!lang) {
            return false;
        }
        /**
         * find lang in allLangs
         */
        let langInAll = null;
        for (item in allLangs) {
            if (item == lang) {
                langInAll = allLangs[item];
            };
        }
        /**
         * if lang not in allLangs
         */
        if (lang && langInAll) {
            /**
             * add lang to arrayLangs
             */
            let exist = arrayLangs.find(item => item.code == lang);
            if (!exist) {
                arrayLangs.push({ code: lang, name: langInAll.name });
                createLanguagesList(arrayLangs);
            }
            searchLang.value = '';
        }
    });



    /**
     * create list languages in DOM
     */
    createLanguagesList(arrayLangs);

    const encoder = new TextEncoder();

    function ConvertStringToHex(str) {
        console.log(str);
        var arr = [];
        var phrase = "";
        for (var i = 0; i < str.length; i++) {
            var word = str[i];
            var wordEncode = encodeURI(str[i]);
            if (word != wordEncode && wordEncode != "%20") {
                arr[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
                phrase += "\\u" + arr[i];
            }
            else {
                phrase += str[i];
            }

        }
        console.log(phrase);
        return phrase;
    }

    function saveDynamicDataToFile(translatedFile) {

        var convertFile = translatedFile.join('\n');
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        var blob = new Blob([convertFile], { type: "text/plain;charset=utf-8" });
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "file.properties";
        a.click();
        window.URL.revokeObjectURL(url);
        saveAs(blob, "file.properties");
    }

    function convertToProperties(translatedFile) {
        var result = [];
        translatedFile.forEach(element => {
            if (typeof element == "string") {
                result.push(element);
            }
            if (typeof element == "object" && element.key == "") {
                result.push("");
            }
            if (typeof element == "object" && element.key != "") {
                result.push(element.key.concat(' = ').concat(element.value || ''));
            }

        });
        saveDynamicDataToFile(result);
    };

    /**
     * Browse files and change values in the base file
     */

    function browseFiles(contentFileT, contetBaseFile) {
        for (var keyTransalete in contentFileT) {
            if (contentFileT.hasOwnProperty(keyTransalete)) {
                var value = contentFileT[keyTransalete];
                contetBaseFile.forEach(element => {
                    if (typeof element == "object") {
                        if (keyTransalete == element.key) {
                            element.value = ConvertStringToHex(value);
                        }
                    }
                });
            }
        }
        convertToProperties(contetBaseFile);
    }
    function executeQueryTranslate(phrase) {
        console.log(phrase);
        if (phrase == "") {
            return false;
        }

        /**
         * request fetch to post translate 
         */
        var checkedValue = document.querySelector('.form-check-input:checked').value;
        var checkedValueFrom = document.querySelector('.from:checked').value;
        fetch('https://microsoft-translator-text.p.rapidapi.com/translate?api-version=3.0&to%5B0%5D=es', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': 'eb8ef6d81fmsh84342605655cd02p14fe50jsnd81790189c16',
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
            },
            body: JSON.stringify({
                text: phrase,
            }),
        })
            .then(response => response.json())
            .then((data) => {
                if (!data.error) {
                    console.log(data)
                    drawTable(data.data);
                }
            });
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function browseFile(contentFile) {
        contentFile.forEach(element => {
            if (typeof element == "object") {
                if (element.value != "") {
                    //let phraseTraslated = executeQueryTranslate(element.value)
                    console.log(executeQueryTranslate(element.value));
                }
                element.value = ConvertStringToHex(element.value);
            }
        });
    }

    const propertiesToJSONWithoutComments = (str) => {
        return (
            str
                // Concat lines that end with '\'.
                .replace(/\\\n( )*/g, '')
                // Split by line breaks.
                .split('\n')
                // Remove commented lines:
                .filter((line) =>
                    /(\#|\!)/.test(line.replace(/\s/g, '').slice(0, 1))
                        ? false
                        : line
                )
                // Create the JSON:
                .reduce((obj, line) => {
                    // Replace only '=' that are not escaped with '\' to handle separator inside key
                    const colonifiedLine = line.replace(/(?<!\\)=/, ':');
                    const key = colonifiedLine
                        // Extract key from index 0 to first not escaped colon index
                        .substring(0, colonifiedLine.search(/(?<!\\):/))
                        // Remove not needed backslash from key
                        .replace(/\\/g, '')
                        .trim();
                    const value = colonifiedLine
                        .substring(colonifiedLine.search(/(?<!\\):/) + 1)
                        .trim();
                    obj[key] = value;
                    return obj;
                }, {})
        );
    };
    const propertiesToJSONwithComments = (str) => {
        return (
            str
                .replace(/\\\n( )*/g, '')
                .split('\n')

                .map(function (line) {
                    if (/(\#|\!)/.test(line.replace(/\s/g, '').slice(0, 1))) {
                        return line;
                    }
                    const colonifiedLine = line.replace(/(?<!\\)=/, ':');
                    const key = colonifiedLine
                        .substring(0, colonifiedLine.search(/(?<!\\):/))
                        .replace(/\\/g, '')
                        .trim();
                    const value = colonifiedLine
                        .substring(colonifiedLine.search(/(?<!\\):/) + 1)
                        .trim();
                    return { key, value }

                })
        );
    };
    function readFile(fileT, fileB) {
        const fileTranslate = fileT;
        const baseFile = fileB;
        if (!fileTranslate && !baseFile) {
            return;
        }
        const readTranslate = new FileReader();
        const readBase = new FileReader();
        readTranslate.onload = function (fileT) {
            readBase.onload = function (fileB) {
                const contentFileB = fileB.target.result;
                const contentFileT = fileT.target.result;
                browseFiles(propertiesToJSONWithoutComments(contentFileT), propertiesToJSONwithComments(contentFileB));
            }

        };
        readTranslate.readAsText(fileTranslate);
        readBase.readAsText(baseFile);
    };
    function readFileFormLenguage(fileT) {
        const fileTranslate = fileT;
        if (!fileTranslate) {
            return;
        }
        const readTranslate = new FileReader();

        readTranslate.onload = function (fileT) {
            const contentFileT = fileT.target.result;
            browseFile(propertiesToJSONwithComments(contentFileT));
        };
        readTranslate.readAsText(fileTranslate);
    }

    /**
     * Button for translate file and activate download button
     */
    document.getElementById('translateFile').addEventListener('click', function () {
        readFile(document.getElementById('inputFile').files[0], document.getElementById('inputFileBase').files[0]);
    });
    //Button for translate file with select lenguage 
    document.getElementById('translateFileWithLenguage').addEventListener('click', function () {
        readFileFormLenguage(document.getElementById('inputFileForTranslate').files[0]);
    });
});






