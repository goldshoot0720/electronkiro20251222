const contentful = require('contentful-management')

// 測試 Contentful Management API 連接
async function testContentfulWrite() {
    try {
        console.log('測試 Contentful Management API 連接...\n')
        
        // 需要 Management API Token，不是 Delivery API Token
        const client = contentful.createClient({
            accessToken: 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE' // 這裡需要 Management API Token
        })
        
        const space = await client.getSpace('navontrqk0l3')
        console.log('✓ 成功連接到 Space:', space.name)
        
        const environment = await space.getEnvironment('master')
        console.log('✓ 成功連接到 Environment: master')
        
        return true
    } catch (error) {
        console.error('❌ Management API 連接失敗:', error.message)
        console.log('\n📝 解決方案:')
        console.log('1. 需要安裝 contentful-management: npm install contentful-management')
        console.log('2. 需要 Management API Token (不是 Delivery API Token)')
        console.log('3. 在 Contentful 後台 Settings > API keys > Content management tokens 創建')
        return false
    }
}

testContentfulWrite()