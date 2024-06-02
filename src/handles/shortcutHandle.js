import fs from "fs"
import file from "../file/file.js"
import folder from "../utils/folder.js"
import { ARCHIVE_DIR, WORKING_DIR } from "../config.js"

function listenShortCut(archive_dir = ARCHIVE_DIR, working_dir = WORKING_DIR) {

    let shortcut_pathArr = folder.listfile(working_dir).filter(filePath => {
        return file.isShotLink(filePath)
    })
    let shortcuts = []

    shortcut_pathArr.forEach(filePath => {
        shortcuts.push(file.getShortcutsMsg(filePath))
    })

    Promise.all(shortcuts).then(res => {
        console.log(res)
        for (let i = 0; i < res.length; i++) {
            const info = res[i];
            res[i] = {
                origin: info.origin,
                target: info.target,
                icon: info.icon,
                hotkey: info.hotkey,
                workingDir: info.workingDir,
                runStyle: info.runStyle,
                desc: info.desc
            }
        }
        console.log(res)
        // console.log(shortcut);
        // console.log('Target:', shortcut.target);
        // console.log('Arguments:', shortcut.args);
        // console.log('Description:', shortcut.desc);
        // console.log('Icon Path:', shortcut.icon);
        // console.log('Working Directory:', shortcut.workingDir);
        console.log('finish')
    })
}

export default listenShortCut
listenShortCut()