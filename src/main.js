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

/** 项目初始化 */
function init() {
    // 归档目录，不存在则创建
    folder.accessingPath(ARCHIVE_DIR)

    // 归档目录/JSON数据库/ 不存在则创建
    let JSON_Databases = path.join(ARCHIVE_DIR, 'JSON_Databases')
    folder.accessingPath(JSON_Databases)

    // 归档目录/JSON数据库/count.js文件，不存在则创建
    let countFilePath = path.join(JSON_Databases, 'count.json')
    if (!fs.existsSync(countFilePath)) {
        console.log(`${countFilePath} 不存在`);
        fs.writeFileSync(countFilePath, "{}")
        console.log(`${countFilePath} 创建成功`);
    }
}

/** 进行归档的 */
function archiveStart() {
    let WORKING_DIR_FILES = folder.listfile(WORKING_DIR, true, ignore, async (fullpath, isDirectory) => {
        if (isDirectory) return null
        // 处理文件，得到文件对象
        const myfile = await fileHandle(fullpath)
        // 将文件对象进行归档
        archiveHandle(myfile, afterArchive)
    })
}

/** 归档还原 */
function revertStart() {
    const JSON_Databases = path.join(ARCHIVE_DIR, "JSON_Databases")
    let fileList = folder.listfile(JSON_Databases, true, ignore,
        // async (fullpath, isDirectory) => {
        //     if (isDirectory) return null
        //     // 处理文件，得到文件对象
        //     const myfile = await fileHandle(fullpath)
        //     // 将文件对象进行归档
        //     archiveHandle(myfile, afterArchive)
        // }
    )
    console.log(fileList)
    const data = new Map()

    fileList.pop() // 把count.js剔除
    for (let i = 0; i < fileList.length; i++) {
        // JSON文件的路径
        const filepath = fileList[i];
        let obj = JSON.parse(fs.readFileSync(filepath))

        // 该JSON文件包含的所有md5字段
        for (const md5 in obj) {

            let files = obj[md5]
            // console.log(files)
            // 同个md5下的所有item  obj[md5]是一个对象数组
            for (const item of files) {

                // console.log(item)

                // 归档文件存在 && 回档文件夹存在
                if (fs.existsSync(item.archiveData.filePath)) {
    
                    let index = 2
                    let dir = path.join(WORKING_DIR, ...item.lables)
                    let ext = item.rawData.extName
                    let name = path.basename(item.rawData.fileName).replace(ext,"")
                    console.log(dir)
                    folder.accessingPath(dir)
                    let save_filePath = path.join(dir, name + ext)
                    while(fs.existsSync(save_filePath)){
                        save_filePath = path.join(dir, name + `(${index++})` + ext)
                    }
                    archive.copyFile(item.archiveData.filePath, save_filePath)
                    console.log("revert: ", item.archiveData.filePath, "--->", save_filePath)
                }
                continue
            }

            // if(data.has(md5)){
            //     data.set(md5, data.get(md5).push(detail))
            // } else {
            //     data.set(md5, detail)
            // }
        }
    }
    console.log(data)

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

}

main()
// WORKING_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img"
// ARCHIVE_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\archive_test"
// fileHandle("E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\wmr\\jk\\微信图片_20221214213634.png")

console.log('finish')