// 調試同步問題
require('dotenv').config();

console.log('🔍 調試 Contentful 同步問題\n');

// 檢查環境變數
console.log('1. 檢查環境變數:');
console.log('   CONTENTFUL_MANAGEMENT_TOKEN:', process.env.CONTENTFUL_MANAGEMENT_TOKEN ? 
    (process.env.CONTENTFUL_MANAGEMENT_TOKEN.startsWith('CFPAT-') ? 
        (process.env.CONTENTFUL_MANAGEMENT_TOKEN === 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE' ? 
            '❌ 預設值，需要設定真實 Token' : 
            '✅ 已設定 (隱藏顯示)') : 
        '❌ 格式錯誤，應以 CFPAT- 開頭') : 
    '❌ 未設定');

// 測試 ContentfulManager 初始化
const ContentfulManager = require('./src/js/contentfulManager.js');
const contentfulManager = new ContentfulManager();

console.log('\n2. 測試 Management API 初始化:');
contentfulManager.initManagementAPI().then(result => {
    console.log('   結果:', result ? '✅ 成功' : '❌ 失敗');
    
    if (!result) {
        console.log('\n📋 解決步驟:');
        console.log('1. 登入 Contentful 後台: https://app.contentful.com');
        console.log('2. 進入你的 Space (navontrqk0l3)');
        console.log('3. 點擊 Settings > API keys');
        console.log('4. 點擊 "Content management tokens" 標籤');
        console.log('5. 點擊 "Generate personal token"');
        console.log('6. 輸入名稱 (例如: Local Development)');
        console.log('7. 複製生成的 Token');
        console.log('8. 更新 .env 檔案中的 CONTENTFUL_MANAGEMENT_TOKEN');
        console.log('\n⚠️ 注意: Management Token 格式應為 CFPAT-xxxxxxxxxx');
    }
}).catch(error => {
    console.log('   錯誤:', error.message);
});

// 測試本地新增功能
console.log('\n3. 測試本地新增功能:');
const CrudManager = require('./src/js/crudManager.js');
const crudManager = new CrudManager(contentfulManager);

// 測試新增食品（只在本地）
const testFood = {
    name: '測試食品 - 本地',
    brand: '測試品牌',
    price: 'NT$ 50',
    status: '良好',
    expiry: '2025-12-31'
};

crudManager.createFood(testFood).then(result => {
    console.log('   本地新增食品:', result.success ? '✅ 成功' : '❌ 失敗');
    console.log('   食品總數:', crudManager.foodItems.length);
    
    // 檢查是否有 contentfulId
    const lastFood = crudManager.foodItems[crudManager.foodItems.length - 1];
    console.log('   Contentful ID:', lastFood.contentfulId || '❌ 未同步');
});