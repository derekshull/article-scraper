const request = require('request');
const cheerio = require('cheerio');
const Promise = require("bluebird");
const fs = require("fs");
const https = require("https");
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

request('https://www.paulekman.com/journal-articles/', (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    $('li a').each(function getPdf(i, element) {
      const pdfLink = $(this).attr('href');
      const pdfTitle = $(this).text();
      if (pdfLink.includes('pdf')) {
        let fileName = pdfTitle.split(' ').join('_');
        fileName = fileName.split('?').join('');
        fileName = fileName.split(':').join('');
        const path = __dirname + '/ekman/' + fileName + '.pdf';
        mkdirp(getDirName(path), function (err) {
          if (err) {
            return cb(err);
          }
          var file = fs.createWriteStream(path);
          var request = https.get(pdfLink, function (response) {
            response.pipe(file);
            file.on('finish', function () {
              file.close(function() {
                console.log('downloaded file: ', fileName + '.pdf')
              });
            });
            file.on('error', function (err) {
              fs.unlink(dest);
              console.log(err);
            });
          });
        });
      }
    });
  }
});