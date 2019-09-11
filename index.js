// Параметры на входе
let directory = process.argv[2];
const fileName = process.argv[3];
console.log('directory: ' + directory);
console.log('file is: ' + fileName);

var fs = require('fs');
const replacersFromFile = require('./' + fileName);
const extensionsToIgnore = ['.png', '.jpg', '.jpeg', '.gif'];

//найти и заменить
function searchAndReplaceFile(regexpFind, replace, file) {
  var files = fs.createReadStream(file, 'utf8');
  var newCss = '';
  files.on('data', function (chunk) {
    newCss += chunk.toString().replace(regexpFind, replace);
  });

  files.on('end', function () {
    fs.writeFile(file, newCss, function (err) {
      if (err) {
        return console.log(err);
      } else {
       console.log('Updated!');
      }
    });
  });
  console.log(regexpFind, replace);
};


function getExtension(filename) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}

//рекурсивный обход
var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;

      fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {
            console.log('analyze directory');
            walk(file, function (err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            
            console.log('analyze file');
            if (extensionsToIgnore.some(ext => getExtension(file) === ext)) {
              console.log('!image, should be ignored');
            } else {
              console.log('not image, start processing');
              console.log(file);
              
              results.push(file);
              
              Object.keys(replacersFromFile).forEach((key) => {
                const from = new RegExp(key, 'g'); //key;
                const to = replacersFromFile[key];
                console.log(`replacing "${from}" -> "${to}" -> "${file}" `);
                searchAndReplaceFile(from, to, file);
                //searchAndReplaceFile(new RegExp(from, 'g'), to, file);
              }); 
              next();
              //searchReplaceFile(/dog/g, 'cat', file);
            }
          }
        },
      );
    })();
  });
};

walk(directory, function (err, results) {
  if (err) throw err;
  console.log(results);
});
