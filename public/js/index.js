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
        let td = document.createElement('td');
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
 * function replace all symbol for unicode /uXXXX/
 */
function replaceSimbolForUnicode(text) {
    let unicode = escape(text).replaceAll('%', '\\u00');
    return unicode;
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
        { code: 'en-GB', name: 'English (GB)' }
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
});






