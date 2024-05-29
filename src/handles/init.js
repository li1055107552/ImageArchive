import path from "path"
import folder from "../utils/folder.js"
import {init as jsonInit} from "../archive/json/json.js"
import {init as sqliteInit} from "../archive/sqlite/sqlite.js"
import {ARCHIVE_DIR} from "../config.js"

/** 项目初始化 */
function init() {
    console.log("尝试初始化...")

    // 归档目录，不存在则创建
    folder.accessingPath(ARCHIVE_DIR)

    // 初始化json数据库
    // jsonInit()

    // 初始化数据库
    sqliteInit()

    console.log('初始化已完成...')
}

export default init