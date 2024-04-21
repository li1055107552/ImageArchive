/**
 * @function 判断文件类型，并返回后缀名
 * @description 通过判断文件标识头，来判断文件类型，是则返回文件类型的后缀，否则返回空字符串
 * @param {file} fileBuffer fileBuffer - 传入一个file文件
 * @returns {Srting} 返回文件类型的后缀 | 返回 ""
 */
function getFileSuffix(fileBuffer) {
    // 将上文提到的 文件标识头 按 字节 整理到数组中
    const fileBufferHeaders = [
        { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: '.jpg' },
        { bufBegin: [0xff, 0xd8], bufEnd: [0x15, 0x14], suffix: '.jpg' },
        { bufBegin: [0xff, 0xd8, 0xff], suffix: '.jpg' },
        { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x00], suffix: '.tga' },
        { bufBegin: [0x00, 0x00, 0x10, 0x00, 0x00], suffix: '.rle' },
        { bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], suffix: '.png' },
        { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: '.gif' },
        { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: '.gif' },
        { bufBegin: [0x42, 0x4d], suffix: '.bmp' },
        { bufBegin: [0x0a], suffix: '.pcx' },
        { bufBegin: [0x49, 0x49], suffix: '.tif' },
        { bufBegin: [0x4d, 0x4d], suffix: '.tif' },
        { bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: '.ico' },
        { bufBegin: [0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: '.cur' },
        { bufBegin: [0x46, 0x4f, 0x52, 0x4d], suffix: '.iff' },
        { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: '.ani' }
    ]
    for (const fileBufferHeader of fileBufferHeaders) {
        let isEqual
        // 判断标识头前缀
        if (fileBufferHeader.bufBegin) {
            const buf = Buffer.from(fileBufferHeader.bufBegin)
            isEqual = buf.equals(
                //使用 buffer.slice 方法 对 buffer 以字节为单位切割
                fileBuffer.slice(0, fileBufferHeader.bufBegin.length)
            )
        }
        // 判断标识头后缀
        if (isEqual && fileBufferHeader.bufEnd) {
            const buf = Buffer.from(fileBufferHeader.bufEnd)
            isEqual = buf.equals(fileBuffer.slice(-fileBufferHeader.bufEnd.length))
        }
        if (isEqual) {
            return fileBufferHeader.suffix
        }
    }
    // 未能识别到该文件类型
    return ''
}