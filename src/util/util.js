/**
 * @function 判断是否为图片类型，识别图片的后缀名
 * @description 通过判断文件标识头，来判断是否为图片文件，是则返回图片的后缀，否则返回空字符串
 * @param {file} fileBuffer fileBuffer - 传入一个file文件
 * @returns {Srting} 返回图片的后缀 | 返回 ""
 */
function getImageSuffix(fileBuffer) {
    // 将上文提到的 文件标识头 按 字节 整理到数组中
    const imageBufferHeaders = [
        { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
        { bufBegin: [0xff, 0xd8], bufEnd: [0x15, 0x14], suffix: '.jpg' },
        { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
        { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
        {
            bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
            suffix: '.png'
        },
        { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
        { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
        { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
        { bufBegin: [0x0a], suffix: '.pcx' },
        { bufBegin: [0x49, 0x49], suffix: '.tif' },
        { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
        {
            bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20],
            suffix: '.ico'
        },
        {
            bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20],
            suffix: '.cur'
        },
        { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
        { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' }
    ]
    for (const imageBufferHeader of imageBufferHeaders) {
        let isEqual
        // 判断标识头前缀
        if (imageBufferHeader.bufBegin) {
            const buf = Buffer.from(imageBufferHeader.bufBegin)
            isEqual = buf.equals(
                //使用 buffer.slice 方法 对 buffer 以字节为单位切割
                fileBuffer.slice(0, imageBufferHeader.bufBegin.length)
            )
        }
        // 判断标识头后缀
        if (isEqual && imageBufferHeader.bufEnd) {
            const buf = Buffer.from(imageBufferHeader.bufEnd)
            isEqual = buf.equals(fileBuffer.slice(-imageBufferHeader.bufEnd.length))
        }
        if (isEqual) {
            return imageBufferHeader.suffix
        }
    }
    // 未能识别到该文件类型
    return ''
}

/**
 * @function 计算文件MD5
 * @description 计算文件MD5
 * @param {String} filepath - 文件路径
 * @returns {Promise} 返回该文件的md5
 */
function getFileMD5(filepath, test) {
    const fs = require('fs');
    const crypto = require('crypto');
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filepath)
        const hash = crypto.createHash('md5')
        stream.on('data', chunk => {
            hash.update(chunk, 'utf8')
        })
        stream.on('end', () => {
            const md5 = hash.digest('hex')
            // console.log(md5)
            resolve(md5)
        })
    })

}

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


module.exports = {
    getImageSuffix,
    getFileMD5,
    accessingPath
}