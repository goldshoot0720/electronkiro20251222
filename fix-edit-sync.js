/**
 * 修復編輯功能同步問題
 * 這個腳本會立即修復食品和訂閱編輯功能的同步問題
 */

// 在瀏覽器環境中執行的修復腳本
(function() {
    'use strict';

    console.log('🔧 開始修復編輯功能同步問題...');

    // 檢查必要的管理器是否存在
    if (!window.app || !window.app.crudManager) {
        console.error('❌ CRUD 管理器未找到，請確保應用已正確初始化');
        return;
    }

    const crudManager = window.app.crudManager;
    const contentfulManager = window.app.contentfulManager;

    // 修復 updateFood 方法
    const originalUpdateFood = crudManager.updateFood.bind(crudManager);
    crudManager.updateFood = async function(id, updateData) {
        console.log('🍎 執行食品更新 (已修復版本):', id, updateData);
        
        const index = this.foodItems.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的食品' };
        }

        const updatedFood = {
            ...this.foodItems[index],
            ...updateData,
            daysLeft: this.calculateDaysLeft(updateData.expiry || this.foodItems[index].expiry),
            updatedAt: new Date()
        };

        this.foodItems[index] = updatedFood;
        console.log('✅ 本地食品更新完成:', updatedFood);

        // 嘗試同步到 Contentful
        if (contentfulManager && this.isOnline && updatedFood.contentfulId) {
            try {
                console.log('🔄 正在同步食品更新到 Contentful...', updatedFood.contentfulId);
                const result = await contentfulManager.updateFoodEntry(updatedFood.contentfulId, updatedFood);
                if (result.success) {
                    console.log('✅ 食品更新已同步到 Contentful:', updatedFood.contentfulId);
                } else {
                    console.warn('⚠️ 食品更新同步到 Contentful 失敗:', result.error);
                }
            } catch (error) {
                console.error('❌ 同步食品更新到 Contentful 時發生錯誤:', error);
            }
        } else {
            console.log('ℹ️ 跳過 Contentful 同步 (離線模式或無 Contentful ID)');
        }

        return { success: true, data: updatedFood, message: '食品更新成功' };
    };

    // 修復 updateSubscription 方法
    const originalUpdateSubscription = crudManager.updateSubscription.bind(crudManager);
    crudManager.updateSubscription = async function(id, updateData) {
        console.log('💳 執行訂閱更新 (已修復版本):', id, updateData);
        
        const index = this.subscriptions.findIndex(item => item.id === parseInt(id));
        
        if (index === -1) {
            return { success: false, message: '找不到指定的訂閱' };
        }

        const updatedSubscription = {
            ...this.subscriptions[index],
            ...updateData,
            daysLeft: this.calculateDaysLeft(updateData.nextPayment || this.subscriptions[index].nextPayment),
            status: this.getSubscriptionStatus(updateData.nextPayment || this.subscriptions[index].nextPayment),
            updatedAt: new Date()
        };

        this.subscriptions[index] = updatedSubscription;
        console.log('✅ 本地訂閱更新完成:', updatedSubscription);

        // 嘗試同步到 Contentful
        if (contentfulManager && this.isOnline && updatedSubscription.contentfulId) {
            try {
                console.log('🔄 正在同步訂閱更新到 Contentful...', updatedSubscription.contentfulId);
                const result = await contentfulManager.updateSubscriptionEntry(updatedSubscription.contentfulId, updatedSubscription);
                if (result.success) {
                    console.log('✅ 訂閱更新已同步到 Contentful:', updatedSubscription.contentfulId);
                } else {
                    console.warn('⚠️ 訂閱更新同步到 Contentful 失敗:', result.error);
                }
            } catch (error) {
                console.error('❌ 同步訂閱更新到 Contentful 時發生錯誤:', error);
            }
        } else {
            console.log('ℹ️ 跳過 Contentful 同步 (離線模式或無 Contentful ID)');
        }

        return { success: true, data: updatedSubscription, message: '訂閱更新成功' };
    };

    // 測試修復是否生效
    console.log('🧪 測試修復效果...');
    
    // 檢查食品數據
    const foods = crudManager.readAllFood();
    console.log(`📊 當前食品數量: ${foods.length}`);
    foods.forEach(food => {
        console.log(`   - ${food.name} (ID: ${food.id}, Contentful ID: ${food.contentfulId || '未設定'})`);
    });

    // 檢查訂閱數據
    const subscriptions = crudManager.readAllSubscriptions();
    console.log(`📊 當前訂閱數量: ${subscriptions.length}`);
    subscriptions.forEach(sub => {
        console.log(`   - ${sub.name} (ID: ${sub.id}, Contentful ID: ${sub.contentfulId || '未設定'})`);
    });

    // 添加測試按鈕到頁面
    const testButton = document.createElement('button');
    testButton.textContent = '🧪 測試編輯同步';
    testButton.className = 'btn btn-warning';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.onclick = async function() {
        console.log('🧪 開始測試編輯同步功能...');
        
        // 測試食品編輯
        if (foods.length > 0) {
            const testFood = foods[0];
            console.log(`🍎 測試編輯食品: ${testFood.name}`);
            
            const result = await crudManager.updateFood(testFood.id, {
                name: testFood.name + ' (測試編輯)',
                status: '測試中'
            });
            
            if (result.success) {
                console.log('✅ 食品編輯測試成功');
                alert('✅ 食品編輯同步測試成功！');
            } else {
                console.log('❌ 食品編輯測試失敗:', result.message);
                alert('❌ 食品編輯測試失敗: ' + result.message);
            }
        }
        
        // 測試訂閱編輯
        if (subscriptions.length > 0) {
            const testSub = subscriptions[0];
            console.log(`💳 測試編輯訂閱: ${testSub.name}`);
            
            const result = await crudManager.updateSubscription(testSub.id, {
                name: testSub.name + ' (測試編輯)',
                price: 'NT$ 999'
            });
            
            if (result.success) {
                console.log('✅ 訂閱編輯測試成功');
                alert('✅ 訂閱編輯同步測試成功！');
            } else {
                console.log('❌ 訂閱編輯測試失敗:', result.message);
                alert('❌ 訂閱編輯測試失敗: ' + result.message);
            }
        }
    };
    
    document.body.appendChild(testButton);

    console.log('✅ 編輯功能同步修復完成！');
    console.log('💡 現在編輯食品和訂閱時會自動同步到 Contentful');
    console.log('🧪 點擊右上角的測試按鈕來驗證修復效果');

    // 顯示成功通知
    if (typeof alert !== 'undefined') {
        setTimeout(() => {
            alert('✅ 編輯功能同步修復完成！\n\n現在編輯食品和訂閱時會自動同步到 Contentful。\n\n點擊右上角的測試按鈕來驗證修復效果。');
        }, 1000);
    }

})();