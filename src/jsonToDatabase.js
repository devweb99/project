import * as fs from 'fs'
import * as tar from 'targz'
import * as util from 'util'
import * as promise from 'promise'
import * as _ from 'lodash'
import * as got from 'got'
import * as config from './unpackConfig'
import mongoose from 'mongoose'


(async () => {
    let promise = new Promise(function (resolve, reject) {
        unpack(() => resolve(groupJsonFromId()))
    })

    promise.then((items)=>{
        mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

        const Schema = mongoose.Schema

        const sellerScheme = new Schema({
            _id: Number,
            sellers: Array,
            data: Array
        }, {_id: false})

        const Seller = mongoose.model("sellers", sellerScheme)

        for (let item of items) {
            let seller = new Seller({
                _id: item.id,
                sellers: item.sellers,
                data: item.data
            })

            seller.save(function (err) {
                if (err) return handleError(err);
            })
        }

        console.log('done')
    })

})()

async function groupJsonFromId (callback) {
    const readdir = util.promisify(fs.readdir),
          items = await readdir(config.to)  
    
    const response = await got('http://api.comtrading.ua/feed').json(),
          data = _.groupBy(response, 'id') 

    let result = []

    for (let i=0; i < items.length; i++) {
        const json = await (fs.readFileSync(config.to + '/' + items[i])
            .toString()
            .split(/(?={")/)
            .map(x => JSON.parse(x)))[0]

        if (json) {
            let groups = await _.groupBy(json, 'prod_id'),
                keys = await Object.keys(groups)

            for (let j=0; j < keys.length; j++) { 
                result.push({
                    id: keys[j],
                    sellers: groups[keys[j]],
                    data: data[keys[j]]
                })
            }
        }

        return await result
    }
}

async function unpack (callback) {
    const readdir = util.promisify(fs.readdir),
          items = await readdir(config.tar)

    for (let i=0; i<items.length; i++) {
        if (items[i].indexOf('sellers') != -1) {
            tar.decompress({
                src: config.tar + '/' + items[i],
                dest: config.to,
                tar: {
                    map: function(header) {
                        header.name = items[i].replace(/tar\.gz/g,"json")
                    }
                }
            }, function(err){
                if (err) throw err

                callback()
            })
        }
    }
}




