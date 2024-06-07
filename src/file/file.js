import fs from "fs"
import path from "path"
import crypto from "crypto"

import ws from "../tools/shortcut/windows-shortcuts.js"
import { isArchived } from "../archive/archive.js"

/**
 * @description 复制文件
 * @param {path} raw 源文件路径
 * @param {path} archive 复制的目标路径
 */
function copyFile(raw, archive) {
    if(!fs.existsSync(raw)) return `${raw} is not existed.`
    // fs.writeFileSync(file.archiveData.filePath, fs.readFileSync(file.rawData.filePath))
    // fs.copyFileSync(raw, archive)
    try {
        fs.cpSync(raw, archive, {
            preserveTimestamps: true,    // 当为 true 时，则 raw 的时间戳将被保留。
        })
        return true
    } catch (error) {
        return `copyFile error: ${error.message}.`
    }
}

/**
 * @function 判断是否为图片类型，识别图片的后缀名
 * @description 通过判断文件标识头，来判断是否为图片文件，是则返回图片的后缀，否则返回空字符串
 * @param {file} fileBuffer fileBuffer - 传入一个file文件
 * @returns {Srting} 返回图片的后缀 | 返回 ""
 */
function getImageSuffix(fileBuffer) {

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
 * @description 计算文件MD5
 * @param {path} filepath - 文件路径
 * @returns {Promise} 返回该文件的md5
 */
function getFileMD5(filepath) {
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
 * @description 判断文件是否为快捷方式
 * @param {path} fullpath 文件路径
 * @returns Boolean
 */
function isShortcut(fullpath) {
    const ext = path.extname(fullpath);
    if (process.platform === 'win32') {
        return ext.toLowerCase() === '.lnk';
    } else if (process.platform === 'darwin') {
        return fs.readFileSync(fullpath, 'utf8').trim().startsWith('<?xml');
    }
    // 其他平台暂不处理
    return false;
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
                desc: "",
                workingDir: path.dirname(shortcutPath)
            }, function (err) {
                if (err) {
                    console.log(err)
                    reject(err)
                    return
                }
                console.log(`created '${shortcutPath}'`);
                resolve(true)
            });
        })
        : Promise.reject("OS is not win32")
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
                shortcut['origin'] = lnkFilePath
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
 * @description 更新快捷方式的信息（windows）
 * @param {Object} shortcutInfo 快捷方式信息
 * @param {path} shortcutInfo.origin 快捷方式 当前 所在的绝对路径
 * @param {path} shortcutInfo.target 源文件的绝对路径
 * @param {number} shortcutInfo.hotkey 热键
 * @param {number} shortcutInfo.runStyle 运行方式
 * @param {string} shortcutInfo.icon 图标
 * @param {string} shortcutInfo.desc 描述
 * @param {path} shortcutInfo.workingDir 快捷方式 上次保存/创建 所在的文件夹
 */
export function editShortcutsMsg(shortcutInfo){
    return process.platform === 'win32'
        ? new Promise((resolve, reject) => {
            ws.edit(shortcutInfo.origin, {
                target: shortcutInfo.target,
                args: "",
                runStyle: shortcutInfo.runStyle, // 打开窗口状态，ws.NORMAL(1) 普通, ws.MAX (3) 最大化, or ws.MIN (7) 最小化
                desc: shortcutInfo.desc,
                workingDir: path.dirname(shortcutInfo.origin)
            }, function (err) {
                if (err) {
                    console.log(err)
                    reject(err)
                    return
                }
                console.log(`edited '${shortcutInfo.origin}'`);
                resolve(true)
            })
        })
        : Promise.reject("OS is not win32")
}

export default {
    /** 复制文件 */
    copyFile,
    /** 计算文件MD5 */
    getFileMD5,
    /** 判断是否为图片类型 */
    getImageSuffix,
    /** 判断文件是否为快捷方式 */
    isShortcut,
    /** 获取快捷方式的信息（windows） */
    getShortcutsMsg,
    /** 创建快捷方式（windows） */
    createShortcuts,
    /** 更新快捷方式的信息（windows） */
    editShortcutsMsg,
    /** 判断文件是否已归档 */
    isArchived
}