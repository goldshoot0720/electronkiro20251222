// Contentful 連接測試腳本
const contentful = require('contentful');

const client = contentful.createClient({
    space: 'navontrqk0l3',
    environment: 'master',
    accessToken: '83Q5hThGBPCIgXAYX7Fc-gSUN-psxg_j-F-gXSskQBc'
});

console.log('🔍 測試 Contentful 連接...\n');

// 測試 1: 獲取 Space 資訊
client.getSpace()
    .then((space) => {
        console.log('✅ Space 連接成功!');
        console.log('   Space 名稱:', space.name);
        console.log('   Space ID:', space.sys.id);
        console.log('');
        
        // 測試 2: 獲取所有條目
        return client.getEntries();
    })
    .then((entries) => {
        console.log('✅ 成功獲取條目!');
        console.log('   總條目數:', entries.total);
        console.log('');
        
        if (entries.items.length > 0) {
            console.log('📋 條目列表:');
            entries.items.forEach((entry, index) => {
                console.log(`\n   ${index + 1}. Entry ID: ${entry.sys.id}`);
                console.log(`      Content Type: ${entry.sys.contentType.sys.id}`);
                console.log(`      Fields:`, Object.keys(entry.fields));
                
                // 顯示部分欄位內容
                if (entry.fields.title) {
                    console.log(`      Title: ${entry.fields.title}`);
                }
            });
        }
        
        console.log('\n');
        
        // 測試 3: 獲取訂閱管理條目
        console.log('🔍 測試訂閱管理條目 (T76BWqmX6HjjBAYwn7UHt)...');
        return client.getEntry('T76BWqmX6HjjBAYwn7UHt');
    })
    .then((entry) => {
        console.log('✅ 訂閱管理條目:');
        console.log('   Entry ID:', entry.sys.id);
        console.log('   Content Type:', entry.sys.contentType.sys.id);
        console.log('   Fields:', JSON.stringify(entry.fields, null, 2));
        console.log('');
        
        // 測試 4: 獲取食品管理條目
        console.log('🔍 測試食品管理條目 (2oEdTZbpl7jBePWZYopPgx)...');
        return client.getEntry('2oEdTZbpl7jBePWZYopPgx');
    })
    .then((entry) => {
        console.log('✅ 食品管理條目:');
        console.log('   Entry ID:', entry.sys.id);
        console.log('   Content Type:', entry.sys.contentType.sys.id);
        console.log('   Fields:', JSON.stringify(entry.fields, null, 2));
        console.log('');
        
        console.log('🎉 所有測試完成!');
    })
    .catch((error) => {
        console.error('❌ 錯誤:', error.message);
        if (error.response) {
            console.error('   狀態碼:', error.response.status);
            console.error('   詳細資訊:', error.response.data);
        }
    });
