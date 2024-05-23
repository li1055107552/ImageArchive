
import { spawn } from 'child_process';
import path from 'path';

const dialogexe = path.join(process.cwd(), "src", "tools", "dialog", "dialog.exe")

export default function openDialog(){

    return new Promise((resolve, reject) => {
        const childProcess = spawn(dialogexe)
    
        let stdoutData = '';
        let stderrData = '';
    
        childProcess.stdout.on('data', (data) => {
            stdoutData += data;
            // 检查是否收到了预期的结果
            if (stdoutData.trim()) {
                // 清除 stderr 监听器，避免不必要的错误输出
                childProcess.stderr.removeAllListeners();
                // 结束子进程，确保资源释放
                childProcess.kill();
                resolve(stdoutData.trim());
            }
        });
    
        childProcess.stderr.on('data', (data) => {
            stderrData += data;
            reject(stderrData)
        });
    
        childProcess.on('error', (err) => {
            reject(err);
        });
    });

}
