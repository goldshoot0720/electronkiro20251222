// 測試 Token 權限
require('dotenv').config();
const contentfulManagement = require('contentful-management');

async function testTokenPermissions() {
    console.log('🔍 測試 Management Token 權限\n');
    
    try {
        const client = contentfulManagement.createClient({
            accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
        });
        
        console.log('1. 測試基本連接...');
        
        // 先測試能否列出所有 spaces
        console.log('2. 列出可存取的 Spaces...');
        const spaces = await client.getSpaces();
        console.log('   可存取的 Spaces:', spaces.items.length, '個');
        
        spaces.items.forEach((space, index) => {
            console.log(`   ${index + 1}. ${space.name} (${space.sys.id})`);
        });
        
        // 檢查目標 space 是否在列表中
        const targetSpace = spaces.items.find(space => space.sys.id === 'navontrqk0l3');
        
        if (targetSpace) {
            console.log('\n✅ 找到目標 Space:', targetSpace.name);
            
            // 嘗試存取 environment
            console.log('3. 測試 Environment 存取...');
            const environment = await targetSpace.getEnvironment('master');
            console.log('✅ 成功存取 master environment');
            
            // 測試內容類型
            console.log('4. 檢查內容類型...');
            const contentTypes = await environment.getContentTypes();
            console.log('   內容類型:', contentTypes.items.length, '個');
            
            contentTypes.items.forEach(ct => {
                console.log(`   - ${ct.name} (${ct.sys.id})`);
            });
            
            // 檢查是否有 food 和 subscription 類型
            const foodType = contentTypes.items.find(ct => ct.sys.id === 'food');
            const subscriptionType = contentTypes.items.find(ct => ct.sys.id === 'subscription');
            
            console.log('\n5. 檢查必要的內容類型:');
            console.log('   food:', foodType ? '✅ 存在' : '❌ 不存在');
            console.log('   subscription:', subscriptionType ? '✅ 存在' : '❌ 不存在');
            
        } else {
            console.log('\n❌ 無法找到目標 Space (navontrqk0l3)');
            console.log('   可能原因:');
            console.log('   1. Token 沒有存取此 Space 的權限');
            console.log('   2. Space ID 不正確');
            console.log('   3. Token 已過期或無效');
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        
        if (error.message.includes('OrganizationAccessGrantRequired')) {
            console.log('\n💡 解決方案:');
            console.log('1. 確認你是此 Contentful Space 的擁有者或管理員');
            console.log('2. 重新生成 Management Token 並確保有正確權限');
            console.log('3. 檢查 Space ID 是否正確: navontrqk0l3');
        }
    }
}

testTokenPermissions();