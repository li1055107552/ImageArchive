import fs from "fs"
import path from "path"
import file from "../file/file.js"
import folder from "../utils/folder.js"
import { readJSON } from "../archive/json/json.js"
import { ARCHIVE_DIR, WORKING_DIR } from "../config.js"
import { getImagesAllRows } from "../archive/sqlite/sqlite.js"

/**
 * @description 根据JSON数据库 从归档还原文件
 * @param {path} working_dir 工作目录，默认`WORKING_DIR`
 */
export function revertStart_fromJSON(working_dir = WORKING_DIR) {
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
        file.copyFile(item.archiveData.filePath, save_filePath)
        console.log("revert: ", item.archiveData.filePath, "--->", save_filePath)
    })

    console.log('finish')
}

/**
 * @description 根据JSON数据库 从归档生成快捷方式
 * @param {path} working_dir 工作目录，默认`WORKING_DIR`
 */
export function revertShortcut_fromJSON(working_dir = WORKING_DIR) {
    readJSON((item) => {
        if (fs.existsSync(item.archiveData.filePath)) {
            let dir = path.join(working_dir, ...item.labels)
            folder.accessingPath(dir)
            let save_filePath = path.join(dir, item.rawData.fileName + '.lnk')
            file.createShortcuts(item.archiveData.filePath, save_filePath)
        }
    })
}

/**
 * @description 根据SQLite数据库，从归档还原文件到指定目录
 * @param {path} archive_dir 新的归档目录，默认 ***不是*** `ARCHIVE_DIR`
 * - 若归档目录未发生变化，则不需要填写，会根据 **数据库中的信息** 查找源文件
 * - 若归档目录发生变化，则需要填写，会根据传入的路径查找源文件
 * @param {path} working_dir 生成到指定目录，默认`WORKING_DIR`
 * @returns {Promise<void>}
 */
export async function revertFile_fromSQLite(archive_dir = "", working_dir = WORKING_DIR) {
    let filePath_archive = function(){
        return archive_dir === "" ? 
        (item) => item.filePath_archive :
        (item) => path.join(archive_dir, item.date.slice(0,4), item.date.slice(4), item.fileName_archive)
    }()
    return getImagesAllRows().then((rows) => {
        rows.forEach((item) => {
            item.filePath_archive = filePath_archive(item)
            
            // 判断归档文件是否存在
            if(!fs.existsSync(item.filePath_archive)){
                console.log(`${item.filePath_archive} is not existed.`);
                return `${item.filePath_archive} is not existed.`
            } 

            // 得到 还原的文件 存放目录
            let labels = item.labels.split(',')
            let dir = path.join(working_dir, ...labels)
            folder.accessingPath(dir)
            
            // 得到 还原的文件 名称和绝对路径
            let index = 2
            let ext = item.extName_raw
            let name = item.fileName_raw.replace(ext, "")
            let save_filePath = path.join(dir, name + ext)
            while (fs.existsSync(save_filePath)) {
                save_filePath = path.join(dir, name + `(${index++})` + ext)
            }

            // 从归档 复制源文件 还原到 指定目录
            // file.copyFile(item.filePath_archive, save_filePath)
            console.log("revert: ", save_filePath)
        })
        return null
    }).catch((err) => {
        console.log(err)
        return err
    })
}

/**
 * @description 根据SQLite数据库，生成`归档文件的快捷方式`到 指定目录
 * @param {path} archive_dir 新的归档目录
 * - 若归档目录未发生变化，则不需要填写，会根据数据库中的信息查找源文件
 * - 若归档目录发生变化，则需要填写，会根据传入的路径查找源文件
 * @param {path} working_dir 生成到指定目录，默认`WORKING_DIR`
 * @returns {Promise<void>}
 */
export async function revertShortcut_fromSQLite(archive_dir = "", working_dir = WORKING_DIR) {
    let filePath_archive = function(){
        return archive_dir === "" ? 
        (item) => item.filePath_archive :
        (item) => path.join(archive_dir, item.date.slice(0,4), item.date.slice(4), item.fileName_archive)
    }()
    return getImagesAllRows().then((rows) => {
        rows.forEach((item) => {
            item.filePath_archive = filePath_archive(item)
            
            // 判断归档文件是否存在
            if(!fs.existsSync(item.filePath_archive)){
                console.log(`${item.filePath_archive} is not existed.`);
                return `${item.filePath_archive} is not existed.`
            } 

            // 得到 快捷方式 生成目录
            let labels = item.labels.split(',')
            let dir = path.join(working_dir, ...labels)
            folder.accessingPath(dir)
            
            // 得到 快捷方式 绝对路径
            let save_filePath = path.join(dir, item.fileName_raw + '.lnk')

            // 从归档 生成源文件快捷方式 到 指定目录
            file.createShortcuts(item.filePath_archive, save_filePath)
            console.log("revert: ", save_filePath)
        })
        return null
    }).catch((err) => {
        console.log(err)
        return err
    })
}

export default {
    /** 根据JSON数据库 从归档还原文件 */
    revertStart_fromJSON,
    /** 根据JSON数据库 从归档生成快捷方式 */
    revertShotcut_fromJSON,
    /** 根据SQLite数据库，从归档还原文件到指定目录 */
    revertFile_fromSQLite,
    /** 根据SQLite数据库，生成`归档文件的快捷方式`到 指定目录 */
    revertShortcut_fromSQLite
}