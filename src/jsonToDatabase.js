import * as fs from 'fs'
import * as tar from 'targz'
import * as util from 'util'
import * as promise from 'promise'
import * as _ from 'lodash'
import * as got from 'got'
import * as config from './config'
import mongoose from 'mongoose'


(async () => {
    new Promise(function(resolve, reject) {
        unpack(() => {
            resolve()
        })
    }).then(() => {
        return groupJsonFromId()
    }).then(data => {
        console.log(data)
    })
      

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
})()

async function groupJsonFromId () {
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
            let groups =  _.groupBy(json, 'prod_id'),
                keys = await Object.keys(groups)

            for (let key of keys) {
                let jnew = {
                    id: key,
                    sellers: groups[key],
                    data: data[key]
                }

                result.push(jnew)
            }

            return result

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




