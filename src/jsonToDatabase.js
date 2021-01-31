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
                tar: {
                    map: function(header) {
                        header.name = items[i].replace(/tar\.gz/g,"json")
                    }
                }
            }, function(err){
                if(err) {
                    console.log(err)
                } else {
                    console.log("Done!")
                }
            })
        }
    }
}





