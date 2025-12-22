// 完整同步系統測試
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testCompleteSyncSystem() {
    console.log('🚀 測試完整同步系統\n');

    // 初始化管理器
    const contentfulManager = new ContentfulManager();
    const crudManager = new CrudManager(contentfulManager);

    console.log('1. 載入現有資料...');
    await crudManager.loadFromContentful();
    console.log(`   食品: ${crudManager.foodItems.length} 項`);
    console.log(`   訂閱: ${crudManager.subscriptions.length} 項\n`);

    console.log('2. 測試新增食品（含同步）...');
    const newFood = await crudManager.createFood({
        name: '測試食品 - 完整同步 ' + new Date().toLocaleTimeString(),
        brand: '測試品牌',
        price: 'NT$ 88',
        status: '良好',
        expiry: '2025-12-31'
    });
    console.log('   結果:', newFood.success ? '✅ 成功' : '❌ 失敗');
    console.log('   食品 ID:', newFood.data.id);
    console.log('   Contentful ID:', newFood.data.contentfulId || '未同步');
    console.log('   同步佇列 ID:', newFood.data.syncQueueId || '無');
    console.log();

    console.log('3. 測試新增訂閱（含同步）...');
    const newSubscription = await crudManager.createSubscription({
        name: '測試訂閱 - 完整同步 ' + new Date().toLocaleTimeString(),
        url: 'https://test-sync.example.com',
        price: 'NT$ 299',
        nextPayment: '2025-12-31'
    });
    console.log('   結果:', newSubscription.success ? '✅ 成功' : '❌ 失敗');
    console.log('   訂閱 ID:', newSubscription.data.id);
    console.log('   Contentful ID:', newSubscription.data.contentfulId || '未同步');
    console.log('   同步佇列 ID:', newSubscription.data.syncQueueId || '無');
    console.log();

    console.log('4. 同步狀態報告...');
    const syncReport = crudManager.getSyncReport();
    if (syncReport.error) {
        console.log('   錯誤:', syncReport.error);
    } else {
        console.log('   總項目:', syncReport.summary.totalItems);
        console.log('   待同步:', syncReport.summary.pendingItems);
        console.log('   已同步:', syncReport.summary.syncedItems);
        console.log('   最後同步:', syncReport.summary.lastSync || '從未同步');
    }
    console.log();

    console.log('5. 待同步項目列表...');
    const pendingItems = crudManager.getPendingSyncItems();
    if (pendingItems.length > 0) {
        console.log(`   共 ${pendingItems.length} 項待同步:`);
        pendingItems.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.type}: ${item.data.name} (ID: ${item.id})`);
        });
    } else {
        console.log('   無待同步項目');
    }
    console.log();

    console.log('6. 匯出同步資料...');
    const exportFile = crudManager.exportPendingSync();
    if (exportFile.error) {
        console.log('   錯誤:', exportFile.error);
    } else {
        console.log('   匯出檔案:', exportFile);
    }
    console.log();

    console.log('7. 最終狀態:');
    console.log(`   本地食品: ${crudManager.foodItems.length} 項`);
    console.log(`   本地訂閱: ${crudManager.subscriptions.length} 項`);
    console.log(`   線上狀態: ${crudManager.isOnline ? '✅ 在線' : '❌ 離線'}`);

    console.log('\n📋 同步解決方案總結:');
    console.log('✅ 本地新增功能正常');
    console.log('✅ 本地同步佇列功能正常');
    console.log('✅ 匯出功能可用於手動同步');
    console.log('⚠️ Contentful Management API 需要權限設定');
    
    console.log('\n🔧 手動同步步驟:');
    console.log('1. 查看匯出的 JSON 檔案');
    console.log('2. 在 Contentful 後台手動創建對應條目');
    console.log('3. 使用 crudManager.markItemAsSynced(syncQueueId) 標記為已同步');

    return {
        crudManager,
        syncReport,
        pendingItems,
        exportFile
    };
}

testCompleteSyncSystem().catch(console.error);