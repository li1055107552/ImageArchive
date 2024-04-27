import fs from "fs"
import path from "path"
import ws from "windows-shortcuts"

/**
 * @function 更新YYYYMM.json
 * @description 更新YYYYMM.json
 * @param {String} yyyymmpath - YYYYMM.json的具体路径
 * @param {Object} fileJSON - 需要更新的信息（新文件的JSON数据）
 * @returns {Boolean} 是否更新成功
 */
function updateFileJSON(yyyymmpath, fileJSON) {

    try {
        let yyyymm = JSON.parse(fs.readFileSync(yyyymmpath, 'utf8'))

        if (yyyymm.hasOwnProperty(fileJSON.md5)) {
            // 已存在这个MD5字段
            yyyymm[fileJSON.md5].push(fileJSON)
        }
        else {
            // 不存在这个MD5字段
            yyyymm[fileJSON.md5] = [fileJSON]
        }

        fs.writeFileSync(yyyymmpath, JSON.stringify(yyyymm, null, 2), 'utf8')
        return true

    } catch (error) {
        console.log(error);
        return false
    }

}

/**
 * @function 更新count.json
 * @description 更新count.json
 * @param {String} countpath - count.json的具体路径
 * @param {Object} fileJSON - 需要更新的信息（新文件的JSON数据）
 * @returns {void} 
 */
function updateCountJSON(countpath, fileJSON) {
    let count = JSON.parse(fs.readFileSync(countpath, 'utf8'))
    if (count.hasOwnProperty(fileJSON.date)) {
        count[fileJSON.date].push(fileJSON.md5)
    }
    else {
        count[fileJSON.date] = [fileJSON.md5]
    }
    fs.writeFileSync(countpath, JSON.stringify(count, null, 2))
}

/**
 * @description 复制文件
 * @param {path} raw 源文件路径
 * @param {path} archive 复制的目标路径
 */
function copyFile(raw, archive) {
    // fs.writeFileSync(file.archiveData.filePath, fs.readFileSync(file.rawData.filePath))
    // fs.copyFileSync(raw, archive)
    fs.cpSync(raw, archive, {
        preserveTimestamps: true,    // 当为 true 时，则 raw 的时间戳将被保留。
    })
}

/**
 * @description 获取快捷方式的信息（windows）
 * @param {path} lnkFilePath 快捷方式绝对路径
 * @returns {Promise}
 */
function getShortcutsMsg(lnkFilePath) {
    return process.platform === 'win32' 
    ? new Promise((resolve, reject) => {
        // 读取.lnk文件
        ws.query(lnkFilePath, (err, shortcut) => {
            if (err) {
                console.error('Error:', err);
                reject(err)
                return
            }
            resolve(shortcut)

            // 输出解析结果
            // console.log(shortcut);
            // console.log('Target:', shortcut.target);
            // console.log('Arguments:', shortcut.args);
            // console.log('Description:', shortcut.desc);
            // console.log('Icon Path:', shortcut.icon);
            // console.log('Working Directory:', shortcut.workingDir);
        });
    })
    : Promise.reject("OS is not win32")
}

/**
 * @description 创建快捷方式（windows）
 * @param {path} targetFilePath 源目标文件路径
 * @param {path} shortcutPath 快捷方式路径(需要带.lnk)
 * @returns {Promise}
 */
function createShortcuts(targetFilePath, shortcutPath) {
    return process.platform === 'win32' 
    ? new Promise((resolve, reject) => {
        ws.create(shortcutPath, {
            target: targetFilePath,
            args: "",
            runStyle: 1 || ws.MAX, // 打开窗口状态，ws.NORMAL(1) 普通, ws.MAX (3) 最大化, or ws.MIN (7) 最小化
            desc: ""
        }, function (err) {
            if (err) {
                console.log(err)
                reject(err)
                return
            }
            console.log(`Shortcut '${shortcutPath}' created!`);
            resolve(true)
        });
    })
    : Promise.reject("OS is not win32")
}

export default {
    /** 更新YYYYMM.json */
    updateFileJSON,
    /** 更新count.json */
    updateCountJSON,
    /** 复制文件 */
    copyFile,
    /** 获取快捷方式的信息（windows） */
    getShortcutsMsg,
    /** 创建快捷方式（windows） */
    createShortcuts
}