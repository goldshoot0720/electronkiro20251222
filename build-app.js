// 應用程式打包腳本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 開始打包鋒兄AI資訊系統...');

// 檢查必要文件
function checkRequiredFiles() {
    console.log('📋 檢查必要文件...');
    
    const requiredFiles = [
        'main.js',
        'src/index.html',
        'package.json',
        'assets/icon.ico'
    ];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ 缺少必要文件: ${file}`);
            process.exit(1);
        }
    }
    
    console.log('✅ 所有必要文件都存在');
}

// 清理舊的打包文件
function cleanDist() {
    console.log('🧹 清理舊的打包文件...');
    
    if (fs.existsSync('dist')) {
        try {
            execSync('rmdir /s /q dist', { stdio: 'inherit' });
            console.log('✅ 舊的打包文件已清理');
        } catch (error) {
            console.warn('⚠️ 清理舊文件時發生錯誤:', error.message);
        }
    }
}

// 執行打包
function buildApp() {
    console.log('📦 開始打包應用程式...');
    
    try {
        // 打包 Windows 版本
        console.log('🔨 打包 Windows 64位版本...');
        execSync('npm run build:win64', { stdio: 'inherit' });
        
        console.log('🔨 打包 Windows 32位版本...');
        execSync('npm run build:win32', { stdio: 'inherit' });
        
        console.log('✅ 打包完成！');
        
        // 顯示打包結果
        showBuildResults();
        
    } catch (error) {
        console.error('❌ 打包失敗:', error.message);
        process.exit(1);
    }
}

// 顯示打包結果
function showBuildResults() {
    console.log('\n📊 打包結果:');
    
    if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        
        console.log('📁 生成的文件:');
        files.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`  📄 ${file} (${size} MB)`);
        });
        
        console.log('\n🎉 打包成功完成！');
        console.log('📍 打包文件位置: dist/ 資料夾');
        console.log('💡 安裝程式: 以 "Setup" 結尾的文件');
        console.log('💡 免安裝版: 以 "Portable" 結尾的文件');
        
    } else {
        console.warn('⚠️ 未找到 dist 資料夾');
    }
}

// 主函數
function main() {
    try {
        checkRequiredFiles();
        cleanDist();
        buildApp();
    } catch (error) {
        console.error('❌ 打包過程中發生錯誤:', error.message);
        process.exit(1);
    }
}

// 執行主函數
main();