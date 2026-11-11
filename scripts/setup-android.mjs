import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const run = (...args) => execFileSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (!existsSync('android')) run('cap','add','android');
const manifest = 'android/app/src/main/AndroidManifest.xml';
if (!existsSync(manifest)) throw new Error('AndroidManifest.xml not found');
let xml = readFileSync(manifest, 'utf8');
xml = xml.replace(/android:name="\.MainActivity"([^>]*)/, (match, attrs) => {
  return 'android:name=".MainActivity"' + (attrs.includes('android:screenOrientation') ? attrs.replace(/android:screenOrientation="[^"]*"/, 'android:screenOrientation="portrait"') : attrs + ' android:screenOrientation="portrait"');
});
if (!xml.includes('android.permission.INTERNET')) xml = xml.replace('<application', '<uses-permission android:name="android.permission.INTERNET" />\n    <application');
writeFileSync(manifest, xml);
console.log('Android portrait configured. Run npm run android:sync then npm run android:open');
