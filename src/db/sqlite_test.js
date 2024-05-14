import fs from "fs"
import crypto from "crypto"
import sqlite3 from"sqlite3"
import folder from "../utils/folder.js";

const sqlite = sqlite3.verbose();

const ARCHIVE_DIR = "E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/archive_test"
function init() {

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
            lables TEXT,
            modify INTEGER,
            date TEXT,
            type TEXT,
            compressed_md5 TEXT UNIQUE
        )`);

            // 为 date、md5 和 lables 字段创建索引
        db.run(`CREATE INDEX IF NOT EXISTS idx_date ON images (date)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_md5 ON images (md5)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_lables ON images (lables)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_compressed_md5 ON images (compressed_md5)`);
    });

    // 关闭数据库连接
    db.close();

}

function import_All_JSON_Databases(){
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

                            const lables = imgInfo.lables.join(',');

                            const infoString = JSON.stringify(imgInfo);
                            const compressed_md5 = crypto.createHash('md5').update(infoString).digest('hex');
                            db.run(`INSERT OR IGNORE INTO images (
                                md5, 
                                dir_raw, filePath_raw, fileName_raw, extName_raw,
                                dir_archive, filePath_archive, fileName_archive, extName_archive,
                                lables, modify, date, type, compressed_md5)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [imgInfo.md5, imgInfo.rawData.dir, imgInfo.rawData.filePath, imgInfo.rawData.fileName,
                                imgInfo.rawData.extName, imgInfo.archiveData.dir, imgInfo.archiveData.filePath,
                                imgInfo.archiveData.fileName, imgInfo.archiveData.extName, lables,
                                imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5]);
                        });
                    }
                }
            }
            
        });
    
        // 关闭数据库连接
        db.close();
}

function import_One_JSON_Databases(jsonfilepath){
    // 连接数据库
    const db = new sqlite.Database(`${ARCHIVE_DIR}/images.db`);

    db.serialize(() => {
        
            const jsonData = JSON.parse(fs.readFileSync(jsonfilepath))// 读取 JSON 数据并插入数据库
            for (const md5 in jsonData) {
                if (jsonData.hasOwnProperty(md5)) {
                    const imgList = jsonData[md5];
                    imgList.forEach(imgInfo => {

                        const lables = imgInfo.lables.join(',');

                        const infoString = JSON.stringify(imgInfo);
                        const compressed_md5 = crypto.createHash('md5').update(infoString).digest('hex');
                        db.run(`INSERT OR IGNORE INTO images (
                            md5, 
                            dir_raw, filePath_raw, fileName_raw, extName_raw,
                            dir_archive, filePath_archive, fileName_archive, extName_archive,
                            lables, modify, date, type, compressed_md5)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [imgInfo.md5, imgInfo.rawData.dir, imgInfo.rawData.filePath, imgInfo.rawData.fileName,
                            imgInfo.rawData.extName, imgInfo.archiveData.dir, imgInfo.archiveData.filePath,
                            imgInfo.archiveData.fileName, imgInfo.archiveData.extName, lables,
                            imgInfo.modify, imgInfo.date, imgInfo.type, compressed_md5]);
                    });
                }
            }        
    });

    // 关闭数据库连接
    db.close();
}

function main(){
    // 初始化 创建数据库
    init()

    // 导入所有JSON数据
    import_All_JSON_Databases()

    // 导入指定JSON数据
    // import_One_JSON_Databases("E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/archive_test/JSON_Databases/201912.json")
}

main()