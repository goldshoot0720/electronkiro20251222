// 創建發布包的腳本
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 創建發布包...');

const distPath = path.join(__dirname, 'dist');
const appPath = path.join(distPath, '鋒兄AI資訊系統-win32-x64');
const zipPath = path.join(distPath, '鋒兄AI資訊系統-v1.0.0-win64.zip');

// 檢查應用程式是否存在
if (!fs.existsSync(appPath)) {
    console.error('❌ 找不到打包的應用程式，請先運行打包');
    process.exit(1);
}

// 創建 README 文件
const readmeContent = `# 鋒兄AI資訊系統 v1.0.0

## 系統簡介
鋒兄AI資訊系統是一個智能管理您數位生活的綜合資訊系統，集成了以下功能：

### 主要功能
- 🍎 **食品管理系統** - 管理食品庫存、到期日期提醒
- 📊 **訂閱管理系統** - 追蹤各種訂閱服務和付款日期
- 🖼️ **圖片庫管理** - 瀏覽和管理本地圖片
- 🎬 **影片庫管理** - 播放和管理本地影片
- 🎵 **音樂庫管理** - 多語言音樂播放和歌詞顯示
- 📋 **系統儀表板** - 統一的資訊管理介面

### 系統要求
- Windows 10 或更高版本
- 64位元作業系統
- 至少 4GB RAM
- 至少 500MB 可用磁碟空間

### 安裝說明
1. 解壓縮此檔案到任意資料夾
2. 雙擊 "鋒兄AI資訊系統.exe" 即可運行
3. 首次運行可能需要幾秒鐘載入時間

### 使用說明
- 左側選單可切換不同功能模組
- 每個模組都有對應的新增、編輯、刪除功能
- 支援 Contentful CMS 同步（需要配置）
- 支援本地資料備份和恢復

### 資料夾結構
- assets/ - 存放圖片、影片、音樂等媒體檔案
- src/ - 應用程式原始碼和樣式
- resources/ - 應用程式資源檔案

### 技術支援
如有問題請聯繫：鋒兄達哥

### 版本資訊
- 版本：v1.0.0
- 發布日期：2025年12月23日
- 開發者：鋒兄達哥
- 授權：ISC License

### 更新日誌
#### v1.0.0 (2025-12-23)
- ✅ 初始版本發布
- ✅ 完整的食品管理功能
- ✅ 完整的訂閱管理功能
- ✅ 媒體庫管理功能
- ✅ 修復彈跳窗口消失問題
- ✅ 優化用戶介面和體驗

---
© 2025 鋒兄達哥 版權所有
`;

// 寫入 README 文件
const readmePath = path.join(appPath, 'README.txt');
fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log('✅ README 文件已創建');

// 顯示打包資訊
console.log('\n📊 發布包資訊:');
console.log(`📁 應用程式路徑: ${appPath}`);
console.log(`📄 執行檔: 鋒兄AI資訊系統.exe`);

// 計算資料夾大小
function getFolderSize(folderPath) {
    let totalSize = 0;
    
    function calculateSize(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const itemPath = path.join(currentPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                calculateSize(itemPath);
            } else {
                totalSize += stats.size;
            }
        }
    }
    
    calculateSize(folderPath);
    return totalSize;
}

const totalSize = getFolderSize(appPath);
const sizeMB = (totalSize / 1024 / 1024).toFixed(2);

console.log(`💾 總大小: ${sizeMB} MB`);
console.log(`📦 檔案數量: ${fs.readdirSync(appPath).length} 個項目`);

console.log('\n🎉 發布包創建完成！');
console.log('💡 使用方式:');
console.log('  1. 將整個資料夾複製給用戶');
console.log('  2. 用戶雙擊 "鋒兄AI資訊系統.exe" 即可運行');
console.log('  3. 無需安裝，綠色免安裝版本');

console.log('\n📋 分發清單:');
console.log(`  📁 ${path.basename(appPath)}/`);
console.log(`  📄 README.txt - 使用說明`);
console.log(`  📄 鋒兄AI資訊系統.exe - 主程式`);
console.log(`  📁 resources/ - 應用程式資源`);
console.log(`  📁 locales/ - 語言檔案`);
console.log(`  📄 其他系統檔案...`);