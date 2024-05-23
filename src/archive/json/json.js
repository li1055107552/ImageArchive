import fs from 'fs'
import path from 'path'

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
        !count[fileJSON.date].includes(fileJSON.md5)
        && count[fileJSON.date].push(fileJSON.md5)
    }
    else {
        count[fileJSON.date] = [fileJSON.md5]
    }
    fs.writeFileSync(countpath, JSON.stringify(count, null, 2))
}

export default {
    /** 读取所有json文件(除count.json), 得到每个md下的 每一个数组对象 */
    readJSON,
    /** 更新YYYYMM.json */
    updateFileJSON,
    /** 更新count.json */
    updateCountJSON,
}