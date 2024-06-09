
import crypto from "crypto"

/**
 * @description 计算字符串MD5
 * @param {String} inputString 字符串
 * @returns {String} md5
 */
export function calculateMD5(inputString) {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(inputString);
    return md5Hash.digest('hex');
}

/**
 * @description 比较两个Object对象是否相等
 * @param {object} obj1 第一个Object对象
 * @param {object} obj2 第二个Object对象
 * @returns {Boolean}
 */
export function objectsEqual(obj1, obj2) {
    // 检查两个参数是否是对象
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }

    // 检查两个对象是否为空
    if (obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }

    // 比较属性数量
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);
    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }

    // 比较属性值
    for (const key of obj1Keys) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        // 递归比较属性值
        const areObjects = typeof val1 === 'object' && typeof val2 === 'object';
        if (areObjects && !objectsEqual(val1, val2) || !areObjects && val1 !== val2) {
            return false;
        }
    }

    // 所有属性都相同
    return true;
}


export default {
    /** 计算字符串md5 */
    calculateMD5,
    /** 比较两个Object对象是否相等 */
    objectsEqual
}