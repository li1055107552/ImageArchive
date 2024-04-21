const util = require('../util/util')
const fn = require('../fn/handle')
const fs = require('fs')
const path = require('path')

let ignore = ["Music", "音频", "视频", "压缩包", "分类整理", "$RECYCLE.BIN", "System Volume Information", ".git", "node_modules", "back", "font"]
// let WORKING_DIR = "E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/img/"
// let ARCHIVE_DIR = "archive_test"

let WORKING_DIR = "H:/"
let ARCHIVE_DIR = "G:/图片-视频归档"

let path_arr = []
let isDelOriginFile = false     // 归档后是否删除源文件

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

// 项目初始化
function init() {
    // 归档目录，不存在则创建
    util.accessingPath(ARCHIVE_DIR)

    // 归档目录/JSON数据库/ 不存在则创建
    let JSON_Databases = path.join(ARCHIVE_DIR, 'JSON_Databases')
    util.accessingPath(JSON_Databases)

    // 归档目录/JSON数据库/count.js文件，不存在则创建
    let countFilePath = path.join(JSON_Databases, 'count.json')
    if (!fs.existsSync(countFilePath)) {
        console.log(`${countFilePath} 不存在`);
        fs.writeFileSync(countFilePath, "{}")
        console.log(`${countFilePath} 创建成功`);
    }
}

// 遍历目录
async function listfile(dir) {
    // 读取当前目录下的所有 文件/文件夹 名
    const arr = fs.readdirSync(dir)

    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        try {
            // 路径拼接
            let fullpath = path.join(dir, element)
            let stats = fs.statSync(fullpath)
            // 判断拼接后的路径是否为文件夹
            if (stats.isDirectory()) {
                // 是文件夹，且不在 ignore 数组中，则把 该文件夹路径 push到 path_arr 中
                !ignore.includes(element) && path_arr.push(fullpath)
            }
            else {
                // 是文件，则处理文件
                let file = await fileHandle(fullpath)

                // 文件归档
                archiveHandle(file)

            }
        } catch (error) {
            continue
        }

    }

    // 判断是否有新的文件夹（递归文件夹，广度优先搜索）
    if (path_arr.length != 0) {
        // 进入到新的文件夹里 重复上述操作
        listfile(path_arr.shift())
    }
}

// 处理文件
async function fileHandle(fullpath) {
    let file = {}

    if (RegExp(/已归档 - .+/).test(path.basename(fullpath))) {
        console.log(`已归档: ${fullpath}`);
        return file
    }
    if (fs.statSync(fullpath).size > 1024 * 1024 * 20) {
        console.log(`文件过大: ${fullpath}`);
        return file
    }

    console.log(fullpath);
    // 根据二进制判断文件后缀名
    let tail = util.getImageSuffix(fs.readFileSync(fullpath))

    // 判断文件类型
    if (tail == "") {
        // 文件为音频/视频文件

        // console.log(fs.statSync(fullpath, {bigint:true}))
        // let file = fs.statSync(fullpath)
        // console.log(file,fullpath)
        return file
    }
    else {
        // 文件为图片，则执行以下操作

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
        file.date = YYYY + MM                   // 日期，年月

        return file
    }
}
archiveHandle()
// 处理归档
/**
 * @description 文件归档，传入 处理后的文件的对象，依据传入的值进行归档
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
 * @returns void
 */
function archiveHandle(fileJSON) {

    if (Object.keys(fileJSON).length == 0) {
        // console.log(`文件不处理`);
        return ""
    }

    console.log(fileJSON.originPath)

    // 归档目录/JSON数据库/YYYYMM.json 文件路径
    let yyyymmpath = path.join(ARCHIVE_DIR, 'JSON_Databases', `${fileJSON.date}.json`)

    // 判断是否有归档目录
    if (!fs.existsSync(fileJSON.archivePath)) {
        // 创建 归档目录
        util.accessingPath(fileJSON.archivePath)
        // 创建 归档目录/JSON数据库/YYYYMM.json 文件
        fs.writeFileSync(yyyymmpath, "{}")
    }

    // 归档文件路径名   `归档目录/YYYY年/MM月/时间戳-[标签]-md5-归档名`
    let savePath = path.join(fileJSON.archivePath,
        [fileJSON.modify, `[${fileJSON.lables.join(",")}]`, fileJSON.md5, fileJSON.archiveName].join("-")
    )
    if (!fs.existsSync(savePath)) {
        // 拷贝文件
        fs.writeFileSync(savePath, fs.readFileSync(fileJSON.originPath))
        // 更新 归档目录/JSON数据库/YYYYMM.json
        fn.updateFileJSON(yyyymmpath, fileJSON)
        // 更新 归档目录/JSON数据库/count.json
        fn.updateCountJSON(path.join(ARCHIVE_DIR, 'JSON_Databases', 'count.json'), fileJSON)
    }


    // 归档完成后的勾子
    archived(fileJSON)
}

/**
 * @description 归档完成后调用的勾子
 * @param {Object} fileJSON - 归档文件对象
 */
async function archived(fileJSON) {
    // console.log('archived start')

    // 判断是否删除源文件
    // if (isDelOriginFile == true) {
    //     console.log(`删除源文件`);
    // }

    // 已归档的文件，对源文件的命名进行更改 以便区分 暂不删除源文件
    let dirName = path.dirname(fileJSON.originPath)
    let newName = `已归档 - ${fileJSON.originName}`
    let newPath = path.join(dirName, newName)
    fs.renameSync(fileJSON.originPath, newPath)

    // console.log('archived finish')
}

async function main() {
    let start = Date.now()
    WORKING_DIR = path.normalize(WORKING_DIR)
    console.log(WORKING_DIR)

    init()                  // 初始化
    await listfile(WORKING_DIR)   // 遍历整个工作目录，即源资源的存放目录

    console.log(`耗时: `, util.formatTimeStamp(Date.now() - start));

    console.log('finish')
}
main()

function test() {
    let imgpath = 'E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\已归档 - IMG20210112164421.jpg'

    console.log(fs.statSync(imgpath));
    console.log(fs.existsSync("2021/01/"));
    console.log(fs.existsSync(WORKING_DIR));
    console.log(path.sep);

    let dirname = path.dirname(imgpath)
    console.log(dirname);

    fs.readdirSync(WORKING_DIR)
    // fs.linkSync(imgpath, `./testshotcut.jpg`)

    // let f1 = fs.readFileSync('./testshotcut.jpg')
    // util.accessingPath('test')
}
// test()
