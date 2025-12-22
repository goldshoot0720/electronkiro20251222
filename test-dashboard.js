/**
 * 儀表板功能測試
 * 測試統計數據、提醒系統和UI更新
 */

console.log('🎯 開始測試儀表板功能...');

// 模擬測試數據
const testData = {
    subscriptions: [
        {
            id: 'sub1',
            name: 'Netflix 訂閱',
            expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天後到期
            price: 390,
            category: '娛樂'
        },
        {
            id: 'sub2',
            name: 'Spotify Premium',
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天後到期
            price: 149,
            category: '音樂'
        },
        {
            id: 'sub3',
            name: 'Adobe Creative Cloud',
            expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 已過期1天
            price: 1680,
            category: '工具'
        }
    ],
    foodItems: [
        {
            id: 'food1',
            name: '牛奶',
            expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天後到期
            category: '乳製品',
            location: '冰箱'
        },
        {
            id: 'food2',
            name: '麵包',
            expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15天後到期
            category: '主食',
            location: '廚房'
        },
        {
            id: 'food3',
            name: '優格',
            expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 已過期2天
            category: '乳製品',
            location: '冰箱'
        }
    ]
};

/**
 * 測試儀表板統計功能
 */
function testDashboardStats() {
    console.log('📊 測試儀表板統計功能...');
    
    // 模擬 CRUD 管理器數據
    if (typeof window !== 'undefined' && window.app && window.app.crudManager) {
        window.app.crudManager.subscriptions = testData.subscriptions;
        window.app.crudManager.foodItems = testData.foodItems;
        
        console.log('✅ 測試數據已載入到 CRUD 管理器');
        
        // 測試儀表板刷新
        if (window.dashboardManager) {
            window.dashboardManager.refreshDashboard();
            console.log('✅ 儀表板數據已刷新');
            
            // 檢查統計結果
            const stats = window.dashboardManager.getStatsSummary();
            console.log('📈 統計摘要:', stats);
            
            return stats;
        } else {
            console.error('❌ 儀表板管理器未找到');
            return null;
        }
    } else {
        console.error('❌ CRUD 管理器未初始化');
        return null;
    }
}

/**
 * 測試提醒系統
 */
function testAlertSystem() {
    console.log('⚠️ 測試提醒系統...');
    
    if (typeof window !== 'undefined' && window.dashboardManager) {
        const alerts = window.dashboardManager.alerts;
        
        console.log('📋 訂閱提醒:', alerts.subscriptions);
        console.log('🍎 食品提醒:', alerts.food);
        
        // 檢查提醒數量
        const urgentSubscriptions = alerts.subscriptions.filter(a => a.status === 'danger').length;
        const urgentFood = alerts.food.filter(a => a.status === 'danger').length;
        
        console.log(`🚨 緊急訂閱提醒: ${urgentSubscriptions} 個`);
        console.log(`🚨 緊急食品提醒: ${urgentFood} 個`);
        
        return {
            subscriptions: alerts.subscriptions,
            food: alerts.food,
            urgentCount: urgentSubscriptions + urgentFood
        };
    } else {
        console.error('❌ 儀表板管理器未找到');
        return null;
    }
}

/**
 * 測試UI更新
 */
function testUIUpdate() {
    console.log('🎨 測試UI更新...');
    
    // 檢查統計卡片
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    console.log(`📊 找到 ${statCards.length} 個統計卡片`);
    
    // 檢查提醒列表
    const subscriptionAlerts = document.getElementById('subscription-alerts');
    const foodAlerts = document.getElementById('food-alerts');
    
    if (subscriptionAlerts) {
        console.log('✅ 訂閱提醒區域已找到');
        console.log('📝 訂閱提醒內容:', subscriptionAlerts.innerHTML.substring(0, 100) + '...');
    }
    
    if (foodAlerts) {
        console.log('✅ 食品提醒區域已找到');
        console.log('📝 食品提醒內容:', foodAlerts.innerHTML.substring(0, 100) + '...');
    }
    
    return {
        statCardsCount: statCards.length,
        hasSubscriptionAlerts: !!subscriptionAlerts,
        hasFoodAlerts: !!foodAlerts
    };
}

/**
 * 執行完整測試
 */
function runDashboardTests() {
    console.log('🧪 執行完整儀表板測試...');
    
    const results = {
        stats: null,
        alerts: null,
        ui: null,
        success: false
    };
    
    try {
        // 等待頁面載入
        if (typeof window !== 'undefined' && document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => runDashboardTests(), 2000);
            });
            return;
        }
        
        // 測試統計功能
        results.stats = testDashboardStats();
        
        // 等待一下讓數據更新
        setTimeout(() => {
            // 測試提醒系統
            results.alerts = testAlertSystem();
            
            // 測試UI更新
            results.ui = testUIUpdate();
            
            // 檢查測試結果
            results.success = !!(results.stats && results.alerts && results.ui);
            
            console.log('🎯 測試結果:', results);
            
            if (results.success) {
                console.log('✅ 所有儀表板測試通過！');
                
                // 顯示成功通知
                if (typeof window !== 'undefined' && window.app && typeof window.app.showNotification === 'function') {
                    window.app.showNotification('儀表板測試完成！', 'success');
                }
            } else {
                console.log('❌ 部分測試失敗，請檢查控制台錯誤');
            }
            
        }, 1000);
        
    } catch (error) {
        console.error('❌ 測試執行失敗:', error);
        results.success = false;
    }
    
    return results;
}

/**
 * 生成測試報告
 */
function generateTestReport() {
    console.log('📋 生成儀表板測試報告...');
    
    const report = {
        timestamp: new Date().toISOString(),
        testData: testData,
        results: runDashboardTests(),
        environment: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
            url: typeof window !== 'undefined' ? window.location.href : 'N/A'
        }
    };
    
    console.log('📊 完整測試報告:', report);
    
    return report;
}

// 如果在瀏覽器環境中，自動執行測試
if (typeof window !== 'undefined') {
    // 等待頁面完全載入後執行測試
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                console.log('🚀 自動執行儀表板測試...');
                runDashboardTests();
            }, 3000); // 等待3秒讓所有組件初始化
        });
    } else {
        setTimeout(() => {
            console.log('🚀 自動執行儀表板測試...');
            runDashboardTests();
        }, 1000);
    }
    
    // 提供全域測試函數
    window.testDashboard = runDashboardTests;
    window.generateDashboardReport = generateTestReport;
}

// Node.js 環境導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testDashboardStats,
        testAlertSystem,
        testUIUpdate,
        runDashboardTests,
        generateTestReport,
        testData
    };
}

console.log('💡 可用的測試命令:');
console.log('   testDashboard()           // 執行儀表板測試');
console.log('   generateDashboardReport() // 生成測試報告');
console.log('   dashboardManager.refreshDashboard() // 手動刷新儀表板');
console.log('   dashboardManager.exportData()       // 導出儀表板數據');