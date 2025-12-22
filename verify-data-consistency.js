const contentful = require('contentful');

// Contentful 客戶端配置
const client = contentful.createClient({
  space: 'navontrqk0l3',
  environment: 'master',
  accessToken: '83Q5hThGBPCIgXAYX7Fc-gSUN-psxg_j-F-gXSskQBc'
});

// 本地資料 (從應用程式中提取)
const localData = {
  foods: [
    {
      id: 'food1',
      name: '【茶台灣】珍奶香吉休閒丸子',
      price: 'NT$ 25',
      category: '零食',
      status: '良好',
      expiryDate: '2026-01-06',
      daysLeft: '15 天'
    },
    {
      id: 'food2', 
      name: '【茶台灣】日式甲殼休閒丸子',
      price: 'NT$ 25',
      category: '零食',
      status: '良好',
      expiryDate: '2026-01-07',
      daysLeft: '16 天'
    }
  ],
  subscriptions: [
    {
      id: 'sub1',
      name: '天虎/實信訊/心靈內科',
      url: 'https://www.tsung.com.tw/index.php/main/schedule_time?id=18',
      price: 'NT$ 530',
      renewalDate: '2025-12-26',
      daysLeft: '4 天'
    },
    {
      id: 'sub2',
      name: 'kiro pro',
      url: 'https://app.kiro.dev/account/',
      price: 'NT$ 640',
      renewalDate: '2026-01-01',
      daysLeft: '10 天'
    }
  ]
};

async function fetchContentfulData() {
  try {
    console.log('🔍 正在從 Contentful 獲取資料...\n');
    
    // 獲取所有 Food 條目
    const foodEntries = await client.getEntries({
      content_type: 'food'
    });
    
    // 獲取所有 Subscription 條目
    const subscriptionEntries = await client.getEntries({
      content_type: 'subscription'
    });
    
    return {
      foods: foodEntries.items,
      subscriptions: subscriptionEntries.items
    };
  } catch (error) {
    console.error('❌ 無法連接到 Contentful:', error.message);
    return null;
  }
}

function compareData(contentfulData, localData) {
  console.log('📊 資料一致性分析報告');
  console.log('='.repeat(50));
  
  // 比較食品資料
  console.log('\n🍜 食品資料比較:');
  console.log(`Contentful 食品數量: ${contentfulData.foods.length}`);
  console.log(`本地食品數量: ${localData.foods.length}`);
  
  console.log('\nContentful 食品清單:');
  contentfulData.foods.forEach((item, index) => {
    console.log(`${index + 1}. ${item.fields.name || '未命名'}`);
    console.log(`   ID: ${item.sys.id}`);
    console.log(`   價格: ${item.fields.price || '未設定'}`);
    console.log(`   狀態: ${item.sys.publishedAt ? '已發布' : '草稿'}`);
  });
  
  console.log('\n本地食品清單:');
  localData.foods.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   價格: ${item.price}`);
    console.log(`   到期日: ${item.expiryDate}`);
  });
  
  // 比較訂閱資料
  console.log('\n📱 訂閱資料比較:');
  console.log(`Contentful 訂閱數量: ${contentfulData.subscriptions.length}`);
  console.log(`本地訂閱數量: ${localData.subscriptions.length}`);
  
  console.log('\nContentful 訂閱清單:');
  contentfulData.subscriptions.forEach((item, index) => {
    console.log(`${index + 1}. ${item.fields.name || '未命名'}`);
    console.log(`   ID: ${item.sys.id}`);
    console.log(`   價格: ${item.fields.price || '未設定'}`);
    console.log(`   狀態: ${item.sys.publishedAt ? '已發布' : '草稿'}`);
  });
  
  console.log('\n本地訂閱清單:');
  localData.subscriptions.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   價格: ${item.price}`);
    console.log(`   續約日期: ${item.renewalDate}`);
  });
  
  // 一致性分析
  console.log('\n🔍 一致性分析:');
  
  // 食品名稱比較
  const contentfulFoodNames = contentfulData.foods.map(item => item.fields.name).filter(Boolean);
  const localFoodNames = localData.foods.map(item => item.name);
  
  const foodMatches = contentfulFoodNames.filter(name => 
    localFoodNames.some(localName => localName.includes(name) || name.includes(localName))
  );
  
  console.log(`✅ 食品名稱匹配: ${foodMatches.length}/${Math.max(contentfulFoodNames.length, localFoodNames.length)}`);
  
  // 訂閱名稱比較
  const contentfulSubNames = contentfulData.subscriptions.map(item => item.fields.name).filter(Boolean);
  const localSubNames = localData.subscriptions.map(item => item.name);
  
  const subMatches = contentfulSubNames.filter(name => 
    localSubNames.some(localName => localName.includes(name) || name.includes(localName))
  );
  
  console.log(`⚠️  訂閱名稱匹配: ${subMatches.length}/${Math.max(contentfulSubNames.length, localSubNames.length)}`);
  
  // 差異報告
  console.log('\n📋 差異報告:');
  
  if (contentfulFoodNames.length !== localFoodNames.length) {
    console.log(`⚠️  食品數量不一致: Contentful(${contentfulFoodNames.length}) vs 本地(${localFoodNames.length})`);
  }
  
  if (contentfulSubNames.length !== localSubNames.length) {
    console.log(`⚠️  訂閱數量不一致: Contentful(${contentfulSubNames.length}) vs 本地(${localSubNames.length})`);
  }
  
  // 找出只在 Contentful 中存在的項目
  const onlyInContentful = {
    foods: contentfulFoodNames.filter(name => 
      !localFoodNames.some(localName => localName.includes(name) || name.includes(localName))
    ),
    subscriptions: contentfulSubNames.filter(name => 
      !localSubNames.some(localName => localName.includes(name) || name.includes(localName))
    )
  };
  
  // 找出只在本地存在的項目
  const onlyInLocal = {
    foods: localFoodNames.filter(name => 
      !contentfulFoodNames.some(contentfulName => contentfulName.includes(name) || name.includes(contentfulName))
    ),
    subscriptions: localSubNames.filter(name => 
      !contentfulSubNames.some(contentfulName => contentfulName.includes(name) || name.includes(contentfulName))
    )
  };
  
  if (onlyInContentful.foods.length > 0) {
    console.log(`🔵 只在 Contentful 中的食品: ${onlyInContentful.foods.join(', ')}`);
  }
  
  if (onlyInContentful.subscriptions.length > 0) {
    console.log(`🔵 只在 Contentful 中的訂閱: ${onlyInContentful.subscriptions.join(', ')}`);
  }
  
  if (onlyInLocal.foods.length > 0) {
    console.log(`🟡 只在本地的食品: ${onlyInLocal.foods.join(', ')}`);
  }
  
  if (onlyInLocal.subscriptions.length > 0) {
    console.log(`🟡 只在本地的訂閱: ${onlyInLocal.subscriptions.join(', ')}`);
  }
  
  // 建議
  console.log('\n💡 同步建議:');
  
  if (onlyInLocal.subscriptions.length > 0) {
    console.log('1. 建議將本地訂閱資料同步到 Contentful');
    console.log('2. 或者更新本地資料以匹配 Contentful');
  }
  
  if (contentfulData.foods.length === localData.foods.length && foodMatches.length === contentfulData.foods.length) {
    console.log('✅ 食品資料基本一致');
  }
  
  console.log('\n' + '='.repeat(50));
}

// 測試從 CrudManager 獲取本地資料
async function getLocalDataFromCrudManager() {
  try {
    const ContentfulManager = require('./src/js/contentfulManager.js');
    const CrudManager = require('./src/js/crudManager.js');
    
    const contentfulManager = new ContentfulManager();
    const crudManager = new CrudManager(contentfulManager);
    
    // 載入資料
    await crudManager.loadInitialData();
    
    return {
      foods: crudManager.readAllFood(),
      subscriptions: crudManager.readAllSubscriptions()
    };
  } catch (error) {
    console.error('無法從 CrudManager 獲取資料:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 開始資料一致性檢查...\n');
  
  const contentfulData = await fetchContentfulData();
  
  if (!contentfulData) {
    console.log('❌ 無法獲取 Contentful 資料，檢查結束');
    return;
  }
  
  // 獲取實際的本地資料
  const actualLocalData = await getLocalDataFromCrudManager();
  
  if (!actualLocalData) {
    console.log('❌ 無法獲取本地資料，使用硬編碼資料進行比較');
    compareData(contentfulData, localData);
  } else {
    console.log('✅ 使用實際的 CrudManager 資料進行比較');
    compareData(contentfulData, actualLocalData);
  }
  
  console.log('\n✅ 資料一致性檢查完成');
}

// 執行檢查
main().catch(console.error);