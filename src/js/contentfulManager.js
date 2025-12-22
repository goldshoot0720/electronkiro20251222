// Contentful CMS 管理模組
class ContentfulManager {
    constructor() {
        // 載入環境變數
        if (typeof require !== 'undefined') {
            require('dotenv').config();
        }
        
        if (typeof require !== 'undefined') {
            // Delivery API (讀取)
            this.contentful = require('contentful');
            this.client = this.contentful.createClient({
                space: 'navontrqk0l3',
                environment: 'master',
                accessToken: '83Q5hThGBPCIgXAYX7Fc-gSUN-psxg_j-F-gXSskQBc'
            });

            // Management API (寫入) - 需要 Management Token
            this.contentfulManagement = require('contentful-management');
            this.managementClient = null;
            this.space = null;
            this.environment = null;
            
            // 你需要在 Contentful 後台創建 Management Token
            this.managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN || 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE';
        }
    }

    // 初始化 Management API
    async initManagementAPI() {
        try {
            if (!this.managementToken || this.managementToken === 'CFPAT-YOUR_MANAGEMENT_TOKEN_HERE') {
                console.warn('⚠️ Management Token 未設定，無法寫入 Contentful');
                return false;
            }

            this.managementClient = this.contentfulManagement.createClient({
                accessToken: this.managementToken
            });

            this.space = await this.managementClient.getSpace('navontrqk0l3');
            this.environment = await this.space.getEnvironment('master');
            
            console.log('✅ Management API 初始化成功');
            return true;
        } catch (error) {
            console.error('❌ Management API 初始化失敗:', error);
            return false;
        }
    }

    // 創建食品條目
    async createFoodEntry(foodData) {
        try {
            if (!this.environment) {
                const initialized = await this.initManagementAPI();
                if (!initialized) {
                    throw new Error('Management API 未初始化');
                }
            }

            const entry = await this.environment.createEntry('food', {
                fields: {
                    name: { 'en-US': foodData.name },
                    amount: { 'en-US': parseInt(foodData.brand?.replace(/[^\d]/g, '')) || 1 }, // 轉換為數字
                    todate: { 'en-US': foodData.expiry }
                }
            });

            await entry.publish();
            console.log('✅ 食品條目已創建並發布:', entry.sys.id);
            return { success: true, entryId: entry.sys.id };
        } catch (error) {
            console.error('❌ 創建食品條目失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 創建訂閱條目
    async createSubscriptionEntry(subscriptionData) {
        try {
            if (!this.environment) {
                const initialized = await this.initManagementAPI();
                if (!initialized) {
                    throw new Error('Management API 未初始化');
                }
            }

            const entry = await this.environment.createEntry('subscription', {
                fields: {
                    name: { 'en-US': subscriptionData.name },
                    price: { 'en-US': parseInt(subscriptionData.price.replace(/[^\d]/g, '')) || 0 },
                    nextdate: { 'en-US': subscriptionData.nextPayment },
                    site: { 'en-US': subscriptionData.url }
                }
            });

            await entry.publish();
            console.log('✅ 訂閱條目已創建並發布:', entry.sys.id);
            return { success: true, entryId: entry.sys.id };
        } catch (error) {
            console.error('❌ 創建訂閱條目失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新食品條目
    async updateFoodEntry(entryId, foodData) {
        try {
            if (!this.environment) {
                const initialized = await this.initManagementAPI();
                if (!initialized) {
                    throw new Error('Management API 未初始化');
                }
            }

            const entry = await this.environment.getEntry(entryId);
            
            entry.fields.name = { 'en-US': foodData.name };
            entry.fields.amount = { 'en-US': parseInt(foodData.brand?.replace(/[^\d]/g, '')) || 1 };
            entry.fields.todate = { 'en-US': foodData.expiry };

            const updatedEntry = await entry.update();
            await updatedEntry.publish();
            
            console.log('✅ 食品條目已更新:', entryId);
            return { success: true };
        } catch (error) {
            console.error('❌ 更新食品條目失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 更新訂閱條目
    async updateSubscriptionEntry(entryId, subscriptionData) {
        try {
            if (!this.environment) {
                const initialized = await this.initManagementAPI();
                if (!initialized) {
                    throw new Error('Management API 未初始化');
                }
            }

            const entry = await this.environment.getEntry(entryId);
            
            entry.fields.name = { 'en-US': subscriptionData.name };
            entry.fields.price = { 'en-US': parseInt(subscriptionData.price.replace(/[^\d]/g, '')) || 0 };
            entry.fields.nextdate = { 'en-US': subscriptionData.nextPayment };
            entry.fields.site = { 'en-US': subscriptionData.url };

            const updatedEntry = await entry.update();
            await updatedEntry.publish();
            
            console.log('✅ 訂閱條目已更新:', entryId);
            return { success: true };
        } catch (error) {
            console.error('❌ 更新訂閱條目失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 刪除條目
    async deleteEntry(entryId) {
        try {
            if (!this.environment) {
                const initialized = await this.initManagementAPI();
                if (!initialized) {
                    throw new Error('Management API 未初始化');
                }
            }

            const entry = await this.environment.getEntry(entryId);
            await entry.unpublish();
            await entry.delete();
            
            console.log('✅ 條目已刪除:', entryId);
            return { success: true };
        } catch (error) {
            console.error('❌ 刪除條目失敗:', error);
            return { success: false, error: error.message };
        }
    }
    async getSubscriptions() {
        try {
            if (!this.client) {
                throw new Error('Contentful 客戶端未初始化');
            }

            // 獲取所有訂閱類型的條目
            const entries = await this.client.getEntries({
                content_type: 'subscription'
            });
            
            console.log('訂閱管理數據:', entries);
            
            if (entries.items.length === 0) {
                return this.getFallbackSubscriptions();
            }
            
            // 解析所有訂閱條目
            return entries.items.map((entry, index) => ({
                id: index + 1,
                name: entry.fields.name || '未命名訂閱',
                url: entry.fields.site || '',
                price: entry.fields.price ? `NT$ ${entry.fields.price}` : 'NT$ 0',
                nextPayment: entry.fields.nextdate ? this.formatDate(entry.fields.nextdate) : '未設定',
                daysLeft: this.calculateDaysLeft(entry.fields.nextdate),
                status: this.getSubscriptionStatus(entry.fields.nextdate),
                contentfulId: entry.sys.id // 保存 Contentful ID
            }));
            
        } catch (error) {
            console.error('獲取訂閱數據失敗:', error);
            return this.getFallbackSubscriptions();
        }
    }

    // 獲取食品管理數據
    async getFoodItems() {
        try {
            if (!this.client) {
                throw new Error('Contentful 客戶端未初始化');
            }

            // 獲取所有食品類型的條目
            const entries = await this.client.getEntries({
                content_type: 'food'
            });
            
            console.log('食品管理數據:', entries);
            
            if (entries.items.length === 0) {
                return this.getFallbackFoodItems();
            }
            
            // 解析所有食品條目
            return entries.items.map((entry, index) => ({
                id: index + 1,
                name: entry.fields.name || '未命名食品',
                brand: entry.fields.amount ? `數量: ${entry.fields.amount}` : '未知數量',
                price: 'NT$ 0', // Contentful 中沒有價格欄位
                status: '良好',
                expiry: entry.fields.todate ? this.formatDate(entry.fields.todate) : '未設定',
                daysLeft: this.calculateDaysLeft(entry.fields.todate),
                contentfulId: entry.sys.id // 保存 Contentful ID
            }));
            
        } catch (error) {
            console.error('獲取食品數據失敗:', error);
            return this.getFallbackFoodItems();
        }
    }

    // 解析訂閱數據
    parseSubscriptionData(entry) {
        const fields = entry.fields;
        
        // 根據實際的 Contentful 數據結構解析
        return [{
            id: 1,
            name: fields.name || '未命名訂閱',
            url: fields.site || '',
            price: fields.price ? `NT$ ${fields.price}` : 'NT$ 0',
            nextPayment: fields.nextdate ? this.formatDate(fields.nextdate) : '未設定',
            daysLeft: this.calculateDaysLeft(fields.nextdate),
            status: this.getSubscriptionStatus(fields.nextdate)
        }];
    }

    // 解析食品數據
    parseFoodData(entry) {
        const fields = entry.fields;
        
        // 根據實際的 Contentful 數據結構解析
        return [{
            id: 1,
            name: fields.name || '未命名食品',
            brand: fields.amount ? `數量: ${fields.amount}` : '未知數量',
            price: 'NT$ 0', // Contentful 中沒有價格欄位
            status: '良好',
            expiry: fields.todate ? this.formatDate(fields.todate) : '未設定',
            daysLeft: this.calculateDaysLeft(fields.todate)
        }];
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '未設定';
        
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD 格式
    }

    // 計算剩餘天數
    calculateDaysLeft(dateString) {
        if (!dateString) return 0;
        
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }

    // 獲取訂閱狀態
    getSubscriptionStatus(nextPayment) {
        const daysLeft = this.calculateDaysLeft(nextPayment);
        
        if (daysLeft <= 3) return '即將到期';
        if (daysLeft <= 7) return '注意';
        return '活躍';
    }

    // 備用訂閱數據（當 Contentful 無法連接時）
    getFallbackSubscriptions() {
        return [
            {
                id: 1,
                name: '天虎/黃信訊/心臟內科',
                url: 'https://www.tcmg.com.tw/index.php/main/schedule_time?id=18',
                price: 'NT$ 530',
                nextPayment: '2025-12-26',
                daysLeft: 4,
                status: '即將到期'
            },
            {
                id: 2,
                name: 'kiro pro',
                url: 'https://app.kiro.dev/account/',
                price: 'NT$ 640',
                nextPayment: '2026-01-01',
                daysLeft: 10,
                status: '活躍'
            },
            {
                id: 3,
                name: 'Contentful CMS (備用數據)',
                url: 'https://contentful.com',
                price: 'NT$ 0',
                nextPayment: '2025-12-31',
                daysLeft: 9,
                status: '活躍'
            }
        ];
    }

    // 備用食品數據（當 Contentful 無法連接時）
    getFallbackFoodItems() {
        return [
            {
                id: 1,
                name: '【張君雅】五香海苔休閒丸子',
                brand: '張君雅',
                price: 'NT$ 0',
                status: '未設定',
                expiry: '2026-01-06',
                daysLeft: 15
            },
            {
                id: 2,
                name: '【張君雅】日式串燒休閒丸子',
                brand: '張君雅',
                price: 'NT$ 0',
                status: '未設定',
                expiry: '2026-01-07',
                daysLeft: 16
            },
            {
                id: 3,
                name: 'Contentful 測試食品',
                brand: 'CMS',
                price: 'NT$ 0',
                status: '良好',
                expiry: '2025-12-31',
                daysLeft: 9
            }
        ];
    }

    // 測試 Contentful 連接
    async testConnection() {
        try {
            if (!this.client) {
                return { success: false, message: 'Contentful 客戶端未初始化' };
            }

            const space = await this.client.getSpace();
            console.log('Contentful 連接成功:', space.name);
            
            return { 
                success: true, 
                message: `成功連接到 Contentful Space: ${space.name}`,
                spaceName: space.name
            };
        } catch (error) {
            console.error('Contentful 連接失敗:', error);
            return { 
                success: false, 
                message: `連接失敗: ${error.message}` 
            };
        }
    }

    // 獲取所有 Contentful 條目（用於調試）
    async getAllEntries() {
        try {
            if (!this.client) {
                throw new Error('Contentful 客戶端未初始化');
            }

            const entries = await this.client.getEntries();
            console.log('所有 Contentful 條目:', entries);
            
            return entries.items;
        } catch (error) {
            console.error('獲取條目失敗:', error);
            return [];
        }
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentfulManager;
}