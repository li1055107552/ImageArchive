import fs from "fs"
import P from "path"

/**
 * @description 尝试访问路径。若路劲不存在，则自动创建，创建成功则返回true；若路劲存在，则直接返回true
 * @param {String} path - 访问路径 
 * @returns Boolean 
 */
function accessingPath(path) {
    if (!fs.existsSync(path)) {
        console.log(`${path} 该路径不存在`);
        const arr = path.split(P.sep);
        let dir = arr[0];
        let dirCache = {}
        for (let i = 0; i < arr.length; i++) {
            if (!dirCache[dir] && !fs.existsSync(dir)) {
                dirCache[dir] = true;
                fs.mkdirSync(dir);
                console.log(`${dir} 创建成功`);
            }
            if (i + 1 < arr.length)
                dir = dir + P.sep + arr[i + 1];
        }
        return true
    }
    else {
        // console.log(`${path} 已存在`)
        return true
    }
}

/**
 * @description 遍历目录下所有的文件
 * @param {Path} dir 文件夹路径
 * @param {Boolean} [deep=false] 是否深度遍历，默认 false
 * @param {Array} [ignore=[]] 忽略的[文件/]文件夹
 * @param {Function} [callback=(fullpath,isDirectory)=>{}] 遍历到文件时触发的回调
 * @returns {Array} 目录下所有文件的绝对路径
 */
function listfile(dir, deep = false, ignore = [], callback = (fullpath, isDirectory) => { }) {
    /** 返回结果 */
    const res = []
    /** 文件夹路径 */
    const path_arr = []

    function handle(dirPath) {
        // 读取当前目录下的所有 文件/文件夹 名
        const arr = fs.readdirSync(dirPath)

        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            try {
                // 路径拼接
                let fullpath = P.join(dirPath, element)
                let isDirectory = fs.statSync(fullpath).isDirectory()

                // 判断拼接后的路径是否为文件夹
                if (isDirectory) {
                    // 深度遍历 && 不在 ignore 数组中 && 该文件夹路径 push 到 path_arr 中
                    deep && !ignore.includes(element) && path_arr.push(fullpath)
                }

                // 不是文件夹，则添加到返回结果里
                !isDirectory && res.push(fullpath)
                callback(fullpath, isDirectory)

            } catch (error) {
                console.log(element, error)
                continue
            }

        }

        // 判断是否有新的文件夹（递归文件夹，广度优先搜索）
        if (deep && path_arr.length != 0) {
            // 进入到新的文件夹里 重复上述操作
            handle(path_arr.shift())
        }
    }
    handle(dir)
    return res
}


/**
 * @description 获取文件经过的各级文件夹
 * @param {Path} basePath 根路径
 * @param {Path} targetPath 文件路径
 * @returns {Array} 经过的各级文件夹名称
 */
function getChildPath(basePath, targetPath) {
    basePath = P.normalize(basePath)
    targetPath = P.normalize(targetPath)

    let labels = targetPath.replace(basePath, "").split(P.sep)
    // shift()、pop()有返回值，不能连着写
    labels[0] || labels.shift() // 第一项为空则弹出来（工作目录填写时 末尾不带分隔符时出现）
    labels.pop()
    return labels
}


