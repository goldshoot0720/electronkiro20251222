// 完整的同步測試
const ContentfulManager = require('./src/js/contentfulManager.js')
const CrudManager = require('./src/js/crudManager.js')

async function testCompleteSync() {
    console.log('🚀 開始完整同步測試...\n')
    
    // 初始化管理器
    const contentfulManager = new ContentfulManager()
    const crudManager = new CrudManager(contentfulManager)
    
    // 測試連接
    console.log('1. 測試 Contentful 連接...')
    const connectionTest = await contentfulManager.testConnection()
    console.log(connectionTest.success ? '✅ 連接成功' : '❌ 連接失敗')
    console.log('   ', connectionTest.message)
    console.log()
    
    // 載入現有資料
    console.log('2. 載入現有資料...')
    await crudManager.loadFromContentful()
    console.log(`   食品: ${crudManager.foodItems.length} 項`)
    console.log(`   訂閱: ${crudManager.subscriptions.length} 項`)
    console.log()
    
    // 測試新增食品（這會嘗試同步到 Contentful）
    console.log('3. 測試新增食品...')
    const newFood = await crudManager.createFood({
        name: '測試食品 - ' + new Date().toLocaleTimeString(),
        brand: '測試品牌',
        price: 'NT$ 99',
        status: '良好',
        expiry: '2025-12-31'
    })
    console.log('   結果:', newFood.success ? '✅ 成功' : '❌ 失敗')
    console.log('   訊息:', newFood.message)
    console.log()
    
    // 測試新增訂閱（這會嘗試同步到 Contentful）
    console.log('4. 測試新增訂閱...')
    const newSubscription = await crudManager.createSubscription({
        name: '測試訂閱 - ' + new Date().toLocaleTimeString(),
        url: 'https://example.com',
        price: 'NT$ 199',
        nextPayment: '2025-12-31'
    })
    console.log('   結果:', newSubscription.success ? '✅ 成功' : '❌ 失敗')
    console.log('   訊息:', newSubscription.message)
    console.log()
    
    // 顯示最終狀態
    console.log('5. 最終狀態:')
    console.log(`   本地食品: ${crudManager.foodItems.length} 項`)
    console.log(`   本地訂閱: ${crudManager.subscriptions.length} 項`)
    console.log(`   線上狀態: ${crudManager.isOnline ? '✅ 在線' : '❌ 離線'}`)
    
    console.log('\n📝 注意事項:')
    console.log('- 如果看到 Management Token 相關錯誤，請設定 contentful-config.js')
    console.log('- 新增的資料會先儲存在本地，然後嘗試同步到 Contentful')
    console.log('- 即使同步失敗，本地資料仍會保存')
}

testCompleteSync().catch(console.error)