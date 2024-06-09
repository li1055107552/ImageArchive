import fs from "fs"
import path from "path"
import file from "../file/file.js"
import folder from "../utils/folder.js"
import { ARCHIVE_DIR, WORKING_DIR } from "../config.js"
import sqlite from "../archive/sqlite/sqlite.js"

function listenShortcut(archive_dir = ARCHIVE_DIR, working_dir = WORKING_DIR) {

    let shortcut_pathArr = folder.listfile(working_dir, true).filter(filePath => {
        return file.isShortcut(filePath)
    })
    let shortcuts = []

    shortcut_pathArr.forEach(filePath => {
        shortcuts.push(file.getShortcutsMsg(filePath))
    })

    Promise.all(shortcuts).then(async res => {
        console.log(res)
        for (let i = 0; i < res.length; i++) {
            const info = res[i];
            res[i] = {
                md5: path.basename(info.target).split("-")[1],
                origin: info.origin,
                target: info.target,
                icon: info.icon,
                hotkey: info.hotkey,
                workingDir: info.workingDir,
                runStyle: info.runStyle,
                desc: info.desc,
                labels: folder.getChildPath(working_dir, info.origin).join(",")
            }
            try {
                let result = await sqlite.upsertShortcut(res[i], path.dirname(res[i].origin))
                if (result.operation !== "none") {
                    file.editShortcutsMsg(res[i])
                }
            } catch (error) {
                
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

export default listenShortcut
listenShortcut()