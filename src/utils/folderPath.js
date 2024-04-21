/**
 * @description 尝试访问路径。若路劲不存在，则自动创建，创建成功则返回true；若路劲存在，则直接返回true
 * @param {String} path - 访问路径 
 * @returns Boolean 
 */
function accessingPath(path) {
    const fs = require('fs')
    const p = require('path')
    if (!fs.existsSync(path)) {
        console.log(`${path} 该路径不存在`);
        const arr = path.split(p.sep);
        let dir = arr[0];
        let dirCache = {}
        for (let i = 0; i < arr.length; i++) {
            if (!dirCache[dir] && !fs.existsSync(dir)) {
                dirCache[dir] = true;
                fs.mkdirSync(dir);
                console.log(`${dir} 创建成功`);
            }
            if (i + 1 < arr.length)
                dir = dir + p.sep + arr[i + 1];
        }
        return true
    }
    else {
        console.log(`${path} 已存在`)
        return true
    }
}

/**
 * @description 遍历目录下所有的文件
 * @param {Path} dir 文件夹路径
 * @param {Boolean} [deep=false] 是否深度遍历，默认 false
 * @param {Array} [ignore=[]] 忽略的文件/文件夹
 * @param {Function} [callback=(fullpath)=>{}] 遍历到文件时触发的回调
 * @returns {Array} 目录下所有文件的绝对路径
 */
async function listfile(dir, deep = false, ignore = [], callback = (fullpath) => { }) {
    // 读取当前目录下的所有 文件/文件夹 名
    const arr = fs.readdirSync(dir)
    const path_arr = []

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
                callback(fullpath)
            }
        } catch (error) {
            continue
        }

    }

    // 判断是否有新的文件夹（递归文件夹，广度优先搜索）
    if (deep && path_arr.length != 0) {
        // 进入到新的文件夹里 重复上述操作
        listfile(path_arr.shift())
    }
}

export default {
    accessingPath,
    listfile
}