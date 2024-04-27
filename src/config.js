/**
 * @typedef {Object} conf - 配置
 * @property {String} WORKING_DIR - 工作目录
 * @property {String} ARCHIVE_DIR - 归档目录
 * @property {Boolean} DelOriginFile - 归档后是否删除源文件
 * @property {Boolean} CreateShortcut - 是否创建快捷方式
 * @param {String} WORKING_DIR - 工作目录
 * @param {String} ARCHIVE_DIR - 归档目录
 * @param {Boolean} DelOriginFile - 归档后是否删除源文件
 * @param {Boolean} CreateShortcut - 是否创建快捷方式
 */
const conf = {
    /** 工作目录 */
    WORKING_DIR: "H:/",

    /** 归档目录 */
    ARCHIVE_DIR: "G:/图片-视频归档",

    /** 归档后是否删除源文件 */
    DelOriginFile: false,

    /** 是否创建快捷方式 */
    CreateShortcut: true
}

export default conf