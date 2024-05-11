import fs from 'fs'
import path from 'path'
import conf from './config.js'
import folder from './utils/folder.js'
import archive from './utils/archive.js'
import {
    fileHandle,
    archiveHandle,
    afterArchive
} from "./archive/archive.js"

let {
    WORKING_DIR,
    ARCHIVE_DIR,
} = conf

console.log(process.version)

// 将旧的json数据库 迁移至新的，用新的数据结构存储
function old_to_new() {
    const list = folder.listfile("G:/图片-视频归档/JSON_Databases_old")
    list.pop()

    for (let i = 0; i < list.length; i++) {
        const jsonfile = list[i];

        let obj = JSON.parse(fs.readFileSync(jsonfile, "utf-8"))
        // console.log(obj)

        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const items = obj[key];

                for (let k = 0; k < items.length; k++) {
                    const item = items[k];
                    let newobj = {
                        "rawData": {
                            "dir": "H:/",
                            "filePath": item.originPath,
                            "fileName": item.originName,
                            "extName": path.extname(item.originPath)
                        },
                        "archiveData": {
                            "dir": item.archivePath,
                            "filePath": path.join(item.archivePath, `${item.modify}-[${item.lables.join(",")}]-${item.md5}-${item.archiveName}`),
                            "fileName": `${item.modify}-[${item.lables.join(",")}]-${item.md5}-${item.archiveName}`,
                            "extName": "." + item.type.split("_")[1]
                        },
                        "lables": item.lables,
                        "md5": item.md5,
                        "type": "Image",
                        "modify": item.modify,
                        "date": item.date
                    }
                    obj[key][k] = newobj
                }
            }
        }
        let save = path.join('G:/图片-视频归档/JSON_Databases/', path.basename(jsonfile))
        console.log(save)
        fs.writeFileSync( 
            save,
            JSON.stringify(obj, null, 2),
            "utf8"
        )
    }


    console.log('finish')
}

async function main() {
    /** 忽略的文件夹 */
    global.ignore = ["Music", "音频", "视频", "压缩包", "分类整理", "$RECYCLE.BIN", "System Volume Information", ".git", "node_modules", "back", "font"]

    /** 进行归档的 */
    // init()
    // archiveStart()

    /** 归档还原 从归档目录+名字还原 || 从Databases+归档目录还原 */
    // revertStart()
    old_to_new()
}

// main()

folder.accessingPath("C://snapshot//ImageArchive//node_modules//windows-shortcuts//lib//shortcut")