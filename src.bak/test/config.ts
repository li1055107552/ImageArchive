/**
 * @namespace
 * @typedef {Object} ConfProps - 配置
 * @param {String} ConfProp.WORKING_DIR - 工作目录
 * @param {String} ConfProp.ARCHIVE_DIR - 归档目录
 * @param {Boolean} ConfProp.DelOriginFile - 归档后是否删除源文件
 */
interface ConfProps {
    /** 工作目录 */
    WORKING_DIR: string,

    /** 归档目录 */
    ARCHIVE_DIR: string,

    /** 归档后是否删除源文件 */
    DelOriginFile: boolean
}

/**
 * @typedef {Object} ConfProps - 配置
 * @param {String} ConfProp.WORKING_DIR - 工作目录
 * @param {String} ConfProp.ARCHIVE_DIR - 归档目录
 * @param {Boolean} ConfProp.DelOriginFile - 归档后是否删除源文件
 */
const conf:ConfProps = {
    WORKING_DIR: "H:/",
    ARCHIVE_DIR: "G:/图片-视频归档",
    DelOriginFile: false
};

export default conf
