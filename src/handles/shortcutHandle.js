import fs from "fs"
import file from "../file/file.js"
import folder from "../utils/folder.js"
import { ARCHIVE_DIR, WORKING_DIR } from "../config.js"

function listenShortCut(archive_dir = ARCHIVE_DIR, working_dir = WORKING_DIR){

    let shortcut_pathArr = folder.listfile(working_dir).filter(filePath => {
        return file.isShotLink(filePath)
    })
    let shortcuts = []

    shortcut_pathArr.forEach(filePath => {
        shortcuts.push(file.getShortcutsMsg(filePath))
    })

    Promise.all(shortcuts).then(res => {
        console.log(res)
        fs.writeFileSync("./test.txt", res[0].target, "utf8")
        console.log('finish')
    })
}

export default listenShortCut