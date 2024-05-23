

/** 项目初始化 */
function init() {
    // 归档目录，不存在则创建
    folder.accessingPath(ARCHIVE_DIR)

    // 归档目录/JSON数据库/ 不存在则创建
    let JSON_Databases = path.join(ARCHIVE_DIR, 'JSON_Databases')
    folder.accessingPath(JSON_Databases)

    // 归档目录/JSON数据库/count.js文件，不存在则创建
    let countFilePath = path.join(JSON_Databases, 'count.json')
    if (!fs.existsSync(countFilePath)) {
        console.log(`${countFilePath} 不存在`);
        fs.writeFileSync(countFilePath, "{}")
        console.log(`${countFilePath} 创建成功`);
    }
}

export default init