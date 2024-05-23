import fs from "fs"
import path from "path"

import file from "../file/file.js"
import folder from "../utils/folder.js"
import json from "../archive/json/json.js"
import sqlite from "../archive/sqlite/sqlite.js"

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
function archiveHandle(myfile, callback = () => { }) {

    if (!myfile._isInit) return ""
    console.log(myfile)
    let fileObject = myfile.toObject()

    /** `归档目录/JSON数据库/YYYYMM.json` 文件路径 */
    let yyyymmpath = path.join(ARCHIVE_DIR, 'JSON_Databases', `${myfile.date}.json`)

    // 判断是否有归档目录，没有则初始化
    if (!fs.existsSync(myfile.archiveData.dir)) {
        folder.accessingPath(myfile.archiveData.dir)
        fs.writeFileSync(yyyymmpath, "{}")
    }

    if (!fs.existsSync(myfile.archiveData.filePath)) {
        // 拷贝文件
        file.copyFile(myfile.rawData.filePath, myfile.archiveData.filePath)
    }
    // 更新 归档目录/JSON数据库/YYYYMM.json
    json.updateFileJSON(yyyymmpath, fileObject)
    // 更新 归档目录/JSON数据库/count.json
    json.updateCountJSON(path.join(ARCHIVE_DIR, 'JSON_Databases', 'count.json'), fileObject)
    sqlite.insertOne(ARCHIVE_DIR, myfile)
    
    // 归档完成后的勾子
    callback(myfile)
}

export default archiveHandle