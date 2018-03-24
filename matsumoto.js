const request = require('request');
const cheerio = require('cheerio');
const Promise = require("bluebird");
const fs = require("fs");
const http = require("http");
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

request('http://www.davidmatsumoto.com/publications.php#tabs-2', (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    $('li.pdf_link a').each(function getPdf(i, element) {
      let pdfLink = $(this).attr('href');
      if (!pdfLink.includes('davidmatsumoto.com')) {
        pdfLink = `http://www.davidmatsumoto.com${pdfLink}`;
      }
      let pdfTitle;
      // if ($(this).children('p').children('span').children('span').children('span').length > 0) {
      //   pdfTitle = $(this).children('p').children('span').children('span').children('span').html();
      // } else if ($(this).children('p').children('span').children('span').length > 0) {
      //   pdfTitle = $(this).children('p').children('span').children('span').html();
      // } else if ($(this).children('p').children('span').children('font').length > 0) {
      //   pdfTitle = $(this).children('p').children('span').children('font').html();
      // } else {
      //   pdfTitle = $(this).children('p').children('font').html();
      // }

      // pdfTitle = $(this).children().attr('style', 'font-family: Arial;').html();
      const titleHtml = cheerio.load(element);
      pdfTitle = titleHtml('[style="font-family: Arial;"]').html();
      if (pdfLink.includes('pdf') && pdfTitle) {
        let fileName = pdfTitle.split('&#xA0;').join('');
        fileName = fileName.split('<em>').join('');
        if (fileName.split('). ').length > 1) {
          fileName = fileName.split('). ')[1];
        } else if (fileName.split(').').length > 1) {
          fileName = fileName.split(').')[1];
        } else {
          fileName = fileName.split(') ')[1];
        }
        fileName = fileName.split('. ')[0];
        fileName = fileName.split(' ').join('_');
        fileName = fileName.split('?').join('');
        fileName = fileName.split(':').join('');
        fileName = fileName.split('</em>').join('');
        fileName = fileName.split('<span>').join('');
        fileName = fileName.split('</span>').join('');
        fileName = fileName.split('<i_style="font-size_12pt;_text-indent_-0.45in;">').join('');
        fileName = fileName.split('</i>').join('');
        fileName = fileName.split('<i>').join('');
        fileName = fileName.split('#x2019;').join('');
        fileName = fileName.split('.').join('');
        fileName = fileName.split(',').join('');
        fileName = fileName.split('&quote;').join('');
        fileName = fileName.split('&').join('and');
        fileName = fileName.split('&amp;').join('and');
        const path = __dirname + '/matsumoto/' + fileName + '.pdf';
        mkdirp(getDirName(path), function (err) {
          if (err) {
            console.log(err);
            return false;
          }
          var file = fs.createWriteStream(path);
          var request = http.get(pdfLink, function (response) {
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