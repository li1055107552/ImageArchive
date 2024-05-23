import fs from "fs"
import crypto from "crypto"
import sqlite3 from "sqlite3"
import folder from "../utils/folder.js";

const sqlite = sqlite3.verbose();

// const ARCHIVE_DIR = "E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/archive_test"
export function init(ARCHIVE_DIR) {

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

export function import_All_JSON_Databases(ARCHIVE_DIR) {
    // 连接数据库
    const db = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

    const jsonFiles = folder.listfile(`${ARCHIVE_DIR}/JSON_Databases/`)
    jsonFiles.pop()

    db.serialize(() => {
        for (let i = 0; i < jsonFiles.length; i++) {
            const jsonfilepath = jsonFiles[i];
            const jsonData = JSON.parse(fs.readFileSync(jsonfilepath))// 读取 JSON 数据并插入数据库
            for (const md5 in jsonData) {
                if (jsonData.hasOwnProperty(md5)) {
                    const imgList = jsonData[md5];
                    imgList.forEach(imgInfo => {

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
                            imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5]);
                    });
                }
            }
        }

    });

    // 关闭数据库连接
    db.close();
}

export function import_One_JSON_Databases(ARCHIVE_DIR, jsonfilepath) {
    // 连接数据库
    const db = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

    db.serialize(() => {

        const jsonData = JSON.parse(fs.readFileSync(jsonfilepath))// 读取 JSON 数据并插入数据库
        for (const md5 in jsonData) {
            if (jsonData.hasOwnProperty(md5)) {
                const imgList = jsonData[md5];
                imgList.forEach(imgInfo => {

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
                        imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5]);
                });
            }
        }
    });

    // 关闭数据库连接
    db.close();
}

export default class Sqlite {
    constructor(archive_dir = "") {
        this.archive_dir = archive_dir
    }
    getConnection(archive_dir = "") {
        if (archive_dir != "") {
            this.archive_dir = archive_dir
        }
        this.db = new sqlite.Database(`${this.archive_dir}/images.db`);
        return this.db
    }

    /**
     * 
     * @param {fileClass} imgInfo 
     */
    insertOne(imgInfo) {
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

}