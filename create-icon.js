// 創建應用程式圖標的腳本
const fs = require('fs');
const path = require('path');

console.log('🎨 檢查應用程式圖標...');

const iconPngPath = path.join(__dirname, 'assets', 'icon.png');
const iconIcoPath = path.join(__dirname, 'assets', 'icon.ico');

// 檢查 PNG 圖標是否存在
if (fs.existsSync(iconPngPath)) {
    console.log('✅ 找到 PNG 圖標:', iconPngPath);
    
    // 如果沒有 ICO 圖標，複製 PNG 作為臨時解決方案
    if (!fs.existsSync(iconIcoPath)) {
        console.log('📋 複製 PNG 圖標作為 ICO 圖標...');
        fs.copyFileSync(iconPngPath, iconIcoPath);
        console.log('✅ ICO 圖標已創建');
    } else {
        console.log('✅ ICO 圖標已存在');
    }
} else {
    console.log('⚠️ 未找到 PNG 圖標，創建預設圖標...');
    
    // 創建一個簡單的 SVG 圖標並轉換為 PNG
    const svgIcon = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="256" height="256" rx="32" fill="url(#grad1)"/>
        <text x="128" y="140" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="white">鋒</text>
        <text x="128" y="200" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white">AI系統</text>
    </svg>
    `;
    
    // 將 SVG 保存為文件（作為備用）
    fs.writeFileSync(path.join(__dirname, 'assets', 'icon.svg'), svgIcon);
    console.log('✅ SVG 圖標已創建');
}

console.log('🎨 圖標檢查完成');