import * as fs from 'fs'
import * as tar from 'targz'
import * as util from 'util'
import * as config from './unpackConfig'

(async () => {
    unpack()
})()

async function unpack () {
    const readdir = util.promisify(fs.readdir),
          items = await readdir(config.tar)

    for (let i=0; i<items.length; i++) {
        if (items[i].indexOf('sellers') != -1) {
            tar.decompress({
                src: config.tar,
                dest: config.to,
                // tar: {
                //     map: function(header) {
                //         console.log(header)
                //     }
                // }
            }, function(err){
                if(err) {
                    console.log(err)
                } else {
                    console.log("Done!")
                }
            })


            // fs.createReadStream(config.tar + '/' + items[i])
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





