// 測試資料同步腳本
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testDataSync() {
    console.log('🚀 開始測試資料同步...\n');
    
    try {
        // 1. 初始化 ContentfulManager
        console.log('1️⃣ 初始化 ContentfulManager...');
        const contentfulManager = new ContentfulManager();
        
        // 2. 測試 Contentful 連接
        console.log('2️⃣ 測試 Contentful 連接...');
        const connectionTest = await contentfulManager.testConnection();
        console.log('   連接結果:', connectionTest.success ? '✅ 成功' : '❌ 失敗');
        console.log('   訊息:', connectionTest.message);
        
        if (!connectionTest.success) {
            console.log('❌ Contentful 連接失敗，無法進行同步測試');
            return;
        }
        
        // 3. 初始化 CrudManager 並載入 Contentful 資料
        console.log('\n3️⃣ 初始化 CrudManager 並載入 Contentful 資料...');
        const crudManager = new CrudManager(contentfulManager);
        const loaded = await crudManager.loadFromContentful();
        
        if (loaded) {
            console.log('✅ 資料同步成功！');
            
            // 4. 顯示同步後的資料
            console.log('\n4️⃣ 同步後的資料:');
            
            const foods = crudManager.readAllFood();
            console.log(`\n🍜 食品資料 (${foods.length} 項):`);
            foods.forEach((food, index) => {
                console.log(`   ${index + 1}. ${food.name}`);
                console.log(`      品牌: ${food.brand}`);
                console.log(`      價格: ${food.price}`);
                console.log(`      狀態: ${food.status}`);
                console.log(`      到期日: ${food.expiry}`);
                console.log(`      剩餘天數: ${food.daysLeft} 天`);
                console.log('');
            });
            
            const subscriptions = crudManager.readAllSubscriptions();
            console.log(`📱 訂閱資料 (${subscriptions.length} 項):`);
            subscriptions.forEach((sub, index) => {
                console.log(`   ${index + 1}. ${sub.name}`);
                console.log(`      URL: ${sub.url}`);
                console.log(`      價格: ${sub.price}`);
                console.log(`      下次付款: ${sub.nextPayment}`);
                console.log(`      剩餘天數: ${sub.daysLeft} 天`);
                console.log(`      狀態: ${sub.status}`);
                console.log('');
            });
            
            // 5. 統計資訊
            console.log('📊 統計資訊:');
            const foodStats = crudManager.getFoodStats();
            const subStats = crudManager.getSubscriptionStats();
            
            console.log(`   食品總數: ${foodStats.total}`);
            console.log(`   即將到期食品 (≤7天): ${foodStats.expiring7Days}`);
            console.log(`   訂閱總數: ${subStats.total}`);
            console.log(`   即將到期訂閱 (≤7天): ${subStats.expiring7Days}`);
            
        } else {
            console.log('❌ 資料同步失敗，使用本地備用資料');
        }
        
        console.log('\n✅ 測試完成');
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    }
}

// 執行測試
testDataSync();