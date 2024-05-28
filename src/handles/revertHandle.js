import fs from "fs"
import path from "path"
import { readJSON } from "../archive/json/json.js"
import archive from "../file/file.js"
import folder from "../utils/folder.js"
import { WORKING_DIR } from "../config.js"

/** 归档还原 */
export function revertStart(working_dir) {
    working_dir = working_dir || WORKING_DIR
    readJSON((item) => {
        let index = 2
        let dir = path.join(working_dir, ...item.labels)
        let ext = item.rawData.extName
        let name = path.basename(item.rawData.fileName).replace(ext, "")
        console.log(dir)
        folder.accessingPath(dir)
        let save_filePath = path.join(dir, name + ext)
        while (fs.existsSync(save_filePath)) {
            save_filePath = path.join(dir, name + `(${index++})` + ext)
        }
        archive.copyFile(item.archiveData.filePath, save_filePath)
        console.log("revert: ", item.archiveData.filePath, "--->", save_filePath)
    })

    console.log('finish')
}

/** 归档还原快捷方式 */
export function revertShotLink(working_dir) {
    working_dir = working_dir || WORKING_DIR
    readJSON((item) => {
        if (fs.existsSync(item.archiveData.filePath)) {
            let dir = path.join(working_dir, ...item.labels)
            folder.accessingPath(dir)
            let save_filePath = path.join(dir, item.rawData.fileName + '.lnk')
            archive.createShortcuts(item.archiveData.filePath, save_filePath)
        }
    })
}

export default {
    revertStart,
    revertShotLink
}