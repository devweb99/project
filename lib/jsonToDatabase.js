"use strict";

require("core-js/modules/es.promise.js");

require("core-js/modules/es.string.replace.js");

var fs = _interopRequireWildcard(require("fs"));

var tar = _interopRequireWildcard(require("targz"));

var util = _interopRequireWildcard(require("util"));

var config = _interopRequireWildcard(require("./unpackConfig"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(async () => {
  unpack();
})();

async function unpack() {
  const readdir = util.promisify(fs.readdir),
        items = await readdir(config.tar);

  for (let i = 0; i < items.length; i++) {
    if (items[i].indexOf('sellers') != -1) {
      tar.decompress({
        src: config.tar,
        dest: config.to,
        tar: {
          map: function map(header) {
            header.name = items[i].replace(/tar\.gz/g, "json");
          }
        }
      }, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Done!");
        }
      }); // fs.createReadStream(config.tar + '/' + items[i])
      //     .pipe(tar.x({
      //         sync: true,
      //         strip: 2,
      //         C: config.to,
      //         transform: (e) => {
      //             let nameJson = items[i].replace(/tar\.gz/g,"json")
      //
      //             fs.rename(config.to + config.defaultNameJson, config.to + '/' + nameJson, (err) => { if (err) throw err })
      //         }
      //     }))
    }
  }
}