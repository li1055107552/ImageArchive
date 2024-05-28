import fs from "fs"
import path from "path"
import crypto from "crypto"
import sqlite3 from "sqlite3"
import folder from "../utils/folder.js";

const sqlite = sqlite3.verbose();

/**
 * @description 判断文件是否已归档
 * @param {path} fullpath 文件路径
 * @returns Boolean
 */
export function isArchived(fullpath) {
    return RegExp(/已归档 - .+/).test(path.basename(fullpath))
        || RegExp(/[\d^0]{13}-\[.*?\]-[a-f0-9]{32}-.+/).test(path.basename(fullpath))
}

/**
 * @description 将所有json导入到sqlite
 * @param {String} ARCHIVE_DIR 归档目录
 */
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

/**
 * @description 将一个json文件数据导入到sqlite
 * @param {String} ARCHIVE_DIR 归档目录
 * @param {path} jsonfilepath json文件路径
 */
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

export default {
    /** 判断文件是否已归档 */
    isArchived,
    /** 将所有json导入到sqlite */
    import_All_JSON_Databases,
    /** 将一个json文件数据导入到sqlite */
    import_One_JSON_Databases
}