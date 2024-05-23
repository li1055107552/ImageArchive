import fs from "fs"
import path from "path"
import file from "./file.js"
import time from "../utils/time.js"

/**
 * @class
 * @function createFile(fullpath)
 * @function isExceedMaxSize(fullpath)
 * @function toObject()
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
        this.archiveData.extName = file.getImageSuffix(fs.readFileSync(fullpath))  // 后缀名(根据二进制判断的)

        this.modify = new Date(time.getTimeStamp(this.rawData.fileName, fullpath)).getTime()        // 最早的时间
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
     * @description 判断文件大小是否超过阈值
     * @param {path} fullpath 文件路径
     * @returns Boolean
     */
    static isExceedMaxSize(fullpath) {
        return fs.statSync(fullpath).size > this.MAX_SIZE
    }


}

export default fileClass;