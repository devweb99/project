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

var config = _interopRequireWildcard(require("./config"));

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(async () => {
  new Promise(function (resolve, reject) {
    unpack(() => {
      resolve();
    });
  }).then(() => {
    return groupJsonFromId();
  }).then(data => {
    console.log(data);
  });
  /*    promise.then((items)=>{
          mongoose.connect(config.mongodb.connect, {useNewUrlParser: true, useUnifiedTopology: true});
  
          const Schema = mongoose.Schema
  
          const sellerScheme = new Schema({
              _id: Number,
              sellers: Array,
              data: Array
          })
  
          const Seller = mongoose.model(config.mongodb.collection, sellerScheme)
  
          for (let item of items) {
              let seller = new Seller({
                  _id: item.id,
                  sellers: item.sellers,
                  data: item.data
              })
  
              let query = Seller.findOne({_id: item.id}).exec()
      
              return query;
              if (!find) {
                  console.log(1)
                  seller.save()
              }
          }
      })
  
      promise.then((data) => {
          console.log(data)
      })*/
})();

async function groupJsonFromId() {
  const readdir = util.promisify(fs.readdir),
        items = await readdir(config.to);

  const response = await got('http://api.comtrading.ua/feed').json(),
        data = _.groupBy(response, 'id');

  let result = [];

  for (let i = 0; i < items.length; i++) {
    const json = await fs.readFileSync(config.to + '/' + items[i]).toString().split(/(?={")/).map(x => JSON.parse(x))[0];

    if (json) {
      let groups = _.groupBy(json, 'prod_id'),
          keys = await Object.keys(groups);

      for (let key of keys) {
        let jnew = {
          id: key,
          sellers: groups[key],
          data: data[key]
        };
        result.push(jnew);
      }

      return result;
      /*    for (let j=0; j < keys.length; j++) { 
              let jnew = JSON.stringify({
                  id: keys[j],
                  sellers: groups[keys[j]],
                  data: data[keys[j]]
              })
           }*/
    }
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