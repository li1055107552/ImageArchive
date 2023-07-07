const util = require('../util/util')
const fs = require('fs')
const path = require('path')

let ignore = [".git", "node_modules", "back", "font"]
let WORKING_DIR = "E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/img/"
let ARCHIVE_DIR = ""
let path_arr = []

/**
 * @description 根据文件和文件名，识别出文件创建的最早时间，并返回时间戳
 * @param {String} filename 
 * @param {path} fullpath 
 * @returns 返回时间戳
 */
function getTimeStamp(filename, fullpath) {

    /**
     * @description 将不同的时间表达类型，统一返回时间戳
     * @param {String} type r1 | r2 | r3 | r4
     * @param {String} time 
     * @returns 
     */
    let toTimeStamp = function (type, time) {
        // str = yyyyMMddHHmmss
        function format(str) {
            return new Date(`${str.slice(0, 4)}/${str.slice(4, 6)}/${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`).getTime()
        }
        switch (type) {
            case 'r1': {
                return new Date(Number(time)).getTime()
            }
            case 'r2': {
                let str = time.split("-").join("")
                return format(str)
            }
            case 'r3': {
                let str = time.split("_").join("")
                return format(str)
            }
            case 'r4': {
                return format(time)
            }

            default:
                break;
        }
    }

    /**
     * fileStat
     * stats.size    文件的大小（以字节为单位）。
     * stats.atimeMs    指示最后一次访问此文件的时间戳，以 POSIX Epoch 以来的毫秒数表示。
     * stats.mtimeMs    指示最后一次修改此文件的时间戳，以 POSIX Epoch 以来的毫秒数表示。
     * stats.ctimeMs    指示最后一次更改文件状态的时间戳，以 POSIX Epoch 以来的毫秒数表示。
     * stats.birthtimeMs    指示此文件创建时间的时间戳，以 POSIX Epoch 以来的毫秒数表示。
     * stats.atimeNs    仅在 bigint: true 传入到生成对象的方法中时出现。 指示最后一次访问此文件的时间戳，以 POSIX Epoch 以来的纳秒数表示。
     * stats.mtimeNs    仅在 bigint: true 传入到生成对象的方法中时出现。 指示最后一次修改此文件的时间戳，以 POSIX Epoch 以来的纳秒数表示。
     * stats.ctimeNs    仅在 bigint: true 传入到生成对象的方法中时出现。 指示最后一次更改文件状态的时间戳，以 POSIX Epoch 以来的纳秒数表示。
     * stats.birthtimeNs    仅在 bigint: true 传入到生成对象的方法中时出现。 指示此文件创建时间的时间戳，以 POSIX Epoch 以来的纳秒数表示。
     * stats.atime  指示最后一次访问此文件的时间戳。
     * stats.mtime  指示最后一次修改此文件的时间戳。
     * stats.ctime  指示最后一次更改文件状态的时间戳。
     * stats.birthtime  指示此文件创建时间的时间戳。
     * 
     */
    let fileStat = fs.statSync(fullpath)
    let minTime = new Date(fileStat.mtime).getTime()

    let reg_TimeStamp = new RegExp(/1\d{12}/g)                          // 13位的毫秒时间戳
    let reg_yyyy_MM_dd_HH_mm_ss = new RegExp(/\d{4}((-\d{2}){5,6})/g)   // yyyy-MM-dd-HH-mm-ss
    let reg_yyyyMMdd_HHmmss = new RegExp(/(?<=\D)(\d{8}_\d{6})/g)       // yyyyMMdd_HHmmss
    let reg_yyyyMMddHHmmss = new RegExp(/\d{14}/g)                      // yyyyMMddHHmmss

    let r1 = filename.match(reg_TimeStamp)
    let r2 = filename.match(reg_yyyy_MM_dd_HH_mm_ss)
    let r3 = filename.match(reg_yyyyMMdd_HHmmss)
    let r4 = filename.match(reg_yyyyMMddHHmmss)
    let allTimeStamp = [r1, r2, r3, r4]

    for (let i = 0; i < allTimeStamp.length; i++) {
        const arr = allTimeStamp[i];
        if (arr != null) {
            arr.forEach(time => {
                let t = toTimeStamp(`r${i + 1}`, time)
                t < minTime && (minTime = t)
            })
        }
    }

    // console.log("minTime:", minTime)
    return minTime
}

// 遍历目录
async function listfile(dir) {
    const arr = fs.readdirSync(dir)
    arr.forEach(async element => {
        let fullpath = path.join(dir, element)
        let stats = fs.statSync(fullpath)
        if (stats.isDirectory()) {
            !ignore.includes(element) && path_arr.push(fullpath)
        }
        else {
            let file = await fileHandle(fullpath)
            archiveHandle(file)
        }
    })
    if (path_arr.length != 0) {
        listfile(path_arr.shift())
    }
}

// 处理文件
async function fileHandle(fullpath) {
    let tail = util.getImageSuffix(fs.readFileSync(fullpath))
    let file = {}
    if (tail == "") {
        // 判断是否为音频/视频文件
        // console.log(fs.statSync(fullpath, {bigint:true}))
        let file = fs.statSync(fullpath)
        // console.log(file,fullpath)
    }
    else {
        // 获取文件名
        let filefullname = path.basename(fullpath)
        // 获取文件 . 后的后缀名
        let extname = path.extname(fullpath)
        // 获取标签
        let lables = fullpath.replace(WORKING_DIR, "").split(path.sep)
        // shift()、pop()有返回值，不能连着写
        lables[0] || lables.shift() // 第一项为空则弹出来（工作目录填写时 末尾不带分隔符时出现）
        lables.pop()

        // 计算文件MD5
        let md5 = await util.getFileMD5(fullpath)
        // 获取文件名（除后缀）
        let filename = filefullname.replace(extname, "")
        // 获取最早的创建时间
        let startDate = new Date(getTimeStamp(filename, fullpath))

        let YYYY = startDate.getFullYear().toString()
        let MM = ((startDate.getMonth() + 1) < 10 ? "0" : "") + (startDate.getMonth() + 1).toString()

        file.originName = filefullname      // 原命名
        file.archiveName = filename + tail  // 现命名（归档命名）
        file.originPath = fullpath          // 原路径
        file.archivePath = path.join(ARCHIVE_DIR, YYYY, MM)    // 归档路径
        file.lables = lables            // 标签
        file.md5 = md5                  // MD5
        file.type = `image_${tail.slice(1)}`    // 文件类型
        file.modify = startDate.getTime()       // 时间戳

        return file
    }
    return file
}

// 处理归档
function archiveHandle(fileJSON) {
    console.log(fileJSON)
    
    if (fileJSON.keys.length == 0) {
        console.log('文件不处理');
        return ""
    }

    // 判断是否有归档目录




    console.log('finish')
}

function main() {
    WORKING_DIR = path.normalize(WORKING_DIR)
    console.log(WORKING_DIR)
    listfile(WORKING_DIR)
    console.log('finish')
}
// main()

function test() {
    // let file = fs.readFileSync('E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\IMG20210112164421.jpg')
    // let hex = file.toString('hex')
    // console.log(hex.slice(0, 10))
    // console.log(hex.slice(hex.length - 10, hex.length))
    // console.log(util.getImageSuffix(file));

    console.log(fs.existsSync("2021/01/"));
    console.log(fs.existsSync(WORKING_DIR));
    console.log(path.sep);
}
test()