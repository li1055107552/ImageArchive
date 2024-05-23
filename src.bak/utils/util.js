import fs from "fs"
import crypto from "crypto"

/**
 * @function 判断是否为图片类型，识别图片的后缀名
 * @description 通过判断文件标识头，来判断是否为图片文件，是则返回图片的后缀，否则返回空字符串
 * @param {file} fileBuffer fileBuffer - 传入一个file文件
 * @returns {Srting} 返回图片的后缀 | 返回 ""
 */
function getImageSuffix(fileBuffer) {
    // 将上文提到的 文件标识头 按 字节 整理到数组中
    // const fileBufferHeaders = [
    //     { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
    //     { bufBegin: [0xff, 0xd8], bufEnd: [0x15, 0x14], suffix: '.jpg' },
    //     { bufBegin: [0xff, 0xd8, 0xff], suffix: '.jpg' },
    //     { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
    //     { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
    //     { bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], suffix: '.png' },
    //     { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
    //     { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
    //     { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
    //     { bufBegin: [0x0a], suffix: '.pcx' },
    //     { bufBegin: [0x49, 0x49], suffix: '.tif' },
    //     { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
    //     { bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: '.ico' },
    //     { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: '.cur' },
    //     { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
    //     { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' }
    // ]
    const fileBufferHeaders = [
        // jpg
        {
            "bufBegin": ["0xFF", "0xD8", "0xFF"],
            "suffix": [".jpg", ".jpeg"],
            "desc": ""
        },
        {
            "bufBegin": ["0xFF", "0xD8", "0xFF", "0xE0", "0x00"],
            "suffix": [".jpg", ".jpe", ".jpeg"],
            "desc": "JPG Graphic File"
        },
        {
            "bufBegin": ["0xFF", "0xD8", "0xFF", "0xFE", "0x00"],
            "suffix": [".jpg", ".jpe", ".jpeg"],
            "desc": "JPG Graphic File"
        },
        {
            "bufBegin": ["0xff", "0xd8", "0xff", "0xfe"],
            "suffix": [".jpeg", ".jpe", ".jpg"],
            "desc": "JPG Graphic File"
        },
        {
            "bufBegin": ["0xFF", "0xD8", "0xFF"],
            "suffix": [".jpg", ".jpeg"],
            "desc": ""
        },
        // png
        {
            "suffix": [".PNG"],
            "bufBegin": ["0x89", "0x50", "0x4E"],
            "desc": ""
        },
        {
            "suffix": [".PNG"],
            "bufBegin": ["0x89", "0x50", "0x4E", "0x47"],
            "desc": ""
        },
        {
            "suffix": [".png"],
            "bufBegin": ["0x89", "0x50", "0x4E", "0x47", "0x0D", "0x0A"],
            "desc": "PNG Image File"
        },
        {
            "suffix": [".png"],
            "bufBegin": ["0x89", "0x50", "0x4E", "0x47", "0x0D", "0x0A", "0x1A", "0x0A"],
            "desc": "PNG Image File"
        },
        {
            "bufBegin": ["0x89", "0x50", "0x4e", "0x47", "0x0d"],
            "suffix": [".png"],
            "desc": "PNG Image File"
        },
        // tga
        {
            "bufBegin": ["0x00", "0x00", "0x10", "0x00", "0x00"],
            "suffix": [".tga"], // .rle
            "desc": "RLE压缩的前5字节"
        },
        {
            "bufBegin": ["0x00", "0x00", "0x02"],
            "suffix": [".TGA"],
            "desc": ""
        },
        {
            "bufBegin": ["0x00", "0x00", "0x02", "0x00", "0x00"],
            "suffix": [".tga"],
            "desc": "未压缩的前5字节"
        },
        // bmp
        {
            "bufBegin": ["0x42"],
            "suffix": [".bmp"],
            "desc": "Windows Bitmap"
        },
        {
            "suffix": [".bmp"],
            "bufBegin": ["0x42", "0x4D"],
            "desc": "Windows Bitmap"
        },
        {
            "suffix": [".BMP"],
            "bufBegin": ["0x42", "0x4D", "0x3E"],
            "desc": ""
        },
        // gif
        {
            "suffix": [".GIF"],
            "bufBegin": ["0x47", "0x49", "0x46", "0x38"],
            "desc": ""
        },
        {
            "suffix": [".gif"],
            "bufBegin": ["0x47", "0x49", "0x46", "0x38", "0x37", "0x61"],
            "desc": "Graphics interchange format file (GIF 87A)"
        },
        {
            "suffix": [".gif"],
            "bufBegin": ["0x47", "0x49", "0x46", "0x38", "0x39", "0x61"],
            "desc": "Graphics interchange format file (GIF89A)"
        },
        {
            "bufBegin": ["0x47", "0x49", "0x46", "0x38", "0x39"],
            "suffix": [".gif"],
            "desc": "GIF 89A"
        },
        {
            "bufBegin": ["0x47", "0x49", "0x46", "0x38", "0x37"],
            "suffix": [".gif"],
            "desc": "GIF 87A"
        },
        // pcx
        {
            "suffix": [".pcx"],
            "bufBegin": ["0x0A", "0xnn", "0x01", "0x01"],
            "desc": "ZSOFT Paintbrush file(where nn = 0x02, 0x03, or\n                            &nbsp; 0x05)"
        },
        {
            "suffix": [".pcx"],
            "bufBegin": ["0x0A", "0x05", "0x01", "0x08"],
            "desc": "PC Paintbrush(often associated with Quake Engine\n                            &nbsp; games)"
        },
        {
            "suffix": [".pcx"],
            "bufBegin": ["0x0A", "0xnn", "0x01", "0x01"],
            "desc": "ZSOFT Paintbrush file(where nn = 0x02, 0x03, or\n                            &nbsp; 0x05)"
        },
        // tif
        {
            "suffix": [".TIF", ".TIFF"],
            "bufBegin": ["0x49", "0x20", "0x49"],
            "desc": "Tagged Image File Format file"
        },
        {
            "suffix": [".tif", ".tiff"],
            "bufBegin": ["0x49", "0x49", "0x2A"],
            "desc": "TIFF (Intel)"
        },
        {
            "suffix": [".tif", ".tiff"],
            "bufBegin": ["0x49", "0x49", "0x2A", "0x00"],
            "desc": "Tagged Image File Format file (little endian, i.e.,\n                            &nbsp; LSB first in the byte; Intel)"
        },
        {
            "suffix": [".TIF", ".TIFF"],
            "bufBegin": ["0x4D", "0x4D", "0x00", "0x2A"],
            "desc": "Tagged Image File Format file (big endian, i.e., LSB\n                            &nbsp; last in the byte; Motorola)"
        },
        {
            "suffix": [".tif", ".tiff"],
            "bufBegin": ["0x4D", "0x4D", "0x2A"],
            "desc": "TIFF (Motorola)"
        },
        {
            "suffix": [".TIF", ".TIFF"],
            "bufBegin": ["0x4D", "0x4D", "0x00", "0x2B"],
            "desc": "BigTIFF files; Tagged Image File Format files &gt;4\n                            &nbsp; GB"
        },
        {
            "bufBegin": ["0x49", "0x49"],
            "suffix": [".tif", ".tiff"],
            "desc": "TIFF(Intel)"
        },
        {
            "bufBegin": ["0x4d", "0x4d"],
            "suffix": [".tif", ".tiff"],
            "desc": "TIFF(Motorola)"
        },
        // ico
        {
            "suffix": [".ico"],
            "bufBegin": ["0x00", "0x00", "0x01", "0x00", "0x00"],
            "desc": "Icon File"
        },
        {
            "suffix": [".ico"],
            "bufBegin": ["0x00", "0x00", "0x01", "0x00", "0x01", "0x00", "0x20", "0x20"],
            "desc": "Icon File"
        },
        {
            "bufBegin": ["0x00", "0x00", "0x01", "0x00"],
            "suffix": [".ico"],
            "desc": "Icon File"
        },
        {
            "bufBegin": ["0x10"],
            "suffix": [".ico"],
            "desc": "ICON File"
        },
        // cur
        {
            "suffix": [".CUR"],
            "bufBegin": ["0x00", "0x00", "0x02", "0x00", "0x01", "0x00", "0x20", "0x20"],
            "desc": "Windows cursor file"
        },
        // iff
        {
            "suffix": [".IFF"],
            "bufBegin": ["0x46", "0x4F", "0x52", "0x4D"],
            "desc": ""
        },
        // ani
        {
            "suffix": [".ANI"],
            "bufBegin": ["0x52", "0x49", "0x46", "0x46"],
            "desc": ""
        },
    ]
    for (const fileBufferHeader of fileBufferHeaders) {
        let isEqual
        // 判断标识头前缀
        if (fileBufferHeader.bufBegin) {
            const buf = Buffer.from(fileBufferHeader.bufBegin)
            isEqual = buf.equals(
                //使用 buffer.slice 方法 对 buffer 以字节为单位切割
                fileBuffer.slice(0, fileBufferHeader.bufBegin.length)
            )
        }
        // 判断标识头后缀
        if (isEqual && fileBufferHeader.bufEnd) {
            const buf = Buffer.from(fileBufferHeader.bufEnd)
            isEqual = buf.equals(fileBuffer.slice(-fileBufferHeader.bufEnd.length))
        }
        if (isEqual) {
            return fileBufferHeader.suffix[0].toLowerCase()
        }
    }
    // 未能识别到该文件类型
    return ''
}

/**
 * @description 传入时间戳差值，返回xx h xx m xx s xxx ms
 * @param {Number} timeStamp - 时间戳
 * @returns {String} xx h xx m xx s xxx ms
 */
function formatTimeStamp(timeStamp) {
    let d = h = m = s = ms = 0
    let res = ""

    function fill(s) {
        return s < 10 ? "0" + s : s
    }
    if (timeStamp > 1000 * 60 * 60 * 24) {
        d = Math.floor(timeStamp / (1000 * 60 * 60 * 24))
        timeStamp = timeStamp - (1000 * 60 * 60 * 24)
        res += d > 0 ? d + "天" : ""
    }
    if (timeStamp > 1000 * 60 * 60) {
        h = Math.floor(timeStamp / (1000 * 60 * 60))
        timeStamp = timeStamp - (1000 * 60 * 60)
        res += h > 0 ? fill(h) + "小时" : ""
    }
    if (timeStamp > 1000 * 60) {
        m = Math.floor(timeStamp / (1000 * 60))
        timeStamp = timeStamp - (1000 * 60)
        res += m > 0 ? fill(m) + "分钟" : ""
    }
    if (timeStamp > 1000) {
        s = Math.floor(timeStamp / 1000)
        timeStamp = timeStamp - 1000
        res += s > 0 ? fill(s) + "秒" : ""
    }
    if (timeStamp > 0) {
        ms = timeStamp
        res += ms > 0 ? ms + "毫秒" : ""
    }
    return res
}

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

/**
 * @description 传入Date, 返回 YYYY 年
 * @param {Date} date Date对象
 * @returns YYYY
 */
function getYYYY(date) {
    return date.getFullYear().toString()
}
/**
 * @description 传入Date，返回 MM 月
 * @param {Date} date Date对象
 * @returns MM
 */
function getMM(date) {
    return ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1).toString()
}

/**
 * @description 计算字符串MD5
 * @param {String} inputString 字符串
 * @returns {String} md5
 */
function calculateMD5(inputString) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(inputString);
    return md5Hash.digest('hex');
}

const time = {
    /** 格式化时间戳 */
    formatTimeStamp,
    /** 尝试识别文件创建的最早时间 */
    getTimeStamp,
    /** 获取年 */
    getYYYY,
    /** 获取月 */
    getMM
}

export default {
    /** 判断是否为图片类型 */
    getImageSuffix,
    /** 时间相关函数 */
    time,
    /** 计算字符串md5 */
    calculateMD5
}