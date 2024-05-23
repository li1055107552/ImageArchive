
import crypto from "crypto"

/**
 * @description 计算字符串MD5
 * @param {String} inputString 字符串
 * @returns {String} md5
 */
function calculateMD5(inputString) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(inputString);
    return md5Hash.digest('hex');
}


export default {
    /** 计算字符串md5 */
    calculateMD5
}