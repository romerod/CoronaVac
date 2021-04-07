const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

async function scrapeAsync()
{
    let res = await fetch("https://www.gef.be.ch/gef/de/index/Corona/Corona/corona_impfung_bern.html")
        
    if(res.status != 200)
    {
        core.setFailed(`gef.be.ch is responding with status code: ${res.status}`);
        return;
    }
            
    let txt = await res.text();
    let $ = cheerio.load(txt);
    let box = $('span.text > h3');
    let termine = "Information nicht gefunden.";
    let impfgruppen = "Information nicht gefunden.";
    box.each((_, e) => {
        let txt = $(e).text();
        if(txt.includes('Termine verfügbar')) {
            termine = $(e).next().text().trim();
        } else if (txt.includes('Impfgruppe')) {
            impfgruppen = $(e).next().text().trim();
        }
    });

    let result = { 
        'Termine': termine,
        'Impfgruppen': impfgruppen
    };
    console.log(result);

    var workSpace = process.env.GITHUB_WORKSPACE;
    if(workSpace == undefined)
    {
        workSpace = path.resolve('../..');
    }

    let file = path.join(workSpace, "bern.json");

    fs.writeFile(file, JSON.stringify(result), function(err) {
        if (err) {
        core.setFailed(err);
        }
    });
}

scrapeAsync();