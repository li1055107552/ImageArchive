import path from "path"
import fs from "fs"
import crypto from "crypto"
import utils from "./util.js"

/**
 * @class
 * @function createFile(fullpath)
 * @function isArchived(fullpath)
 * @function isExceedMaxSize(fullpath)
 * @property {Srting} fullpath
 */
class fileClass {
    /** 文件大小最大值 */
    static MAX_SIZE = 1024 * 1024 * 20

    constructor(fullpath = "") {
        /** 是否已初始化 */
        this._isInit = false

        /** 原始数据 */
        this.rawData = {
            /** 根目录路径(WORKING_DIR) */
            dir: "",
            /** 文件绝对路径 */
            filePath: "",
            /** 文件名 */
            fileName: "",
            /** 后缀名 */
            extName: ""
        }
            
        /** 归档数据 */
        this.archiveData = {
            /** 归档文件夹 */
            dir: "",
            /** 归档文件绝对路径 */
            filePath: "",
            /** 归档文件名(含后缀) */
            fileName: "",
            /** 归档文件后缀名(根据二进制判断的) */
            extName: "",
        }
        
        /** 文件标签(绝对路径 - 根目录路径) */
        this.labels = []
        /** 文件md5 */
        this.md5 = ""
        /** 文件类型 */
        this.type = ""
        /** 最早创建时间 */
        this.modify = ""
        /** 年月时间 YYYYMM */
        this.date = ""

        if (fullpath != "") {
            this.createFile(fullpath)
        }
        
        // /** 文件绝对路径 */
        // this.fullPath = fullpath;
        // /** 完整文件名 */
        // this.fullName = ""
        // /** 文件名（无后缀） */
        // this.fileName = ""
        // /** 文件后缀名(命名得出) */
        // this.extName = ""
        // /** 文件后缀名(二进制判断得出) */
        // this.tailName = ""
        // /** 文件md5 */
        // this.md5 = ""
        // /** 最早的创建时间 */
        // this.startDate = ""
        // /** 原命名 */
        // this.originName = ""
        // /** 现命名（归档命名） */
        // this.archiveName = ""
        // /** 原路径 */
        // this.originPath = ""
        // /** 归档路径 */
        // this.archivePath = ""
        // /** 标签 */
        // this.labels = ""
        // /** 文件类型 */
        // this.type = ""
        // /** 时间戳 */
        // this.modify = ""
        // /** 日期，年月 YYYYMM */
        // this.date = ""

    }

    /**
     * @description 初始化一个文件
     * @param {path} fullpath 文件路径
     */
    createFile(fullpath) {

        this._isInit = true
        // this.rawData.dir = ""                        // 根目录路径(WORKING_DIR)
        this.rawData.filePath = fullpath                // 文件绝对路径
        this.rawData.fileName = path.basename(fullpath)    // 文件名(含后缀)
        this.rawData.extName = path.extname(fullpath)      // 后缀名

        // this.archiveData.dir = ""                    // 归档文件夹
        // this.archiveData.filePath = ""               // 文件归档绝对路径
        // this.archiveData.fileName = ""               // 文件名(含后缀)
        this.archiveData.extName = utils.getImageSuffix(fs.readFileSync(fullpath))  // 后缀名(根据二进制判断的)

        this.modify = new Date(utils.time.getTimeStamp(this.rawData.fileName, fullpath)).getTime()        // 最早的时间
        // this.labels = []                             // 文件标签(绝对路径 - 根目录路径)
        // this.md5 = ""                                // 文件md5
        // this.type = ""                               // 文件类型
        // this.date = ""                               // 年月时间 YYYYMM
    }

    toObject(){
        let fileJSON = {} 
        for (let key of Reflect.ownKeys(this)) {
            fileJSON[key] = this[key]
        }
        delete fileJSON._isInit
        return fileJSON
    }

    /**
     * @description 判断文件是否已归档
     * @param {path} fullpath 文件路径
     * @returns Boolean
     */
    static isArchived(fullpath) {
        return RegExp(/已归档 - .+/).test(path.basename(fullpath))
            || RegExp(/[\d^0]{13}-\[.*?\]-[a-f0-9]{32}-.+/).test(path.basename(fullpath))
    }

    /**
     * @description 判断文件是否为快捷方式
     * @param {path} fullpath 文件路径
     * @returns Boolean
     */
    static isShotLink(fullpath){
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
     * @description 判断文件大小是否超过阈值
     * @param {path} fullpath 文件路径
     * @returns Boolean
     */
    static isExceedMaxSize(fullpath) {
        return fs.statSync(fullpath).size > this.MAX_SIZE
    }

    /**
     * @description 计算文件MD5
     * @param {Path} filepath - 文件路径
     * @returns {Promise} 返回该文件的md5
     */
    static getFileMD5(filepath) {
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

}

export default fileClass;