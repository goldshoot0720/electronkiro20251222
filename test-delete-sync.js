// 測試刪除同步功能
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testDeleteSync() {
    console.log('🧪 測試刪除同步功能\n');

    try {
        // 1. 初始化管理器
        console.log('1. 初始化管理器...');
        const contentfulManager = new ContentfulManager();
        const crudManager = new CrudManager(contentfulManager);

        // 2. 載入現有資料
        console.log('\n2. 載入現有資料...');
        const loaded = await crudManager.loadFromContentful();
        console.log('   載入結果:', loaded ? '✅ 成功' : '⚠️ 使用備用資料');

        // 3. 顯示當前資料
        const foods = crudManager.readAllFood();
        const subscriptions = crudManager.readAllSubscriptions();
        console.log(`\n3. 當前資料狀態:`);
        console.log(`   - 食品: ${foods.length} 項`);
        console.log(`   - 訂閱: ${subscriptions.length} 項`);

        // 4. 測試新增食品（以便有資料可以刪除）
        console.log('\n4. 新增測試食品...');
        const newFood = await crudManager.createFood({
            name: '測試刪除食品',
            brand: '測試品牌',
            price: 'NT$ 50',
            status: '良好',
            expiry: '2025-12-31'
        });
        console.log('   新增結果:', newFood.success ? '✅ 成功' : '❌ 失敗');
        if (newFood.success) {
            console.log('   食品 ID:', newFood.data.id);
            console.log('   Contentful ID:', newFood.data.contentfulId);
        }

        // 5. 測試新增訂閱（以便有資料可以刪除）
        console.log('\n5. 新增測試訂閱...');
        const newSubscription = await crudManager.createSubscription({
            name: '測試刪除訂閱',
            url: 'https://test-delete.com',
            price: 'NT$ 99',
            nextPayment: '2025-12-31'
        });
        console.log('   新增結果:', newSubscription.success ? '✅ 成功' : '❌ 失敗');
        if (newSubscription.success) {
            console.log('   訂閱 ID:', newSubscription.data.id);
            console.log('   Contentful ID:', newSubscription.data.contentfulId);
        }

        // 等待一下確保資料已同步
        console.log('\n⏳ 等待 3 秒確保資料已同步...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 6. 測試刪除食品
        if (newFood.success) {
            console.log('\n6. 測試刪除食品...');
            const deleteResult = await crudManager.deleteFood(newFood.data.id);
            console.log('   刪除結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
            console.log('   刪除訊息:', deleteResult.message);
        }

        // 7. 測試刪除訂閱
        if (newSubscription.success) {
            console.log('\n7. 測試刪除訂閱...');
            const deleteResult = await crudManager.deleteSubscription(newSubscription.data.id);
            console.log('   刪除結果:', deleteResult.success ? '✅ 成功' : '❌ 失敗');
            console.log('   刪除訊息:', deleteResult.message);
        }

        // 8. 檢查同步狀態
        console.log('\n8. 檢查同步狀態...');
        const syncReport = crudManager.getSyncReport();
        if (syncReport.error) {
            console.log('   同步報告:', syncReport.error);
        } else {
            console.log('   待同步項目:', syncReport.summary.pendingItems);
            console.log('   已同步項目:', syncReport.summary.syncedItems);
            console.log('   總項目:', syncReport.summary.totalItems);
        }

        // 9. 最終資料狀態
        const finalFoods = crudManager.readAllFood();
        const finalSubscriptions = crudManager.readAllSubscriptions();
        console.log(`\n9. 最終資料狀態:`);
        console.log(`   - 食品: ${finalFoods.length} 項`);
        console.log(`   - 訂閱: ${finalSubscriptions.length} 項`);

        console.log('\n✅ 刪除同步功能測試完成');

    } catch (error) {
        console.error('\n❌ 測試過程中發生錯誤:', error);
    }
}

// 執行測試
if (require.main === module) {
    testDeleteSync().catch(console.error);
}

module.exports = testDeleteSync;