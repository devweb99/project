"use strict";

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.to-string.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.string.split.js");

require("core-js/modules/web.dom-collections.iterator.js");

var fs = _interopRequireWildcard(require("fs"));

var tar = _interopRequireWildcard(require("targz"));

var util = _interopRequireWildcard(require("util"));

var promise = _interopRequireWildcard(require("promise"));

var _ = _interopRequireWildcard(require("lodash"));

var got = _interopRequireWildcard(require("got"));

var config = _interopRequireWildcard(require("./unpackConfig"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(async () => {
  let promise = new Promise(function (resolve, reject) {
    unpack(() => resolve(groupJsonFromId()));
  });
  promise.then(items => {
    for (let item of items) {
      if (item.id == 33383) {
        console.log(item);
      }
    }
  });
})();

async function groupJsonFromId(callback) {
  const readdir = util.promisify(fs.readdir),
        items = await readdir(config.to);

  const response = await got('http://api.comtrading.ua/feed').json(),
        data = _.groupBy(response, 'id');

  let result = [];

  for (let i = 0; i < items.length; i++) {
    const json = await fs.readFileSync(config.to + '/' + items[i]).toString().split(/(?={")/).map(x => JSON.parse(x))[0];

    if (json) {
      let groups = await _.groupBy(json, 'prod_id'),
          keys = await Object.keys(groups);

      for (let j = 0; j < keys.length; j++) {
        result.push({
          id: keys[j],
          sellers: groups[keys[j]],
          data: data[keys[j]]
        });
      }
    }

    return await result;
  }
}

async function unpack(callback) {
  const readdir = util.promisify(fs.readdir),
        items = await readdir(config.tar);

  for (let i = 0; i < items.length; i++) {
    if (items[i].indexOf('sellers') != -1) {
      tar.decompress({
        src: config.tar + '/' + items[i],
        dest: config.to,
        tar: {
          map: function map(header) {
            header.name = items[i].replace(/tar\.gz/g, "json");
          }
        }
      }, function (err) {
        if (err) throw err;
        callback();
      });
    }
  }
}