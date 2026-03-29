import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
const adbPath = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const logcat = execSync(`"${adbPath}" logcat -d -v time`).toString('utf-8');
const filtered = logcat.split('\n').filter(line => line.toLowerCase().includes('console') || line.toLowerCase().includes('capacitor') || line.toLowerCase().includes('chromium') || line.toLowerCase().includes('fatal') || line.toLowerCase().includes('exception')).join('\n');
writeFileSync('log_filtered.txt', filtered, 'utf-8');
console.log('Filtered logs saved to log_filtered.txt');
