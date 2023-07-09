const fs = require('fs')

/**
 * @function 更新YYYYMM.json
 * @description 更新YYYYMM.json
 * @param {String} yyyymmpath - YYYYMM.json的具体路径
 * @param {Object} fileJSON - 需要更新的信息（新文件的JSON数据）
 * @returns {Boolean} 是否更新成功
 */
function updateFileJSON(yyyymmpath, fileJSON){

    try {
        let yyyymm = JSON.parse(fs.readFileSync(yyyymmpath, 'utf8'))
    
        if(yyyymm.hasOwnProperty(fileJSON.md5)){
            // 已存在这个MD5字段
            yyyymm[fileJSON.md5].push(fileJSON)
        }
        else{
            // 不存在这个MD5字段
            yyyymm[fileJSON.md5] = [fileJSON]
        }
    
        fs.writeFileSync(yyyymmpath, JSON.stringify(yyyymm), 'utf8')
        return true

    } catch (error) {
        console.log(error);
        return false
    }

}


module.exports = {
    updateFileJSON
}