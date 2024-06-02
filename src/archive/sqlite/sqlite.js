import crypto from "crypto"
import sqlite3 from "sqlite3"
import { ARCHIVE_DIR } from "../../config.js";

const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

/**
 * @description sqlite数据库初始化，建库建表
 */
export function init() {

    // 连接数据库
    const dbInit = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

    // 创建images表   serialize 顺序执行一组数据库操作
    dbInit.serialize(() => {
        dbInit.run(`CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            md5 TEXT,
            dir_raw TEXT,
            filePath_raw TEXT,
            fileName_raw TEXT,
            extName_raw TEXT,
            dir_archive TEXT,
            filePath_archive TEXT,
            fileName_archive TEXT,
            extName_archive TEXT,
            labels TEXT,
            modify INTEGER,
            date TEXT,
            type TEXT,
            compressed_md5 TEXT UNIQUE
        )`);

        // 为 date、md5 和 labels 字段创建索引
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_date ON images (date)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_md5 ON images (md5)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_labels ON images (labels)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_compressed_md5 ON images (compressed_md5)`);

    })

    // label表
    dbInit.serialize(() => {

        dbInit.run(`CREATE TABLE IF NOT EXISTS label (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            md5 TEXT,
            labels TEXT
        )`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_md5 ON label (md5)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_labels ON label (labels)`);

    });

    // 创建shortcut表
    dbInit.serialize(() => {
        // id INTEGER PRIMARY KEY AUTOINCREMENT,
        // md5 TEXT,            // 源文件的md5
        // origin TEXT,         // 快捷方式所在的绝对路径
        // target TEXT,         // 源文件的绝对路径
        // hotkey INTEGER,      // 热键
        // runStyle INTEGER,    // 运行方式
        // icon TEXT,           // 图标
        // desc TEXT,           // 描述
        // workingDir TEXT      // 快捷方式 上次保存/创建 所在的文件夹，变更的时候可以根据这个/origin判断
        dbInit.run(`CREATE TABLE IF NOT EXISTS shortcut (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            md5 TEXT,
            origin TEXT,
            target TEXT,
            hotkey INTEGER,
            runStyle INTEGER,
            icon TEXT,
            desc TEXT,
            workingDir TEXT
        )`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_md5 ON shortcut (md5)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_target ON shortcut (target)`);
        dbInit.run(`CREATE INDEX IF NOT EXISTS idx_workingDir ON shortcut (workingDir)`);
    })

    // 关闭数据库连接
    dbInit.close();

}

/**
 * @description 插入一条数据
 * @param {fileClass} imgInfo 
 */
export function insertOneImages(imgInfo) {
    // console.log("insertOneImages", imgInfo)
    // 连接数据库
    const labels = imgInfo.labels.join(',');
    const infoString = JSON.stringify(imgInfo);
    const compressed_md5 = crypto.createHash('md5').update(infoString).digest('hex');

    db.run(`INSERT OR IGNORE INTO images (
        md5, 
        dir_raw, filePath_raw, fileName_raw, extName_raw,
        dir_archive, filePath_archive, fileName_archive, extName_archive,
        labels, modify, date, type, compressed_md5)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [imgInfo.md5, imgInfo.rawData.dir, imgInfo.rawData.filePath, imgInfo.rawData.fileName,
        imgInfo.rawData.extName, imgInfo.archiveData.dir, imgInfo.archiveData.filePath,
        imgInfo.archiveData.fileName, imgInfo.archiveData.extName, labels,
        imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5],
        function (err) {
            if (err) {
                return console.log(err.message);
            }
            // console.log(`sqlite: A row has been inserted with rowid ${this.lastID} `);
            console.log(`sqlite: compressed_md5 ${compressed_md5} existed`)
        })

}

/**
 * @description 获取images表中的数据总数
 * @returns {Promise<number>}
 */
export function getImagesCount() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT count(*) as count FROM images`, (err, row) => {
            if (err) {
                reject(err.message)
                return err.message
            }
            resolve(row.count)
            return `images count: ${row.count}`
        })
    })
}

/**
 * @description 取images表中的所有记录
 * @returns Promise<Array<fileClass>>
 */
export function getImagesAllRows() {
    // TODO: 改为分页获取，每次1w条记录
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM images`, [], (err, rows) => {
            if (err) {
                reject(err.message)
                return err.message
            }
            resolve(rows)
            return rows
        })
    })
}

/**
 * @description 获取images表中指定范围的下标记录，单次不超10000条记录
 * @param {Number} startIndex 起始下标（从0开始）
 * @param {Number} endIndex 终止下标
 * @returns {Promise<Array<fileClass>}
 */
export function getImagesRows(startIndex = 0, endIndex = 100) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM images LIMIT ${startIndex}, ${endIndex}`, [], (err, rows) => {
            if (err) {
                reject(err.message)
                return err.message
            }
            resolve(rows)
            return rows
            // rows.forEach((row) => {
            //     console.log(row);
            // });
        })
    })

}

/**
 * @description 插入一条快捷方式记录
 * @param {Object} shortcutInfo 快捷方式信息
 * @param {string} shortcutInfo.md5 源文件的md5
 * @param {path} shortcutInfo.origin 快捷方式所在的绝对路径
 * @param {path} shortcutInfo.target 源文件的绝对路径
 * @param {number} shortcutInfo.hotkey 热键
 * @param {number} shortcutInfo.runStyle 运行方式
 * @param {string} shortcutInfo.icon 图标
 * @param {string} shortcutInfo.desc 描述
 * @param {path} shortcutInfo.workingDir 快捷方式 上次保存/创建 所在的文件夹，变更的时候可以根据这个/origin判断
 */
export function insertOneShortcut(shortcutInfo) {
    db.run(`INSERT OR IGNORE INTO images (
        md5, origin, target, hotkey, runStyle, icon, desc, workingDir)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [shortcutInfo.md5, shortcutInfo.origin, shortcutInfo.target, shortcutInfo.hotkey,
        shortcutInfo.runStyle, shortcutInfo.icon, shortcutInfo.desc, shortcutInfo.workingDir],
        function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`sqlite: origin ${shortcutInfo.origin} existed`)
        })
}

/**
 * @description 更新一条快捷方式记录
 * @param {Object} shortcutInfo 快捷方式信息
 * @param {string} shortcutInfo.md5 源文件的md5
 * @param {path} shortcutInfo.origin 快捷方式 当前 所在的绝对路径
 * @param {path} shortcutInfo.target 源文件的绝对路径
 * @param {number} shortcutInfo.hotkey 热键
 * @param {number} shortcutInfo.runStyle 运行方式
 * @param {string} shortcutInfo.icon 图标
 * @param {string} shortcutInfo.desc 描述
 * @param {path} shortcutInfo.workingDir 快捷方式 上次保存/创建 所在的文件夹
 * @param {path} newWorkingDir 快捷方式 当前 所在的文件夹
 */
export function editOneShortcut(shortcutInfo, newWorkingDir) {
    db.run(`UPDATE images SET origin = ?, , hotkey = ?, runStyle = ?, icon = ?, desc = ?, workingDir = ? 
    WHERE md5 = ? AND target = ? AND workingDir = ?`,
        [shortcutInfo.origin, shortcutInfo.hotkey, shortcutInfo.runStyle, shortcutInfo.icon,
        shortcutInfo.desc, newWorkingDir, shortcutInfo.md5, shortcutInfo.target, shortcutInfo.workingDir],
        function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`sqlite: updated: ${shortcutInfo.origin}`)
            console.log(`Row(s) updated: ${this.changes}`);
        })
}


export default {
    /** 数据库初始化 */
    init,
    /** 插入一条记录 */
    insertOneImages,
    /** 获取images表中的数据总数 */
    getImagesCount,
    /** 取images表中的所有记录 */
    getImagesAllRows,
    /** 获取images表中指定范围的下标记录 */
    getImagesRows
}