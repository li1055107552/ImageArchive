import fs from 'fs'
import path from 'path'
import conf from './config.js'
import folder from './utils/folder.js'
// import archive from './utils/archive.js'

// import ws from "windows-shortcuts"
// import * as ws from "./utils/windows-shortcuts.js"
import ws from "./utils/windows-shortcuts.js"
import { openDialog } from './utils/dialog.js'

import readline from "readline"

// console.log(ws)

import {
    fileHandle,
    archiveHandle,
    afterArchive
} from "./archive/archive.js"

// const __dirname = path.resolve();

let {
    WORKING_DIR,
    ARCHIVE_DIR,
} = conf

console.log(process.version)

/**
 * @description 读取所有json文件(除count.json), 得到每个md下的 每一个数组对象
 * @param {function} handle 处理每一个对象的函数
 */
function readJSON(handle) {
    const JSON_Databases = path.join(ARCHIVE_DIR, "JSON_Databases")
    let fileList = folder.listfile(JSON_Databases, true, ignore)
    console.log(fileList)

    fileList.pop() // 把count.js剔除
    for (let i = 0; i < fileList.length; i++) {
        // JSON文件的路径
        const filepath = fileList[i];
        let obj = JSON.parse(fs.readFileSync(filepath))

        // 该JSON文件包含的所有md5字段
        for (const md5 in obj) {

            let files = obj[md5]
            // console.log(files)
            // 同个md5下的所有item  obj[md5]是一个对象数组
            for (const item of files) {
                handle(item)
            }
        }
    }
}

/** 项目初始化 */
function init() {
    // 归档目录，不存在则创建
    folder.accessingPath(ARCHIVE_DIR)

    // 归档目录/JSON数据库/ 不存在则创建
    let JSON_Databases = path.join(ARCHIVE_DIR, 'JSON_Databases')
    folder.accessingPath(JSON_Databases)

    // 归档目录/JSON数据库/count.js文件，不存在则创建
    let countFilePath = path.join(JSON_Databases, 'count.json')
    if (!fs.existsSync(countFilePath)) {
        console.log(`${countFilePath} 不存在`);
        fs.writeFileSync(countFilePath, "{}")
        console.log(`${countFilePath} 创建成功`);
    }
}

/** 进行归档的 */
async function archiveStart() {
    WORKING_DIR = "F:\\E\\Phone\\照片"
    let t1 = Date.now()
    console.log(t1)
    let WORKING_DIR_FILES = folder.listfile(WORKING_DIR, true, ignore, async (fullpath, isDirectory) => {
        // if (isDirectory) return null
        // // 处理文件，得到文件对象
        // const myfile = await fileHandle(fullpath)
        // // 将文件对象进行归档
        // archiveHandle(myfile, afterArchive)
    })
    console.log("文件数量：",WORKING_DIR_FILES.length)
    console.log(Date.now() - t1 + "ms")
    const myfile = await fileHandle(WORKING_DIR_FILES[0])
    archiveHandle(myfile)
    console.log('finish')
}

/** 归档还原 */
function revertStart() {

    readJSON((item) => {
        let index = 2
        let dir = path.join(WORKING_DIR, ...item.labels)
        let ext = item.rawData.extName
        let name = path.basename(item.rawData.fileName).replace(ext, "")
        console.log(dir)
        folder.accessingPath(dir)
        let save_filePath = path.join(dir, name + ext)
        while (fs.existsSync(save_filePath)) {
            save_filePath = path.join(dir, name + `(${index++})` + ext)
        }
        archive.copyFile(item.archiveData.filePath, save_filePath)
        console.log("revert: ", item.archiveData.filePath, "--->", save_filePath)
    })

    console.log('finish')
}

function revertShotLink() {
    readJSON((item) => {
        if (fs.existsSync(item.archiveData.filePath)) {
            let dir = path.join(WORKING_DIR, ...item.labels)
            folder.accessingPath(dir)
            let save_filePath = path.join(dir, item.rawData.fileName + '.lnk')
            archive.createShortcuts(item.archiveData.filePath, save_filePath)
        }
    })
}

async function main() {
    /** 忽略的文件夹 */
    global.ignore = ["Music", "音频", "视频", "压缩包", "分类整理", "$RECYCLE.BIN", "System Volume Information", ".git", "node_modules", "back", "font"]

    /** 进行归档的 */
    // init()
    archiveStart()

    /** 归档还原 从归档目录+名字还原 || 从Databases+归档目录还原 */
    // revertStart()

    /** 从归档还原出所有快捷方式 */
    // revertShotLink()

    // await test_dialog()
    // test_stdio()
}

main()
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
    let a = await openDialog()
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
    let archive_dir = await openDialog()

    rl.write(archive_dir)

    rl.question("请选择归档目录：", (answer) => {
        console.log(`归档目录：${answer}`);
        rl.close();
    });

}
// WORKING_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img"
// ARCHIVE_DIR = "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\archive_test"
// fileHandle("E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\wmr\\jk\\微信图片_20221214213634.png")

console.log('finish')