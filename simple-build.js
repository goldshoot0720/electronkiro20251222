// 簡單的打包腳本使用 electron-packager
const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

console.log('🚀 開始使用 electron-packager 打包應用程式...');

async function buildApp() {
    try {
        const options = {
            dir: '.',
            name: '鋒兄AI資訊系統',
            platform: 'win32',
            arch: 'x64',
            out: './dist',
            overwrite: true,
            asar: true,
            ignore: [
                /node_modules\/\.cache/,
                /\.git/,
                /dist/,
                /build/,
                /fix-modal-disappearing\.js/,
                /test-modal-fix\.html/,
                /.*修復報告\.md/,
                /.*說明\.md/,
                /test-.*\.js/,
                /test-.*\.html/,
                /build-app\.js/,
                /simple-build\.js/,
                /create-.*\.js/
            ],
            executableName: '鋒兄AI資訊系統',
            appVersion: '1.0.0',
            buildVersion: '1.0.0',
            appCopyright: '© 2025 鋒兄達哥',
            win32metadata: {
                CompanyName: '鋒兄達哥',
                FileDescription: '鋒兄AI資訊系統',
                OriginalFilename: '鋒兄AI資訊系統.exe',
                ProductName: '鋒兄AI資訊系統',
                InternalName: '鋒兄AI資訊系統'
            }
        };

        console.log('📦 開始打包...');
        const appPaths = await packager(options);
        
        console.log('✅ 打包完成！');
        console.log('📁 應用程式已打包到:');
        appPaths.forEach(appPath => {
            console.log(`  📄 ${appPath}`);
        });

        // 顯示打包結果
        showBuildResults(appPaths);

    } catch (error) {
        console.error('❌ 打包失敗:', error);
        process.exit(1);
    }
}

function showBuildResults(appPaths) {
    console.log('\n📊 打包結果:');
    
    appPaths.forEach(appPath => {
        if (fs.existsSync(appPath)) {
            const stats = fs.statSync(appPath);
            console.log(`📁 ${path.basename(appPath)}`);
            console.log(`   路徑: ${appPath}`);
            
            // 查找執行檔
            const exePath = path.join(appPath, '鋒兄AI資訊系統.exe');
            if (fs.existsSync(exePath)) {
                const exeStats = fs.statSync(exePath);
                const size = (exeStats.size / 1024 / 1024).toFixed(2);
                console.log(`   執行檔: 鋒兄AI資訊系統.exe (${size} MB)`);
            }
        }
    });
    
    console.log('\n🎉 打包成功完成！');
    console.log('💡 執行方式: 進入打包資料夾，雙擊 "鋒兄AI資訊系統.exe" 即可運行');
    console.log('💡 分發方式: 將整個打包資料夾複製給其他用戶即可');
}

// 執行打包
buildApp();