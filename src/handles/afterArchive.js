import fs from "fs"
import path from "path"
import file from "../file/file.js"
import { DelOriginFile, CreateShortcut, ChangeRawName } from "../config.js"
import {insertOneShortcut} from "../archive/sqlite/sqlite.js"

/**
 * @description 文件归档后的 后处理
 * @param {fileClass} myfile fileClass
 */
function afterArchive(myfile) {
    // console.log("afterArchive", myfile)
    // 是否删除源文件
    if (DelOriginFile) {
        fs.rmSync(myfile.rawData.filePath)
        console.log(`已删除源文件: ${myfile.rawData.filePath}`)
    }
    // 是否生成快捷方式
    if (CreateShortcut) {
        file.createShortcuts(myfile.archiveData.filePath, myfile.rawData.filePath + ".lnk")
        insertOneShortcut({
            md5: myfile.md5,
            origin: myfile.rawData.filePath + ".lnk",
            target: myfile.archiveData.filePath,
            hotkey: 0,
            runStyle: 1,
            icon: "",
            desc: "",
            workingDir: path.dirname(myfile.rawData.filePath)
        })
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

export default afterArchive