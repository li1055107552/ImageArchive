// import {getImagesCount,getImagesAllRows,getImagesRows} from "./archive/sqlite/sqlite.js"
// import path from "path"
// import fs from "fs"
// import sqlite3 from "sqlite3"

// const sqlite = sqlite3.verbose();
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

// import { exec, execFile, spawn } from "child_process"
// import iconv from "iconv-lite"
function expandEnv(path) {
	var envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g; // Matches env vars, accounting for escaped chars. I feel dirty.
	return path.replace(envRE, function (_, g1, g2) {
		return g1 + process.env[g2];
	}).replace(/\^(.)/g, "$1");
}
function byspawn() {
    const command = 'E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\src\\tools\\shortcut\\Shortcut.exe';
    const args = [
        '/a:q',
        `/f:${expandEnv("E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/img/ttt.jpg.lnk")}`
    ];

    const options = {
        encoding: 'gbk',
        // shell: 'powershell.exe'
    };

    const ps = execFile(command, args, options, function (error, stdout, stderr) {
        console.log(error)
        console.log(stdout)
        console.log(stderr)
    });

    let encoding = 'gbk';
    ps.stdout.on('data', (data) => {
        const output = iconv.decode(data, encoding);
        console.log(`stdout: ${output}`);
    });

    ps.stderr.on('data', (data) => {
        const output = iconv.decode(data, encoding);
        console.error(`stderr: ${output}`);
    });

    ps.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
// byspawn()

function byexec() {
    let encoding = "gbk"
    execFile(
        `powershell.exe -Command E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\src\\tools\\shortcut\\Shortcut.exe /f:"E:/_Project/_git仓库/li1055107552-ImageArchive/ImageArchive/img/ttt.jpg.lnk" /a:q`,
        { encoding: 'utf-8' },
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${iconv.decodeStream(error.message, encoding)}`);
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                const stderr = iconv.decode(stderr, encoding);
                console.error(`stderr: ${stderr}`);
                return;
            }
            const output = iconv.decode(stdout, encoding);
            console.log(`stdout: ${(output)}`);
            // fs.writeFileSync("test.txt", output)
        })

}
// byexec()



// import listenShortcut from "./handles/shortcutHandle.js";
// listenShortcut()

import fs from "fs"
let res = (()=>{
    try {
        fs.cpSync("E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\img\\微信图片_20221214213634212.png", "E:\\_Project\\_git仓库\\li1055107552-ImageArchive\\ImageArchive\\test.png", {
            preserveTimestamps: true,    // 当为 true 时，则 raw 的时间戳将被保留。
        })
        return true
    } catch (error) {
        console.log(error.message)
        return error.message
    }
})()
console.log(res)