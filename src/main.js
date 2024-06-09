import fs from 'fs'
import path from 'path'
import readline from "readline"

import folder from './utils/folder.js'
import ws from "./tools/shortcut/windows-shortcuts.js"
import init from "./handles/init.js"

import { archiveStart } from './handles/archiveHandle.js'

// const __dirname = path.resolve();

console.log(`node version: ${process.version}`)

async function main() {
    /** 忽略的文件夹 */
    global.ignore = ["Music", "音频", "视频", "压缩包", "分类整理", "$RECYCLE.BIN", "System Volume Information", ".git", "node_modules", "back", "font"]

    /** 进行归档的 */
    await init()
    archiveStart()

    /** 归档还原 从归档目录+名字还原 || 从Databases+归档目录还原 */
    // revertStart()

    /** 从归档还原出所有快捷方式 */
    // revertShortcut()

    // await test_dialog()
    // test_stdio()
}

main()
// revertStart()
function test_ws() {
    let textpath = path.join(path.resolve(), "./test.txt")
    fs.appendFileSync(textpath, "test" + Date.now() + "\n", "utf-8")
    let targetFilePath = textpath
    let shortcutPath = targetFilePath + ".lnk"

    ws.create(shortcutPath, {
        target: targetFilePath,
        args: "",
        runStyle: 1,
        desc: ""
    }, function (err) {
        if (err) {
            console.log(err)
            return
        }
        console.log(`Shortcut '${shortcutPath}' created!`);
    });

    ws.query(shortcutPath, (err, shortcut) => {
        if (err) {
            console.error('Error:', err);
        }

        // 输出解析结果
        console.log("$$$", shortcut);
        // console.log('Target:', shortcut.target);
        // console.log('Arguments:', shortcut.args);
        // console.log('Description:', shortcut.desc);
        // console.log('Icon Path:', shortcut.icon);
        // console.log('Working Directory:', shortcut.workingDir);
    });


    setTimeout(() => {

    }, 3000);
}
async function test_dialog() {
    let a = await folder.openDialog()
    console.log(a)

    console.log('finish')
}

async function test_stdio() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.setPrompt("请选择归档目录：")
    rl.prompt()
    let archive_dir = await folder.openDialog()

    rl.write(archive_dir)

    rl.question("请选择归档目录：", (answer) => {
        console.log(`归档目录：${answer}`);
        rl.close();
    });

}
// WORKING_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img"
// ARCHIVE_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\archive_test"
// fileHandle("E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\wmr\\jk\\微信图片_20221214213634.png")

// console.log('finish')