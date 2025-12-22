/**
 * 儀表板管理器
 * 負責統計數據、提醒管理和圖表展示
 */
class DashboardManager {
    constructor() {
        this.stats = {
            subscriptions: {
                total: 0,
                expiring3Days: 0,
                expiring7Days: 0,
                expired: 0
            },
            food: {
                total: 0,
                expiring7Days: 0,
                expiring30Days: 0,
                expired: 0
            },
            images: 0,
            videos: 0,
            music: 0
        };
        
        this.alerts = {
            subscriptions: [],
            food: []
        };
        
        this.init();
    }

    init() {
        console.log('🎯 初始化儀表板管理器...');
        this.bindEvents();
    }

    bindEvents() {
        // 綁定刷新按鈕事件
        const refreshBtn = document.querySelector('#templates-page .btn-primary');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    /**
     * 刷新儀表板數據
     */
    async refreshDashboard() {
        console.log('🔄 刷新儀表板數據...');
        
        try {
            // 顯示載入狀態
            this.showLoadingState();
            
            // 更新統計數據
            await this.updateStats();
            
            // 更新提醒
            this.updateAlerts();
            
            // 更新UI
            this.updateDashboardUI();
            
            console.log('✅ 儀表板數據刷新完成');
            
        } catch (error) {
            console.error('❌ 刷新儀表板失敗:', error);
        }
    }

    /**
     * 更新統計數據
     */
    async updateStats() {
        // 獲取 CRUD 管理器實例
        const crudManager = window.app?.crudManager;
        if (!crudManager) {
            console.warn('⚠️ CRUD 管理器未初始化');
            return;
        }

        // 訂閱統計
        const subscriptions = crudManager.subscriptions || [];
        this.stats.subscriptions.total = subscriptions.length;
        
        const now = new Date();
        this.stats.subscriptions.expiring3Days = subscriptions.filter(sub => {
            const expiryDate = new Date(sub.expiryDate);
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 3;
        }).length;
        
        this.stats.subscriptions.expiring7Days = subscriptions.filter(sub => {
            const expiryDate = new Date(sub.expiryDate);
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 7;
        }).length;
        
        this.stats.subscriptions.expired = subscriptions.filter(sub => {
            const expiryDate = new Date(sub.expiryDate);
            return expiryDate < now;
        }).length;

        // 食品統計
        const foodItems = crudManager.foodItems || [];
        this.stats.food.total = foodItems.length;
        
        this.stats.food.expiring7Days = foodItems.filter(food => {
            const expiryDate = new Date(food.expiryDate);
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 7;
        }).length;
        
        this.stats.food.expiring30Days = foodItems.filter(food => {
            const expiryDate = new Date(food.expiryDate);
            const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        }).length;
        
        this.stats.food.expired = foodItems.filter(food => {
            const expiryDate = new Date(food.expiryDate);
            return expiryDate < now;
        }).length;

        // 其他統計
        this.stats.images = await this.countImages();
        this.stats.videos = await this.countVideos();
        this.stats.music = await this.countMusic();
    }

    /**
     * 計算圖片數量
     */
    async countImages() {
        try {
            const imageManager = window.app?.imageManager;
            if (imageManager && imageManager.images) {
                return imageManager.images.length;
            }
            return 244; // 預設值
        } catch (error) {
            console.warn('⚠️ 無法獲取圖片數量:', error);
            return 244;
        }
    }

    /**
     * 計算影片數量
     */
    async countVideos() {
        try {
            const videoManager = window.app?.videoManager;
            if (videoManager && videoManager.videos) {
                return videoManager.videos.length;
            }
            return 2; // 預設值
        } catch (error) {
            console.warn('⚠️ 無法獲取影片數量:', error);
            return 2;
        }
    }

    /**
     * 計算音樂數量
     */
    async countMusic() {
        try {
            const songManager = window.app?.songManager;
            if (songManager && songManager.songs) {
                return songManager.songs.length;
            }
            return 2; // 預設值
        } catch (error) {
            console.warn('⚠️ 無法獲取音樂數量:', error);
            return 2;
        }
    }

    /**
     * 更新提醒
     */
    updateAlerts() {
        const crudManager = window.app?.crudManager;
        if (!crudManager) return;

        const now = new Date();

        // 訂閱提醒
        this.alerts.subscriptions = (crudManager.subscriptions || [])
            .filter(sub => {
                const expiryDate = new Date(sub.expiryDate);
                const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 7; // 7天內到期或已過期
            })
            .map(sub => {
                const expiryDate = new Date(sub.expiryDate);
                const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                let status = 'warning';
                let message = '';
                
                if (diffDays < 0) {
                    status = 'danger';
                    message = `已過期 ${Math.abs(diffDays)} 天`;
                } else if (diffDays === 0) {
                    status = 'danger';
                    message = '今天到期';
                } else if (diffDays <= 3) {
                    status = 'danger';
                    message = `${diffDays} 天後到期`;
                } else {
                    status = 'warning';
                    message = `${diffDays} 天後到期`;
                }

                return {
                    id: sub.id,
                    name: sub.name,
                    message,
                    status,
                    expiryDate: sub.expiryDate
                };
            });

        // 食品提醒
        this.alerts.food = (crudManager.foodItems || [])
            .filter(food => {
                const expiryDate = new Date(food.expiryDate);
                const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                return diffDays <= 30; // 30天內到期或已過期
            })
            .map(food => {
                const expiryDate = new Date(food.expiryDate);
                const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                let status = 'info';
                let message = '';
                
                if (diffDays < 0) {
                    status = 'danger';
                    message = `已過期 ${Math.abs(diffDays)} 天`;
                } else if (diffDays === 0) {
                    status = 'danger';
                    message = '今天到期';
                } else if (diffDays <= 7) {
                    status = 'warning';
                    message = `${diffDays} 天後到期`;
                } else {
                    status = 'info';
                    message = `${diffDays} 天後到期`;
                }

                return {
                    id: food.id,
                    name: food.name,
                    message,
                    status,
                    expiryDate: food.expiryDate
                };
            });
    }

    /**
     * 更新儀表板UI
     */
    updateDashboardUI() {
        // 更新訂閱統計
        this.updateStatCard('訂閱管理', 0, this.stats.subscriptions.total);
        this.updateStatCard('訂閱管理', 1, this.stats.subscriptions.expiring3Days);
        this.updateStatCard('訂閱管理', 2, this.stats.subscriptions.expiring7Days);
        this.updateStatCard('訂閱管理', 3, this.stats.subscriptions.expired);

        // 更新食品統計
        this.updateStatCard('食品管理', 0, this.stats.food.total);
        this.updateStatCard('食品管理', 1, this.stats.food.expiring7Days);
        this.updateStatCard('食品管理', 2, this.stats.food.expiring30Days);
        this.updateStatCard('食品管理', 3, this.stats.food.expired);

        // 更新首頁統計
        this.updateHomeStats();

        // 更新提醒列表
        this.updateAlertsList();
    }

    /**
     * 更新統計卡片
     */
    updateStatCard(section, index, value) {
        const sections = document.querySelectorAll('.dashboard-section');
        let targetSection = null;
        
        sections.forEach(section_el => {
            const title = section_el.querySelector('h3');
            if (title && title.textContent.includes(section)) {
                targetSection = section_el;
            }
        });
        
        if (targetSection) {
            const statCards = targetSection.querySelectorAll('.stat-card');
            if (statCards[index]) {
                const numberEl = statCards[index].querySelector('.stat-number');
                if (numberEl) {
                    numberEl.textContent = value;
                    
                    // 添加動畫效果
                    numberEl.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        numberEl.style.transform = 'scale(1)';
                    }, 200);
                }
            }
        }
    }

    /**
     * 更新首頁統計
     */
    updateHomeStats() {
        const homeStatsGrid = document.querySelector('#dashboard-page .stats-grid');
        if (homeStatsGrid) {
            const statCards = homeStatsGrid.querySelectorAll('.stat-card');
            
            if (statCards[0]) {
                statCards[0].querySelector('.stat-number').textContent = this.stats.images;
            }
            if (statCards[1]) {
                statCards[1].querySelector('.stat-number').textContent = this.stats.music;
            }
            if (statCards[2]) {
                statCards[2].querySelector('.stat-number').textContent = this.stats.subscriptions.total;
            }
            if (statCards[3]) {
                statCards[3].querySelector('.stat-number').textContent = this.stats.videos;
            }
        }
    }

    /**
     * 更新提醒列表
     */
    updateAlertsList() {
        // 更新訂閱提醒
        const subscriptionAlerts = document.getElementById('subscription-alerts');
        if (subscriptionAlerts) {
            subscriptionAlerts.innerHTML = this.generateAlertsHTML(this.alerts.subscriptions, 'subscription');
        }

        // 更新食品提醒
        const foodAlerts = document.getElementById('food-alerts');
        if (foodAlerts) {
            foodAlerts.innerHTML = this.generateAlertsHTML(this.alerts.food, 'food');
        }
    }

    /**
     * 生成提醒HTML
     */
    generateAlertsHTML(alerts, type) {
        if (alerts.length === 0) {
            return `<div class="alert-item alert-success">
                <span class="alert-icon">✅</span>
                <span class="alert-text">目前沒有${type === 'subscription' ? '訂閱' : '食品'}到期提醒</span>
            </div>`;
        }

        return alerts.map(alert => `
            <div class="alert-item alert-${alert.status}">
                <span class="alert-icon">${this.getAlertIcon(alert.status)}</span>
                <div class="alert-content">
                    <div class="alert-title">${alert.name}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-date">到期日: ${new Date(alert.expiryDate).toLocaleDateString('zh-TW')}</div>
                </div>
                <button class="alert-action" onclick="dashboardManager.handleAlert('${alert.id}', '${type}')">
                    處理
                </button>
            </div>
        `).join('');
    }

    /**
     * 獲取提醒圖標
     */
    getAlertIcon(status) {
        switch (status) {
            case 'danger': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📋';
        }
    }

    /**
     * 處理提醒
     */
    handleAlert(id, type) {
        console.log(`處理${type}提醒:`, id);
        
        if (type === 'subscription') {
            // 跳轉到訂閱管理頁面
            window.app?.showPage('subscriptions');
        } else if (type === 'food') {
            // 跳轉到食品管理頁面
            window.app?.showPage('food');
        }
    }

    /**
     * 顯示載入狀態
     */
    showLoadingState() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(el => {
            el.style.opacity = '0.5';
            el.textContent = '...';
        });
    }

    /**
     * 獲取統計摘要
     */
    getStatsSummary() {
        return {
            totalItems: this.stats.subscriptions.total + this.stats.food.total + this.stats.images + this.stats.videos + this.stats.music,
            urgentAlerts: this.alerts.subscriptions.filter(a => a.status === 'danger').length + 
                         this.alerts.food.filter(a => a.status === 'danger').length,
            stats: this.stats,
            alerts: this.alerts
        };
    }

    /**
     * 導出數據
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            alerts: this.alerts
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('📊 儀表板數據已導出');
    }
}

// 創建全域實例
window.dashboardManager = new DashboardManager();