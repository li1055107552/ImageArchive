import fs from "fs"
import path from "path"

import file from "../file/file.js"
import folder from "../utils/folder.js"
import json from "../archive/json/json.js"
import sqlite from "../archive/sqlite/sqlite.js"
import fileHandle from "./fileHandle.js"
import afterArchive from "./afterArchive.js"

import { ARCHIVE_DIR, WORKING_DIR } from "../config.js"
import time from "../utils/time.js"

/**
 * @description 文件归档，传入 处理后的文件的对象，依据传入的值进行归档
 * @param {fileClass} myfile
 * @param {Object} fileJSON 
 * @param {String} fileJSON.originName - 原命名 
 * @param {String} fileJSON.archiveName - 现命名（归档命名）
 * @param {String} fileJSON.originPath - 原路径
 * @param {String} fileJSON.archivePath - 归档路径
 * @param {String} fileJSON.labels - 标签
 * @param {String} fileJSON.md5 - MD5
 * @param {String} fileJSON.type - 文件类型
 * @param {String} fileJSON.modify - 时间戳
 * @param {String} fileJSON.date - 日期，年月
 * @returns {void}
 */
export function archiveHandle(myfile, callback = () => { }) {

    // console.log("archiveHandle", myfile)

    if (!myfile._isInit) return ""

    // let fileObject = myfile.toObject()

    // /** `归档目录/JSON数据库/YYYYMM.json` 文件路径 */
    // let yyyymmpath = path.join(ARCHIVE_DIR, 'JSON_Databases', `${myfile.date}.json`)

    // 判断是否有归档目录，没有则初始化
    if (!fs.existsSync(myfile.archiveData.dir)) {
        folder.accessingPath(myfile.archiveData.dir)
        // fs.writeFileSync(yyyymmpath, "{}")
    }

    if (!fs.existsSync(myfile.archiveData.filePath)) {
        // 拷贝文件
        file.copyFile(myfile.rawData.filePath, myfile.archiveData.filePath)
    }
    // // 更新 归档目录/JSON数据库/YYYYMM.json
    // json.updateFileJSON(yyyymmpath, fileObject)
    // // 更新 归档目录/JSON数据库/count.json
    // json.updateCountJSON(path.join(ARCHIVE_DIR, 'JSON_Databases', 'count.json'), fileObject)
    sqlite.insertOneImages(myfile)
    
    // 归档完成后的勾子
    callback(myfile)
}

/** 进行归档的 */
export async function archiveStart() {
    let t1 = Date.now()
    console.log("startTime: ", t1)
    let WORKING_DIR_FILES = folder.listfile(WORKING_DIR, true, ignore || [], async (fullpath, isDirectory) => {
        // if (isDirectory) return null
        // // 处理文件，得到文件对象
        // const myfile = await fileHandle(fullpath)
        // // 将文件对象进行归档
        // archiveHandle(myfile, afterArchive)
    })
    console.log("文件数量：", WORKING_DIR_FILES.length)

    for (let i = 0; i < WORKING_DIR_FILES.length; i++) {
        const fullpath = WORKING_DIR_FILES[i];
        const myfile = await fileHandle(fullpath)
        archiveHandle(myfile, afterArchive)
    }
    console.log("总耗时:", time.formatTimeStamp(Date.now() - t1))
    
}

export default {
    archiveStart,
    archiveHandle
}