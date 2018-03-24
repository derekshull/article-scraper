const request = require('request');
const cheerio = require('cheerio');
const Promise = require("bluebird");
const fs = require("fs");
const https = require("https");
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;

const writeFile = (name,data) => new Promise((resolve,reject) => {
  fs.writeFile(name, data, (err) => { 
    if (err) {
      return reject(err);
    }
    return resolve(data);
  });
});

const get = (url) => new Promise((resolve, reject) => {
  request(url, (error,response,html) => {
    if (error) {
      return reject(error);
    }
    
    try {
      const $ = cheerio.load(html);
      return resolve($);
    } catch(e) {
      return reject(e);
    }
  });
});

const getPdfs = (pdf) => new Promise((resolve, reject) => {
  let fileName = pdf.name.split(' ').join('_');
  fileName = fileName.split('?').join('');
  fileName = fileName.split(':').join('');
  const path = __dirname + '/vol' + pdf.vol + '/issue' + pdf.issue + '/' + fileName + '.pdf';
  
  mkdirp(getDirName(path), function (err) {
    if (err) {
      return cb(err);
    }
    var file = fs.createWriteStream(path);
    var request = https.get(pdf.url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        file.close(function() {
          console.log('downloaded file: ', fileName + '.pdf')
          resolve();
        });
      });
      file.on('error', function (err) {
        fs.unlink(dest);
        console.log(err);
        reject();
      });
    });
  });
});

const findPdfs = (issue) => new Promise((resolve, reject) => {
  get(issue.url).then(($) => {
    const pdfs = [];
    $('a.pdf-link').each(function getIssueHref(i, element) {
      pdfs.push({ url: `https://link.springer.com${$(this).attr('href')}`, name: $(this).attr('title'), vol: issue.vol, issue: issue.issue });
    });
    return Promise.each(pdfs, (pdf) => {
      getPdfs(pdf).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    });
  });
});

const getIssues = (url) => new Promise((resolve, reject) => {
  get(url).then(($) => {
    const issues = [];
    $('.issues-list a').each(function getIssueHref(i, element) {
      issues.push({ url: `https://link.springer.com${$(this).attr('href')}`, vol: $(this).attr('href').split('/')[3], issue: $(this).attr('href').split('/')[4] });
    });

    return Promise.each(issues, (issue) => {
      findPdfs(issue).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    });
  });
});

getIssues('https://link.springer.com/journal/volumesAndIssues/10919');