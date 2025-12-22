// 最終同步測試
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testFinalSync() {
    console.log('🎯 最終同步測試\n');

    const contentfulManager = new ContentfulManager();
    const crudManager = new CrudManager(contentfulManager);

    console.log('1. 測試新增食品並同步到 Contentful...');
    const testFood = await crudManager.createFood({
        name: '最終測試食品 - ' + new Date().toLocaleTimeString(),
        brand: '測試品牌',
        price: 'NT$ 99',
        status: '良好',
        expiry: '2025-12-31'
    });

    console.log('   本地新增:', testFood.success ? '✅ 成功' : '❌ 失敗');
    console.log('   Contentful ID:', testFood.data.contentfulId || '未同步');
    console.log('   同步佇列 ID:', testFood.data.syncQueueId || '無');
    console.log();

    console.log('2. 測試新增訂閱並同步到 Contentful...');
    const testSubscription = await crudManager.createSubscription({
        name: '最終測試訂閱 - ' + new Date().toLocaleTimeString(),
        url: 'https://final-test.example.com',
        price: 'NT$ 199',
        nextPayment: '2025-12-31'
    });

    console.log('   本地新增:', testSubscription.success ? '✅ 成功' : '❌ 失敗');
    console.log('   Contentful ID:', testSubscription.data.contentfulId || '未同步');
    console.log('   同步佇列 ID:', testSubscription.data.syncQueueId || '無');
    console.log();

    // 等待一下再檢查 Contentful
    console.log('3. 等待 2 秒後檢查 Contentful 資料...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const foods = await contentfulManager.getFoodItems();
        const subscriptions = await contentfulManager.getSubscriptions();
        
        console.log('   Contentful 食品總數:', foods.length);
        console.log('   Contentful 訂閱總數:', subscriptions.length);
        
        // 檢查是否有新增的項目
        const latestFood = foods[foods.length - 1];
        const latestSub = subscriptions[subscriptions.length - 1];
        
        if (latestFood && latestFood.name.includes('最終測試食品')) {
            console.log('   ✅ 新食品已同步到 Contentful:', latestFood.name);
        }
        
        if (latestSub && latestSub.name.includes('最終測試訂閱')) {
            console.log('   ✅ 新訂閱已同步到 Contentful:', latestSub.name);
        }
        
    } catch (error) {
        console.log('   檢查 Contentful 資料時發生錯誤:', error.message);
    }

    console.log('\n🎉 同步測試完成！');
    
    if (testFood.data.contentfulId && testSubscription.data.contentfulId) {
        console.log('✅ 完美！新增資料已成功同步到 Contentful');
    } else {
        console.log('⚠️ 資料已新增到本地，但同步到 Contentful 可能需要檢查');
    }
}

testFinalSync().catch(console.error);