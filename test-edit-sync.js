/**
 * 測試編輯功能同步到 Contentful
 * 這個腳本測試食品和訂閱的編輯功能是否正確同步到 Contentful
 */

// 載入必要的模組
const ContentfulManager = require('./src/js/contentfulManager.js');
const CrudManager = require('./src/js/crudManager.js');

async function testEditSync() {
    console.log('🧪 開始測試編輯功能同步...\n');

    try {
        // 初始化管理器
        const contentfulManager = new ContentfulManager();
        const crudManager = new CrudManager(contentfulManager);

        // 測試 Contentful 連接
        console.log('1️⃣ 測試 Contentful 連接...');
        const connectionTest = await contentfulManager.testConnection();
        if (!connectionTest.success) {
            console.log('⚠️ Contentful 連接失敗，將使用本地測試模式');
        } else {
            console.log('✅ Contentful 連接成功');
        }

        // 載入現有數據
        console.log('\n2️⃣ 載入現有數據...');
        await crudManager.loadFromContentful();
        
        const foods = crudManager.readAllFood();
        const subscriptions = crudManager.readAllSubscriptions();
        
        console.log(`📊 載入了 ${foods.length} 個食品項目`);
        console.log(`📊 載入了 ${subscriptions.length} 個訂閱項目`);

        // 測試食品編輯同步
        if (foods.length > 0) {
            console.log('\n3️⃣ 測試食品編輯同步...');
            const testFood = foods[0];
            console.log(`🍎 編輯食品: ${testFood.name} (ID: ${testFood.id})`);
            console.log(`   原始到期日: ${testFood.expiry}`);
            console.log(`   Contentful ID: ${testFood.contentfulId || '未設定'}`);

            // 更新食品資料
            const newExpiryDate = new Date();
            newExpiryDate.setDate(newExpiryDate.getDate() + 45); // 45天後
            const newExpiry = newExpiryDate.toISOString().split('T')[0];

            const updateResult = await crudManager.updateFood(testFood.id, {
                name: testFood.name + ' (已編輯)',
                expiry: newExpiry,
                status: '已更新'
            });

            if (updateResult.success) {
                console.log('✅ 食品編輯成功');
                console.log(`   新名稱: ${updateResult.data.name}`);
                console.log(`   新到期日: ${updateResult.data.expiry}`);
                console.log(`   新狀態: ${updateResult.data.status}`);
                
                if (updateResult.data.contentfulId) {
                    console.log('✅ 已同步到 Contentful');
                } else {
                    console.log('⚠️ 未同步到 Contentful (可能加入同步佇列)');
                }
            } else {
                console.log('❌ 食品編輯失敗:', updateResult.message);
            }
        } else {
            console.log('\n3️⃣ 跳過食品編輯測試 (沒有食品數據)');
        }

        // 測試訂閱編輯同步
        if (subscriptions.length > 0) {
            console.log('\n4️⃣ 測試訂閱編輯同步...');
            const testSubscription = subscriptions[0];
            console.log(`💳 編輯訂閱: ${testSubscription.name} (ID: ${testSubscription.id})`);
            console.log(`   原始付款日: ${testSubscription.nextPayment}`);
            console.log(`   Contentful ID: ${testSubscription.contentfulId || '未設定'}`);

            // 更新訂閱資料
            const newPaymentDate = new Date();
            newPaymentDate.setDate(newPaymentDate.getDate() + 60); // 60天後
            const newPayment = newPaymentDate.toISOString().split('T')[0];

            const updateResult = await crudManager.updateSubscription(testSubscription.id, {
                name: testSubscription.name + ' (已編輯)',
                nextPayment: newPayment,
                price: 'NT$ 999',
                url: testSubscription.url + '?updated=true'
            });

            if (updateResult.success) {
                console.log('✅ 訂閱編輯成功');
                console.log(`   新名稱: ${updateResult.data.name}`);
                console.log(`   新付款日: ${updateResult.data.nextPayment}`);
                console.log(`   新價格: ${updateResult.data.price}`);
                console.log(`   新狀態: ${updateResult.data.status}`);
                
                if (updateResult.data.contentfulId) {
                    console.log('✅ 已同步到 Contentful');
                } else {
                    console.log('⚠️ 未同步到 Contentful (可能加入同步佇列)');
                }
            } else {
                console.log('❌ 訂閱編輯失敗:', updateResult.message);
            }
        } else {
            console.log('\n4️⃣ 跳過訂閱編輯測試 (沒有訂閱數據)');
        }

        // 顯示最終狀態
        console.log('\n5️⃣ 最終狀態檢查...');
        const finalFoods = crudManager.readAllFood();
        const finalSubscriptions = crudManager.readAllSubscriptions();
        
        console.log(`📊 最終食品數量: ${finalFoods.length}`);
        console.log(`📊 最終訂閱數量: ${finalSubscriptions.length}`);

        // 檢查同步狀態
        if (crudManager.localSyncManager) {
            const syncReport = crudManager.getSyncReport();
            console.log('\n📋 同步狀態報告:');
            console.log(JSON.stringify(syncReport, null, 2));
        }

        console.log('\n✅ 編輯功能同步測試完成！');

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
        console.error('錯誤詳情:', error.stack);
    }
}

// 執行測試
if (require.main === module) {
    testEditSync().then(() => {
        console.log('\n🎉 測試腳本執行完成');
        process.exit(0);
    }).catch(error => {
        console.error('\n💥 測試腳本執行失敗:', error);
        process.exit(1);
    });
}

module.exports = { testEditSync };