"use strict";

require("core-js/modules/es.string.replace.js");

const fs = require('fs');

const tar = require('tar');

const replace = require('batch-replace');

const config = {
  tar: '../_json_backup',
  to: '../jsons',
  defaultNameJson: '/sellers.json'
};
fs.readdir(config.tar, function (err, items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].indexOf('sellers') != -1) {
      fs.createReadStream(config.tar + '/' + items[i]).pipe(tar.x({
        sync: true,
        strip: 2,
        C: config.to,
        transform: e => {
          let nameJson = items[i].replace(/tar\.gz/g, "json");
          fs.rename(config.to + config.defaultNameJson, config.to + '/' + nameJson, err => {
            if (err) throw err;
          });
        }
      }));
    }
  }
});