// Contentful 配置檔案
// 請在 Contentful 後台創建 Management Token 並替換下面的值

module.exports = {
    // Delivery API (讀取資料)
    delivery: {
        space: 'navontrqk0l3',
        environment: 'master',
        accessToken: '83Q5hThGBPCIgXAYX7Fc-gSUN-psxg_j-F-gXSskQBc'
    },
    
    // Management API (寫入資料)
    management: {
        space: 'navontrqk0l3',
        environment: 'master',
        // 請到 Contentful 後台 Settings > API keys > Content management tokens 創建
        // 然後替換下面的 Token
        accessToken: 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE'
    }
}

// 如何獲取 Management Token:
// 1. 登入 Contentful 後台
// 2. 進入 Settings > API keys
// 3. 點擊 "Content management tokens" 標籤
// 4. 點擊 "Generate personal token"
// 5. 輸入名稱（例如：Local Development）
// 6. 複製生成的 Token 並替換上面的 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE'