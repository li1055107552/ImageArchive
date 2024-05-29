import {getImagesCount,getImagesAllRows,getImagesRows} from "./archive/sqlite/sqlite.js"

// // getImagesCount()
// let res = await getImagesRows(1,5)
// console.log(res)
// console.log('finish')
import path from "path"
import fs from "fs"
import sqlite3 from "sqlite3"
const sqlite = sqlite3.verbose();

// const db = new sqlite.Database(`E://_Project//_git仓库//li1055107552-ImageArchive//images2.db`);
// const start = process.hrtime();
// db.all('select * from images', (err, row) => {
//     console.log(row)
    
//     const end = process.hrtime(start);
//     const timeInMs = (end[0] * 1000) + (end[1] / 1000000);
//     console.log(`查询耗时: ${timeInMs} 毫秒`);
    
// })

// getImagesAllRows().then((rows) => {
//     rows.forEach((item) => {
//         console.log(item)
//         if(!fs.existsSync(item.filePath_archive)){
//             console.log(`${raw} is not existed.`);
//             return `${raw} is not existed.`
//         } 
//     })
// })

import {revertStart_fromSQLite} from "./handles/revertHandle.js"
revertStart_fromSQLite("aaarrr")