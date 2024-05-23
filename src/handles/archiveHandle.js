/**
 * @description 文件归档，传入 处理后的文件的对象，依据传入的值进行归档
 * @param {fileClass} file
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
function archiveHandle(file, callback = () => { }) {

    if (!file._isInit) return ""
    console.log(file)
    let fileObject = file.toObject()

    /** `归档目录/JSON数据库/YYYYMM.json` 文件路径 */
    let yyyymmpath = path.join(ARCHIVE_DIR, 'JSON_Databases', `${file.date}.json`)

    // 判断是否有归档目录，没有则初始化
    if (!fs.existsSync(file.archiveData.dir)) {
        folder.accessingPath(file.archiveData.dir)
        fs.writeFileSync(yyyymmpath, "{}")
    }

    if (!fs.existsSync(file.archiveData.filePath)) {
        // 拷贝文件
        archive.copyFile(file.rawData.filePath, file.archiveData.filePath)
    }
    // 更新 归档目录/JSON数据库/YYYYMM.json
    archive.updateFileJSON(yyyymmpath, fileObject)
    // 更新 归档目录/JSON数据库/count.json
    archive.updateCountJSON(path.join(ARCHIVE_DIR, 'JSON_Databases', 'count.json'), fileObject)
    archive.insertFileSQLite(ARCHIVE_DIR, file)

    // 归档完成后的勾子
    callback(file)
}

export default archiveHandle