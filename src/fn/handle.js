const fs = require('fs')
const path = require('path')

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

module.exports = {
    updateFileJSON,
    updateCountJSON
}