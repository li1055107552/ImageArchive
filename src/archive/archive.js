import fs from 'fs'
import path from 'path'
import conf from '../config.js'
import folder from '../utils/folder.js'
import fileClass from '../utils/fileClass.js'
import utils from "../utils/util.js"
import archive from '../utils/archive.js'
let {
    WORKING_DIR,
    ARCHIVE_DIR,
    DelOriginFile,
    CreateShortcut,
    ChangeRawName,
} = conf

/**
 * @description 处理文件
 * @param {path} fullpath 文件绝对路径
 * @returns {fileClass} 文件对象 
 */
async function fileHandle(fullpath) {

    let myFile = new fileClass()
    if (fileClass.isShotLink(fullpath)) {
        console.log(`快捷方式: ${fullpath}`);
        return myFile
    }
    if (fileClass.isArchived(fullpath)) {
        console.log(`已归档: ${fullpath}`);
        return myFile
    }
    if (fileClass.isExceedMaxSize(fullpath)) {
        console.log(`文件过大: ${fullpath}`);
        return myFile
    }

    myFile.createFile(fullpath)
    if (myFile.archiveData.extName == "") {
        // 文件为音频/视频文件

        // console.log(fs.statSync(fullpath, {bigint:true}))
        // let file = fs.statSync(fullpath)
        // console.log(file,fullpath)

        /** 判断不出是什么类型的，直接跳过 不做处理 */
        myFile._isInit = false
        return myFile
    }

    // 文件为图片，则执行以下操作
    let startDate = new Date(myFile.modify)
    let YYYY = utils.time.getYYYY(startDate)
    let MM = utils.time.getMM(startDate)

    myFile.rawData.dir = WORKING_DIR
    myFile.archiveData.dir = path.join(ARCHIVE_DIR, YYYY, MM)
    // myFile.archiveData.filePath = ""   // 文件归档绝对路径
    // myFile.archiveData.fileName = ""   // 文件名(含后缀)
    myFile.lables = folder.getChildPath(WORKING_DIR, fullpath)
    myFile.md5 = await fileClass.getFileMD5(fullpath)
    myFile.type = `Image`
    myFile.date = YYYY + MM

    /** 时间戳-[标签]-md5-归档名 */
    myFile.archiveData.fileName = [
        myFile.modify,
        `[${myFile.lables.join(",")}]`, // [标签1,标签2,标签3]
        myFile.md5,
        myFile.rawData.fileName.replace(myFile.rawData.extName, myFile.archiveData.extName)
    ].join("-")
    myFile.archiveData.filePath = path.join(myFile.archiveData.dir, myFile.archiveData.fileName)
    console.log(myFile)
    return myFile
}

/**
 * @description 文件归档，传入 处理后的文件的对象，依据传入的值进行归档
 * @param {fileClass} file
 * @param {Object} fileJSON 
 * @param {String} fileJSON.originName - 原命名 
 * @param {String} fileJSON.archiveName - 现命名（归档命名）
 * @param {String} fileJSON.originPath - 原路径
 * @param {String} fileJSON.archivePath - 归档路径
 * @param {String} fileJSON.lables - 标签
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
        // 更新 归档目录/JSON数据库/YYYYMM.json
        archive.updateFileJSON(yyyymmpath, fileObject)
        // 更新 归档目录/JSON数据库/count.json
        archive.updateCountJSON(path.join(ARCHIVE_DIR, 'JSON_Databases', 'count.json'), fileObject)
    }

    // 归档完成后的勾子
    callback(file)
}

/**
 * @description 文件归档后的 后处理
 * @param {fileClass} myfile fileClass
 */
function afterArchive(myfile) {
    console.log(myfile)
    // 是否删除源文件
    if (DelOriginFile) {
        fs.rmSync(myfile.rawData.filePath)
        console.log(`已删除源文件: ${myfile.rawData.filePath}`)
    }
    // 是否生成快捷方式
    if (CreateShortcut) {
        archive.createShortcuts(myfile.archiveData.filePath, myfile.rawData.filePath + ".lnk")
    }
    // 是否改名
    if (!DelOriginFile && ChangeRawName) {
        // 已归档的文件，对源文件的命名进行更改 以便区分 暂不删除源文件
        let dirName = path.dirname(myfile.rawData.filePath)
        let newName = `已归档 - ${myfile.rawData.fileName}`
        let newPath = path.join(dirName, newName)
        fs.renameSync(myfile.rawData.filePath, newPath)
    }

}

export {
    fileHandle, 
    archiveHandle,
    afterArchive
}