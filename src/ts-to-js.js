#!/usr/bin/env node
var dir = require('node-dir');
const fs = require('fs');

async function run() {

  dir.readFiles(__dirname, {
    excludeDir: ['node_modules'],
    match: /\.(ts|tsx)$/,
    }, function(err, content, filename, next) {
        if (err) throw err;
        
        const response = fetch('https://transform.tools/api/typescript-to-javascript', {
          method: "POST",
          body: content,
        }).then((response) => {
          response.text().then((value) => {

            fs.writeFile(filename, value, err => {
              if (err) {
                console.error(err);
              }
            });

          })
        })
        
        next();
    },
    function(err, files){
        if (err) throw err;
        console.log('finished reading files:');
    });


}
run();