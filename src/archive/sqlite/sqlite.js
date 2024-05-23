import sqlite3 from "sqlite3"

const sqlite = sqlite3.verbose();

/**
 * @description sqlite数据库初始化，建库建表
 * @param {String} ARCHIVE_DIR 归档目录
 */
function init(ARCHIVE_DIR) {

    // 连接数据库
    const db = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

    // 创建表
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS images (
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
        db.run(`CREATE INDEX IF NOT EXISTS idx_date ON images (date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_md5 ON images (md5)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_labels ON images (labels)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_compressed_md5 ON images (compressed_md5)`);
    });

    // 关闭数据库连接
    db.close();

}

/**
 * @description 插入一条数据
 * @param {fileClass} imgInfo 
 */
function insertOne(imgInfo) {
    this.db.run(`INSERT OR IGNORE INTO images (
        md5, 
        dir_raw, filePath_raw, fileName_raw, extName_raw,
        dir_archive, filePath_archive, fileName_archive, extName_archive,
        labels, modify, date, type, compressed_md5)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [imgInfo.md5, imgInfo.rawData.dir, imgInfo.rawData.filePath, imgInfo.rawData.fileName,
        imgInfo.rawData.extName, imgInfo.archiveData.dir, imgInfo.archiveData.filePath,
        imgInfo.archiveData.fileName, imgInfo.archiveData.extName, imgInfo.labels,
        imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5],
        function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        })

}

export default {
    /** 数据库初始化 */
    init,
    /** 插入一条记录 */
    insertOne
}