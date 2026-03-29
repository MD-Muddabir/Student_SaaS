import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
const adbPath = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const logcat = execSync(`"${adbPath}" logcat -d -v time`).toString('utf-8');
writeFileSync('log_node.txt', logcat, 'utf-8');
console.log('Log saved to log_node.txt');
