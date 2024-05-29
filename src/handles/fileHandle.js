import path from "path"
import file from "../file/file.js"
import fileClass from "../file/fileClass.js";
import folder from "../utils/folder.js";
import time from "../utils/time.js"
import {WORKING_DIR, ARCHIVE_DIR} from "../config.js"

/**
 * @description 处理文件
 * @param {path} fullpath 文件绝对路径
 * @returns {fileClass} 文件对象 
 */
async function fileHandle(fullpath) {

    let myFile = new fileClass()
    if (file.isShotLink(fullpath)) {
        console.log(`快捷方式: ${fullpath}`);
        return myFile
    }
    if (file.isArchived(fullpath)) {
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

        /** 判断不出是什么类型的，直接跳过 不做处理 */
        myFile._isInit = false
        return myFile
    }

    // 文件为图片，则执行以下操作
    let startDate = new Date(myFile.modify)
    let YYYY = time.getYYYY(startDate)
    let MM = time.getMM(startDate)

    myFile.rawData.dir = WORKING_DIR
    myFile.archiveData.dir = path.join(ARCHIVE_DIR, YYYY, MM)
    // myFile.archiveData.filePath = ""   // 文件归档绝对路径
    // myFile.archiveData.fileName = ""   // 文件名(含后缀)
    myFile.labels = folder.getChildPath(WORKING_DIR, fullpath)
    myFile.md5 = await file.getFileMD5(fullpath)
    myFile.type = `Image`
    myFile.date = YYYY + MM

    /** 时间戳-[标签]-md5-归档名 */
    myFile.archiveData.fileName = [
        myFile.modify,
        // `[${myFile.labels.join(",")}]`, // [标签1,标签2,标签3]   // 这个注释掉，即可实现归档目录下的去重
        myFile.md5,
        myFile.rawData.fileName.replace(myFile.rawData.extName, myFile.archiveData.extName)
    ].join("-")
    myFile.archiveData.filePath = path.join(myFile.archiveData.dir, myFile.archiveData.fileName)
    console.log(myFile)
    return myFile
}

export default fileHandle