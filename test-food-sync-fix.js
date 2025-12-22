// 測試修正後的食品同步
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testFoodSyncFix() {
    console.log('🔧 測試修正後的食品同步\n');

    const contentfulManager = new ContentfulManager();
    const crudManager = new CrudManager(contentfulManager);

    console.log('測試新增食品並同步到 Contentful...');
    const testFood = await crudManager.createFood({
        name: '修正測試食品 - ' + new Date().toLocaleTimeString(),
        brand: '數量5', // 包含數字，應該能正確解析
        price: 'NT$ 88',
        status: '良好',
        expiry: '2025-12-31'
    });

    console.log('結果:');
    console.log('   本地新增:', testFood.success ? '✅ 成功' : '❌ 失敗');
    console.log('   食品名稱:', testFood.data.name);
    console.log('   Contentful ID:', testFood.data.contentfulId || '❌ 未同步');
    console.log('   同步佇列 ID:', testFood.data.syncQueueId || '無');

    if (testFood.data.contentfulId) {
        console.log('\n🎉 太棒了！食品已成功同步到 Contentful！');
        
        // 驗證同步
        console.log('\n驗證同步結果...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            const foods = await contentfulManager.getFoodItems();
            const latestFood = foods.find(f => f.name.includes('修正測試食品'));
            
            if (latestFood) {
                console.log('✅ 在 Contentful 中找到新食品:', latestFood.name);
                console.log('   數量:', latestFood.brand);
                console.log('   到期日:', latestFood.expiry);
            } else {
                console.log('⚠️ 在 Contentful 中未找到新食品（可能需要等待）');
            }
        } catch (error) {
            console.log('驗證時發生錯誤:', error.message);
        }
    } else {
        console.log('\n❌ 食品同步失敗，已加入本地同步佇列');
    }
}

testFoodSyncFix().catch(console.error);