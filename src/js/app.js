// 應用程式主要邏輯
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.contentfulManager = null;
        this.songManager = null;
        this.crudManager = null;
        this.crudManagerInitialized = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.initContentful().then(async () => {
            await this.initCrudManager();
        });
        this.initSongManager();
        this.showPage('dashboard');
    }

    // 初始化 CRUD 管理器
    async initCrudManager() {
        try {
            if (typeof CrudManager !== 'undefined') {
                console.log('🔄 開始初始化 CRUD 管理器...');
                this.crudManager = new CrudManager(this.contentfulManager);
                const loaded = await this.crudManager.loadInitialData();
                
                if (loaded) {
                    console.log('✅ CRUD 管理器初始化成功 (使用 Contentful 資料)');
                    this.showNotification('資料已從 Contentful 同步', 'success');
                } else {
                    console.log('✅ CRUD 管理器初始化成功 (使用本地資料)');
                    this.showNotification('使用本地備用資料', 'warning');
                }
                
                // 標記 CRUD 管理器已初始化
                this.crudManagerInitialized = true;
                
                // 更新 UI 顯示
                this.updateFoodManagementUI();
                this.updateSubscriptionManagementUI();
                
                console.log('✅ CRUD 管理器完全初始化完成');
            } else {
                console.warn('CrudManager 未載入');
                this.crudManagerInitialized = false;
            }
        } catch (error) {
            console.error('初始化 CRUD 管理器時發生錯誤:', error);
            this.crudManagerInitialized = false;
        }
    }

    // 更新食品管理 UI
    updateFoodManagementUI() {
        if (this.currentPage === 'food') {
            this.loadFood();
        }
    }

    // 更新訂閱管理 UI  
    updateSubscriptionManagementUI() {
        if (this.currentPage === 'subscriptions') {
            this.loadSubscriptions();
        }
    }

    // 初始化歌曲管理器
    initSongManager() {
        try {
            if (typeof SongManager !== 'undefined') {
                this.songManager = new SongManager();
                console.log('✅ 歌曲管理器初始化成功');
            } else {
                console.warn('SongManager 未載入');
            }
        } catch (error) {
            console.error('初始化歌曲管理器時發生錯誤:', error);
        }
    }

    // 初始化 Contentful
    async initContentful() {
        try {
            if (typeof ContentfulManager !== 'undefined') {
                this.contentfulManager = new ContentfulManager();
                const connectionTest = await this.contentfulManager.testConnection();
                
                if (connectionTest.success) {
                    console.log('✅ Contentful 連接成功:', connectionTest.message);
                    this.showNotification('Contentful CMS 連接成功', 'success');
                } else {
                    console.warn('⚠️ Contentful 連接失敗，使用備用數據:', connectionTest.message);
                    this.showNotification('使用本地備用數據', 'warning');
                }
            } else {
                console.warn('ContentfulManager 未載入，使用本地數據');
            }
        } catch (error) {
            console.error('初始化 Contentful 時發生錯誤:', error);
            this.showNotification('CMS 初始化失敗，使用本地數據', 'warning');
        }
    }

    setupEventListeners() {
        console.log('🔧 設置事件監聽器...');
        
        // 側邊欄選單點擊事件
        const menuItems = document.querySelectorAll('.menu-item');
        console.log('找到選單項目數量:', menuItems.length);
        
        menuItems.forEach((item, index) => {
            console.log(`設置選單項目 ${index + 1}:`, item.dataset.page);
            item.addEventListener('click', (e) => {
                console.log('選單項目被點擊:', e.currentTarget.dataset.page);
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // 主要操作按鈕事件
        const actionBtn = document.getElementById('main-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                console.log('主要操作按鈕被點擊');
                this.refreshCurrentPage();
            });
        }

        // 搜尋功能
        document.querySelectorAll('.search-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        });

        // 新增按鈕事件
        document.querySelectorAll('.btn-primary').forEach(btn => {
            if (btn.textContent.includes('新增')) {
                btn.addEventListener('click', (e) => {
                    this.handleAddNew(e);
                });
            }
        });

        // 鋒兄 logo 彩蛋 - 點擊播放音樂
        const logo = document.querySelector('.logo');
        if (logo) {
            let clickCount = 0;
            logo.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    this.showNotification('🎵 鋒兄進化Show 開始播放！', 'success');
                    this.playSong(2); // 播放鋒兄進化Show
                    clickCount = 0;
                } else if (clickCount === 1) {
                    this.showNotification('再點擊2次解鎖彩蛋...', 'info');
                } else if (clickCount === 2) {
                    this.showNotification('最後一次！', 'warning');
                }
                
                // 3秒後重置計數
                setTimeout(() => {
                    if (clickCount < 3) clickCount = 0;
                }, 3000);
            });
        }
        
        console.log('✅ 事件監聽器設置完成');
    }

    showPage(pageId) {
        console.log('🔄 切換到頁面:', pageId);
        
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 移除所有選單項目的 active 狀態
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // 顯示選中的頁面
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log('✅ 頁面顯示成功:', pageId);
        } else {
            console.error('❌ 找不到頁面:', `${pageId}-page`);
        }

        // 設置選中的選單項目
        const targetMenuItem = document.querySelector(`[data-page="${pageId}"]`);
        if (targetMenuItem) {
            targetMenuItem.classList.add('active');
            console.log('✅ 選單項目激活成功:', pageId);
        } else {
            console.error('❌ 找不到選單項目:', pageId);
        }

        // 更新頁面標題和操作按鈕
        this.updatePageHeader(pageId);
        this.currentPage = pageId;

        // 載入頁面數據
        this.loadPageData(pageId);
    }

    updatePageHeader(pageId) {
        const pageTitle = document.getElementById('page-title');
        const actionBtn = document.getElementById('main-action-btn');

        const pageConfig = {
            dashboard: {
                title: '歡迎使用鋒兄AI資訊系統',
                action: '重新整理'
            },
            images: {
                title: '鋒兄圖片庫',
                action: '新增圖片'
            },
            videos: {
                title: '鋒兄影片庫',
                action: '新增影片'
            },
            food: {
                title: '食品管理系統',
                action: '新增食品'
            },
            subscriptions: {
                title: '訂閱管理系統',
                action: '新增訂閱'
            },
            templates: {
                title: '系統儀表板',
                action: '刷新數據'
            },
            music: {
                title: '🎵 鋒兄音樂庫',
                action: '播放隨機歌曲'
            }
        };

        const config = pageConfig[pageId] || pageConfig.dashboard;
        pageTitle.textContent = config.title;
        actionBtn.textContent = config.action;
    }

    loadPageData(pageId) {
        switch (pageId) {
            case 'images':
                this.loadImages();
                break;
            case 'videos':
                this.loadVideos();
                break;
            case 'food':
                this.loadFood();
                break;
            case 'subscriptions':
                this.loadSubscriptions();
                break;
            case 'templates':
                this.loadTemplates();
                break;
            case 'music':
                this.loadMusic();
                break;
            case 'dashboard':
                this.loadDashboard();
                break;
        }
    }

    loadInitialData() {
        // 載入初始數據
        this.mockData = {
            subscriptions: [
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
                }
            ],
            food: [
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
                }
            ]
        };
    }

    refreshCurrentPage() {
        if (this.currentPage === 'music') {
            // 音樂頁面的特殊操作 - 隨機播放
            this.playRandomSong();
        } else if (this.currentPage === 'food') {
            // 食品頁面 - 顯示新增食品表單
            this.showFoodForm();
        } else if (this.currentPage === 'subscriptions') {
            // 訂閱頁面 - 顯示新增訂閱表單
            this.showSubscriptionForm();
        } else {
            // 其他頁面 - 重新載入資料
            this.loadPageData(this.currentPage);
            this.showNotification('頁面已重新整理', 'success');
        }
    }

    // 隨機播放歌曲
    playRandomSong() {
        if (!this.songManager) return;
        
        const songs = this.songManager.getAllSongs();
        if (songs.length === 0) return;
        
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        this.playSong(randomSong.id);
    }

    handleSearch(query) {
        console.log('搜尋:', query);
        // 實作搜尋邏輯
    }

    handleAddNew(event) {
        const buttonText = event.target.textContent;
        console.log('新增:', buttonText);
        this.showNotification(`${buttonText}功能開發中`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadImages() {
        const container = document.getElementById('images-grid');
        container.innerHTML = '<div class="loading">掃描圖片資料夾中...</div>';

        setTimeout(() => {
            try {
                console.log('開始載入圖片...');
                
                if (typeof ImageManager === 'undefined') {
                    throw new Error('ImageManager 類別未載入');
                }
                
                const imageManager = new ImageManager();
                const images = imageManager.scanImages();
                
                console.log(`找到 ${images.length} 張圖片`);
                
                this.updateImagePageDescription(images.length);
                
                if (images.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📁</div>
                            <h3>沒有找到圖片</h3>
                            <p>請將圖片檔案放入 assets/images 資料夾中</p>
                            <p>支援格式：JPG, PNG, GIF, WebP</p>
                        </div>
                    `;
                    return;
                }

                const displayImages = images.slice(0, 20);
                
                const imageCards = displayImages.map((image, index) => {
                    const safeName = image.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
                    
                    return `
                        <div class="image-card" data-image-id="${image.id}">
                            <div class="image-preview">
                                <img src="${image.relativePath}" 
                                     alt="${image.name}" 
                                     onload="this.style.opacity='1'; this.nextElementSibling.style.display='none';"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                     style="opacity: 0; transition: opacity 0.3s ease; width: 100%; height: 150px; object-fit: cover;">
                                <div class="image-placeholder" style="display: flex; width: 100%; height: 150px; background: #f5f5f5; align-items: center; justify-content: center; flex-direction: column;">
                                    <span style="font-size: 48px;">🖼️</span>
                                    <div style="font-size: 12px; margin-top: 10px;">${image.type}</div>
                                </div>
                            </div>
                            <div class="image-info">
                                <div class="image-title" title="${image.name}">${this.truncateFileName(image.name, 20)}</div>
                                <div class="image-details">
                                    <span>${image.type}</span>
                                    <span class="image-size">${image.size}</span>
                                </div>
                                <div class="image-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="app.viewImage('${safeName}')">檢視</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                container.innerHTML = imageCards;
                this.allImages = images;

            } catch (error) {
                console.error('載入圖片時發生錯誤:', error);
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <h3>載入失敗</h3>
                        <p>無法載入圖片：${error.message}</p>
                        <button class="btn btn-primary" onclick="app.loadImages()" style="margin-top: 15px;">重試</button>
                    </div>
                `;
            }
        }, 500);
    }

    truncateFileName(fileName, maxLength) {
        if (fileName.length <= maxLength) return fileName;
        const ext = fileName.split('.').pop();
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    }

    updateImagePageDescription(count) {
        const pageHeader = document.querySelector('#images-page .page-header p');
        if (pageHeader) {
            pageHeader.textContent = `找兄帥哥圖片和收藏AI創作 (${count} 張圖片)`;
        }
    }

    viewImage(fileName) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        const imagePath = `file:///${process.cwd().replace(/\\/g, '/')}/assets/images/${encodeURIComponent(fileName)}`;
        modal.innerHTML = `
            <div class="modal-content image-viewer">
                <div class="modal-header">
                    <h3 class="modal-title">${fileName}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <img src="${imagePath}" alt="${fileName}" 
                         style="max-width: 100%; max-height: 70vh; object-fit: contain;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadVideos() {
        const container = document.getElementById('videos-grid');
        container.innerHTML = '<div class="loading">掃描影片資料夾中...</div>';

        setTimeout(() => {
            try {
                if (typeof VideoManager === 'undefined') {
                    throw new Error('VideoManager 未載入');
                }
                
                const videoManager = new VideoManager();
                const videos = videoManager.scanVideos();
                
                console.log(`找到 ${videos.length} 個影片`);
                
                if (videos.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">🎬</div>
                            <h3>沒有找到影片</h3>
                            <p>請將影片檔案放入 assets/videos 資料夾中</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = videos.map(video => {
                    const safeName = video.name.replace(/'/g, "\\'").replace(/"/g, '\\"');
                    return `
                        <div class="video-card">
                            <div class="video-thumbnail">
                                <div style="font-size: 48px;">🎬</div>
                                <div class="video-format">${video.format}</div>
                                <div class="video-duration">${video.duration}</div>
                            </div>
                            <div class="video-info">
                                <div class="video-title">${video.title}</div>
                                <div class="video-description">${video.description}</div>
                                <div class="video-meta">
                                    <span>大小: ${video.size}</span>
                                    <span>格式: ${video.format}</span>
                                </div>
                                <div class="video-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="app.playVideo('${safeName}')">播放</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

            } catch (error) {
                console.error('載入影片時發生錯誤:', error);
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <h3>載入失敗</h3>
                        <p>無法載入影片：${error.message}</p>
                        <button class="btn btn-primary" onclick="app.loadVideos()" style="margin-top: 15px;">重試</button>
                    </div>
                `;
            }
        }, 500);
    }

    playVideo(fileName) {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        const videoPath = `file:///${process.cwd().replace(/\\/g, '/')}/assets/videos/${encodeURIComponent(fileName)}`;
        modal.innerHTML = `
            <div class="modal-content video-player">
                <div class="modal-header">
                    <h3 class="modal-title">${fileName}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <video controls style="max-width: 100%; max-height: 70vh;">
                        <source src="${videoPath}" type="video/mp4">
                        您的瀏覽器不支援影片播放。
                    </video>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async loadFood() {
        const container = document.getElementById('food-grid');
        container.innerHTML = '<div class="loading">載入食品資料中...</div>';

        try {
            let foodData;
            
            // 優先使用 CRUD 管理器
            if (this.crudManager) {
                foodData = this.crudManager.readAllFood();
                console.log('從 CRUD 管理器載入食品數據:', foodData);
            } else if (this.contentfulManager) {
                foodData = await this.contentfulManager.getFoodItems();
            } else {
                foodData = this.mockData.food;
            }

            if (foodData.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🍎</div>
                        <h3>沒有找到食品數據</h3>
                        <p>點擊「新增食品」開始管理您的食品</p>
                        <button class="btn btn-primary" onclick="app.showFoodForm()" style="margin-top: 15px;">新增第一個食品</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = foodData.map(food => `
                <div class="food-card" data-id="${food.id}">
                    <div class="food-header">
                        <div class="food-image">🍪</div>
                        <div class="food-basic-info">
                            <h3>${food.name}</h3>
                            <div class="food-brand">品牌: ${food.brand}</div>
                        </div>
                    </div>
                    <div class="food-details">
                        <div class="food-detail-item">
                            <div class="food-detail-label">價格</div>
                            <div class="food-detail-value">${food.price}</div>
                        </div>
                        <div class="food-detail-item">
                            <div class="food-detail-label">狀態</div>
                            <div class="food-detail-value">${food.status}</div>
                        </div>
                        <div class="food-detail-item">
                            <div class="food-detail-label">到期日期</div>
                            <div class="food-detail-value">${food.expiry}</div>
                        </div>
                        <div class="food-detail-item">
                            <div class="food-detail-label">剩餘天數</div>
                            <div class="food-detail-value ${food.daysLeft <= 7 ? 'text-danger' : food.daysLeft <= 14 ? 'text-warning' : ''}">${food.daysLeft} 天</div>
                        </div>
                    </div>
                    <div class="food-actions">
                        <button class="btn btn-edit" onclick="app.editFood(${food.id})">編輯</button>
                        <button class="btn btn-info" onclick="app.viewFoodDetails(${food.id})">詳情</button>
                        <button class="btn btn-delete" onclick="app.deleteFood(${food.id})">刪除</button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('載入食品數據時發生錯誤:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3>載入失敗</h3>
                    <p>無法載入食品數據：${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadFood()" style="margin-top: 15px;">重試</button>
                </div>
            `;
        }
    }

    async loadSubscriptions() {
        const container = document.getElementById('subscriptions-list');
        container.innerHTML = '<div class="loading">載入訂閱資料中...</div>';

        try {
            let subscriptionData;
            
            // 優先使用 CRUD 管理器
            if (this.crudManager) {
                subscriptionData = this.crudManager.readAllSubscriptions();
                console.log('從 CRUD 管理器載入訂閱數據:', subscriptionData);
            } else if (this.contentfulManager) {
                subscriptionData = await this.contentfulManager.getSubscriptions();
            } else {
                subscriptionData = this.mockData.subscriptions;
            }

            if (subscriptionData.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <h3>沒有找到訂閱數據</h3>
                        <p>點擊「新增訂閱」開始管理您的訂閱服務</p>
                        <button class="btn btn-primary" onclick="app.showSubscriptionForm()" style="margin-top: 15px;">新增第一個訂閱</button>
                    </div>
                `;
                return;
            }

            container.innerHTML = subscriptionData.map(sub => `
                <div class="subscription-card" data-id="${sub.id}">
                    <div class="subscription-header">
                        <div class="subscription-info">
                            <h3>${sub.name}</h3>
                            <div class="subscription-url">
                                <a href="${sub.url}" target="_blank" style="color: #666; text-decoration: none;">
                                    ${sub.url}
                                </a>
                            </div>
                        </div>
                        <div class="subscription-status ${sub.status === '活躍' ? 'status-active' : sub.status === '即將到期' ? 'status-expiring' : 'status-warning'}">
                            ${sub.status}
                        </div>
                    </div>
                    <div class="subscription-details">
                        <div class="subscription-detail">
                            <div class="subscription-detail-label">價格</div>
                            <div class="subscription-detail-value">${sub.price}</div>
                        </div>
                        <div class="subscription-detail">
                            <div class="subscription-detail-label">下次付款</div>
                            <div class="subscription-detail-value">${sub.nextPayment}</div>
                        </div>
                        <div class="subscription-detail">
                            <div class="subscription-detail-label">剩餘天數</div>
                            <div class="subscription-detail-value ${sub.daysLeft <= 3 ? 'text-danger' : sub.daysLeft <= 7 ? 'text-warning' : ''}">${sub.daysLeft} 天</div>
                        </div>
                    </div>
                    <div class="subscription-actions">
                        <button class="btn btn-edit" onclick="app.editSubscription(${sub.id})">編輯</button>
                        <button class="btn btn-info" onclick="app.viewSubscriptionDetails(${sub.id})">詳情</button>
                        <button class="btn btn-delete" onclick="app.deleteSubscription(${sub.id})">刪除</button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('載入訂閱數據時發生錯誤:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3>載入失敗</h3>
                    <p>無法載入訂閱數據：${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadSubscriptions()" style="margin-top: 15px;">重試</button>
                </div>
            `;
        }
    }

    loadDashboard() {
        console.log('儀表板載入完成');
    }

    loadTemplates() {
        console.log('系統儀表板載入完成');
    }

    // 載入音樂頁面
    loadMusic() {
        const container = document.getElementById('music-content');
        container.innerHTML = '<div class="loading">載入鋒兄音樂中...</div>';

        setTimeout(() => {
            try {
                if (!this.songManager) {
                    throw new Error('歌曲管理器未初始化');
                }

                const songs = this.songManager.getAllSongs();
                const musicFiles = this.songManager.scanMusicFiles();

                console.log('載入歌曲:', songs);
                console.log('掃描到音樂檔案:', musicFiles);

                if (songs.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">🎵</div>
                            <h3>還沒有歌曲</h3>
                            <p>鋒兄正在創作中...</p>
                        </div>
                    `;
                    return;
                }

                // 顯示歌曲列表
                container.innerHTML = `
                    <div class="music-header">
                        <div class="music-stats">
                            <span class="stat-item">🎵 ${songs.length} 首歌曲</span>
                            <span class="stat-item">🎧 ${musicFiles.length} 個音樂檔案</span>
                            <span class="stat-item">🌍 中英日三語支援</span>
                            <button class="btn btn-sm btn-info" onclick="app.showMusicStats()">詳細統計</button>
                        </div>
                    </div>
                    <div class="songs-grid">
                        ${songs.map(song => {
                            const availableLanguages = this.songManager.getAvailableLanguages(song.id);
                            return `
                                <div class="song-card" onclick="app.showSongDetail(${song.id})">
                                    <div class="song-card-header">
                                        <div class="song-icon">🎵</div>
                                        <div class="song-info">
                                            <h3 class="song-title">${song.title}</h3>
                                            <div class="song-artist">${song.artist}</div>
                                        </div>
                                    </div>
                                    <div class="song-description">${this.songManager.getDescription(song.id, 'zh')}</div>
                                    <div class="song-languages">
                                        <label>可用語言：</label>
                                        ${availableLanguages.map(lang => `
                                            <span class="language-tag ${lang.code}">${lang.name}</span>
                                        `).join('')}
                                    </div>
                                    <div class="song-tags">
                                        ${song.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                    <div class="song-actions">
                                        ${availableLanguages.map(lang => `
                                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); app.playSongWithLanguage(${song.id}, '${lang.code}')">
                                                🎵 ${lang.name}
                                            </button>
                                        `).join('')}
                                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); app.showMusicLyrics(${song.id}, 'zh')">📄 歌詞</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

            } catch (error) {
                console.error('載入音樂時發生錯誤:', error);
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">❌</div>
                        <h3>載入失敗</h3>
                        <p>無法載入音樂：${error.message}</p>
                        <button class="btn btn-primary" onclick="app.loadMusic()" style="margin-top: 15px;">重試</button>
                    </div>
                `;
            }
        }, 500);
    }

    showSongDetail(songId) {
        const container = document.getElementById('music-content');
        if (this.songManager) {
            this.songManager.displayMultiLanguageSong(songId, container, 'zh');
        }
    }

    showLyrics(songId) {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content lyrics-viewer">
                <div class="modal-header">
                    <h3 class="modal-title">${song.title} - ${song.artist}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="lyrics-display">
                        ${this.songManager.formatLyrics(song.lyrics)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="app.playSong(${song.id}); this.closest('.modal').remove();">🎵 播放歌曲</button>
                    <button class="btn btn-secondary" onclick="app.downloadLyrics(${song.id})">📄 下載歌詞</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    playSong(songId) {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        this.showNotification(`🎵 正在播放：${song.title}`, 'success');
        console.log('播放歌曲:', song.title);
    }

    downloadLyrics(songId) {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const lyricsContent = `${song.title}
演唱：${song.artist}
${song.description}

${song.lyrics}

---
來自鋒兄AI資訊系統
生成時間：${new Date().toLocaleString()}`;

        const blob = new Blob([lyricsContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title} - 歌詞.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('歌詞已下載', 'success');
    }

    // ========== 食品管理 CRUD 功能 ==========

    // 顯示食品新增/編輯表單
    showFoodForm(foodId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const isEdit = foodId !== null;
        const food = isEdit ? this.crudManager.readFood(foodId) : null;
        
        // 如果是編輯模式但找不到食品，顯示錯誤
        if (isEdit && !food) {
            this.showNotification('找不到指定的食品', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content form-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? '編輯食品' : '新增食品'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="food-form" onsubmit="app.saveFoodForm(event, ${foodId})">
                        <div class="form-group">
                            <label for="food-name">食品名稱 *</label>
                            <input type="text" id="food-name" name="name" required 
                                   value="${food?.name || ''}" placeholder="請輸入食品名稱">
                        </div>
                        <div class="form-group">
                            <label for="food-brand">品牌/數量</label>
                            <input type="text" id="food-brand" name="brand" 
                                   value="${food?.brand || ''}" placeholder="請輸入品牌或數量">
                        </div>
                        <div class="form-group">
                            <label for="food-price">價格</label>
                            <input type="text" id="food-price" name="price" 
                                   value="${food?.price || 'NT$ 0'}" placeholder="NT$ 0">
                        </div>
                        <div class="form-group">
                            <label for="food-status">狀態</label>
                            <select id="food-status" name="status">
                                <option value="良好" ${food?.status === '良好' ? 'selected' : ''}>良好</option>
                                <option value="即將到期" ${food?.status === '即將到期' ? 'selected' : ''}>即將到期</option>
                                <option value="已過期" ${food?.status === '已過期' ? 'selected' : ''}>已過期</option>
                                <option value="已用完" ${food?.status === '已用完' ? 'selected' : ''}>已用完</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="food-expiry">到期日期 *</label>
                            <input type="date" id="food-expiry" name="expiry" required 
                                   value="${food?.expiry || ''}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? '更新' : '新增'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 聚焦到第一個輸入框
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // 儲存食品表單
    saveFoodForm(event, foodId = null) {
        event.preventDefault();
        
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const formData = new FormData(event.target);
        const foodData = {
            name: formData.get('name'),
            brand: formData.get('brand'),
            price: formData.get('price'),
            status: formData.get('status'),
            expiry: formData.get('expiry')
        };

        try {
            let result;
            if (foodId) {
                result = this.crudManager.updateFood(foodId, foodData);
            } else {
                result = this.crudManager.createFood(foodData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.loadFood(); // 重新載入食品列表
                
                // 關閉模態框
                const modal = event.target.closest('.modal');
                if (modal) modal.remove();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('儲存食品時發生錯誤:', error);
            this.showNotification('儲存食品時發生錯誤', 'error');
        }
    }

    // 編輯食品
    editFood(foodId) {
        this.showFoodForm(foodId);
    }

    // 刪除食品
    deleteFood(foodId) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const food = this.crudManager.readFood(foodId);
        if (!food) {
            this.showNotification('找不到指定的食品', 'error');
            return;
        }

        if (confirm(`確定要刪除食品「${food.name}」嗎？`)) {
            try {
                const result = this.crudManager.deleteFood(foodId);
                
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.loadFood(); // 重新載入食品列表
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('刪除食品時發生錯誤:', error);
                this.showNotification('刪除食品時發生錯誤', 'error');
            }
        }
    }

    // 檢視食品詳情
    viewFoodDetails(foodId) {
        if (!this.crudManager) return;
        
        const food = this.crudManager.readFood(foodId);
        if (!food) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content details-modal">
                <div class="modal-header">
                    <h3 class="modal-title">食品詳情</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>食品名稱</label>
                            <div class="detail-value">${food.name}</div>
                        </div>
                        <div class="detail-item">
                            <label>品牌/數量</label>
                            <div class="detail-value">${food.brand}</div>
                        </div>
                        <div class="detail-item">
                            <label>價格</label>
                            <div class="detail-value">${food.price}</div>
                        </div>
                        <div class="detail-item">
                            <label>狀態</label>
                            <div class="detail-value status-${food.status}">${food.status}</div>
                        </div>
                        <div class="detail-item">
                            <label>到期日期</label>
                            <div class="detail-value">${food.expiry}</div>
                        </div>
                        <div class="detail-item">
                            <label>剩餘天數</label>
                            <div class="detail-value ${food.daysLeft <= 7 ? 'text-danger' : food.daysLeft <= 14 ? 'text-warning' : ''}">${food.daysLeft} 天</div>
                        </div>
                        <div class="detail-item">
                            <label>建立時間</label>
                            <div class="detail-value">${new Date(food.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <label>更新時間</label>
                            <div class="detail-value">${new Date(food.updatedAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">關閉</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); app.editFood(${food.id})">編輯</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 搜尋食品
    searchFood(query) {
        if (!this.crudManager) return;
        
        const foods = this.crudManager.searchFood(query);
        this.displayFoodList(foods);
    }

    // 顯示食品列表
    displayFoodList(foods) {
        const container = document.getElementById('food-grid');
        
        if (foods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合的食品</h3>
                    <p>請嘗試其他搜尋關鍵字</p>
                </div>
            `;
            return;
        }

        container.innerHTML = foods.map(food => `
            <div class="food-card" data-id="${food.id}">
                <div class="food-header">
                    <div class="food-image">🍪</div>
                    <div class="food-basic-info">
                        <h3>${food.name}</h3>
                        <div class="food-brand">品牌: ${food.brand}</div>
                    </div>
                </div>
                <div class="food-details">
                    <div class="food-detail-item">
                        <div class="food-detail-label">價格</div>
                        <div class="food-detail-value">${food.price}</div>
                    </div>
                    <div class="food-detail-item">
                        <div class="food-detail-label">狀態</div>
                        <div class="food-detail-value">${food.status}</div>
                    </div>
                    <div class="food-detail-item">
                        <div class="food-detail-label">到期日期</div>
                        <div class="food-detail-value">${food.expiry}</div>
                    </div>
                    <div class="food-detail-item">
                        <div class="food-detail-label">剩餘天數</div>
                        <div class="food-detail-value ${food.daysLeft <= 7 ? 'text-danger' : food.daysLeft <= 14 ? 'text-warning' : ''}">${food.daysLeft} 天</div>
                    </div>
                </div>
                <div class="food-actions">
                    <button class="btn btn-edit" onclick="app.editFood(${food.id})">編輯</button>
                    <button class="btn btn-info" onclick="app.viewFoodDetails(${food.id})">詳情</button>
                    <button class="btn btn-delete" onclick="app.deleteFood(${food.id})">刪除</button>
                </div>
            </div>
        `).join('');
    }

    // 顯示食品統計
    showFoodStats() {
        if (!this.crudManager) return;
        
        const stats = this.crudManager.getFoodStats();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content stats-modal">
                <div class="modal-header">
                    <h3 class="modal-title">食品統計資訊</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.total}</div>
                            <div class="stat-label">總食品數</div>
                        </div>
                        <div class="stat-card alert">
                            <div class="stat-number">${stats.expiring3Days}</div>
                            <div class="stat-label">3天內到期</div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-number">${stats.expiring7Days}</div>
                            <div class="stat-label">7天內到期</div>
                        </div>
                        <div class="stat-card info">
                            <div class="stat-number">${stats.expiring30Days}</div>
                            <div class="stat-label">30天內到期</div>
                        </div>
                        <div class="stat-card danger">
                            <div class="stat-number">${stats.expired}</div>
                            <div class="stat-label">已過期</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">關閉</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // ========== 訂閱管理 CRUD 功能 ==========

    // 顯示訂閱新增/編輯表單
    showSubscriptionForm(subscriptionId = null) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const isEdit = subscriptionId !== null;
        const subscription = isEdit ? this.crudManager.readSubscription(subscriptionId) : null;
        
        // 如果是編輯模式但找不到訂閱，顯示錯誤
        if (isEdit && !subscription) {
            this.showNotification('找不到指定的訂閱', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content form-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? '編輯訂閱' : '新增訂閱'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="subscription-form" onsubmit="app.saveSubscriptionForm(event, ${subscriptionId})">
                        <div class="form-group">
                            <label for="subscription-name">訂閱名稱 *</label>
                            <input type="text" id="subscription-name" name="name" required 
                                   value="${subscription?.name || ''}" placeholder="請輸入訂閱服務名稱">
                        </div>
                        <div class="form-group">
                            <label for="subscription-url">網站連結</label>
                            <input type="url" id="subscription-url" name="url" 
                                   value="${subscription?.url || ''}" placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label for="subscription-price">價格 *</label>
                            <input type="text" id="subscription-price" name="price" required 
                                   value="${subscription?.price || 'NT$ 0'}" placeholder="NT$ 0">
                        </div>
                        <div class="form-group">
                            <label for="subscription-nextPayment">下次付款日期 *</label>
                            <input type="date" id="subscription-nextPayment" name="nextPayment" required 
                                   value="${subscription?.nextPayment || ''}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? '更新' : '新增'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 聚焦到第一個輸入框
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // 儲存訂閱表單
    saveSubscriptionForm(event, subscriptionId = null) {
        event.preventDefault();
        
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const formData = new FormData(event.target);
        const subscriptionData = {
            name: formData.get('name'),
            url: formData.get('url'),
            price: formData.get('price'),
            nextPayment: formData.get('nextPayment')
        };

        try {
            let result;
            if (subscriptionId) {
                result = this.crudManager.updateSubscription(subscriptionId, subscriptionData);
            } else {
                result = this.crudManager.createSubscription(subscriptionData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.loadSubscriptions(); // 重新載入訂閱列表
                
                // 關閉模態框
                const modal = event.target.closest('.modal');
                if (modal) modal.remove();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('儲存訂閱時發生錯誤:', error);
            this.showNotification('儲存訂閱時發生錯誤', 'error');
        }
    }

    // 編輯訂閱
    editSubscription(subscriptionId) {
        this.showSubscriptionForm(subscriptionId);
    }

    // 刪除訂閱
    deleteSubscription(subscriptionId) {
        // 檢查 CRUD 管理器是否已初始化
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            console.error('CRUD 管理器狀態:', {
                crudManager: !!this.crudManager,
                initialized: this.crudManagerInitialized
            });
            return;
        }

        const subscription = this.crudManager.readSubscription(subscriptionId);
        if (!subscription) {
            this.showNotification('找不到指定的訂閱', 'error');
            return;
        }

        if (confirm(`確定要刪除訂閱「${subscription.name}」嗎？`)) {
            try {
                const result = this.crudManager.deleteSubscription(subscriptionId);
                
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.loadSubscriptions(); // 重新載入訂閱列表
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('刪除訂閱時發生錯誤:', error);
                this.showNotification('刪除訂閱時發生錯誤', 'error');
            }
        }
    }

    // 檢視訂閱詳情
    viewSubscriptionDetails(subscriptionId) {
        if (!this.crudManager) return;
        
        const subscription = this.crudManager.readSubscription(subscriptionId);
        if (!subscription) return;

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content details-modal">
                <div class="modal-header">
                    <h3 class="modal-title">訂閱詳情</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>訂閱名稱</label>
                            <div class="detail-value">${subscription.name}</div>
                        </div>
                        <div class="detail-item">
                            <label>網站連結</label>
                            <div class="detail-value">
                                <a href="${subscription.url}" target="_blank">${subscription.url}</a>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>價格</label>
                            <div class="detail-value">${subscription.price}</div>
                        </div>
                        <div class="detail-item">
                            <label>下次付款</label>
                            <div class="detail-value">${subscription.nextPayment}</div>
                        </div>
                        <div class="detail-item">
                            <label>剩餘天數</label>
                            <div class="detail-value ${subscription.daysLeft <= 3 ? 'text-danger' : subscription.daysLeft <= 7 ? 'text-warning' : ''}">${subscription.daysLeft} 天</div>
                        </div>
                        <div class="detail-item">
                            <label>狀態</label>
                            <div class="detail-value status-${subscription.status}">${subscription.status}</div>
                        </div>
                        <div class="detail-item">
                            <label>建立時間</label>
                            <div class="detail-value">${new Date(subscription.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="detail-item">
                            <label>更新時間</label>
                            <div class="detail-value">${new Date(subscription.updatedAt).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">關閉</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); app.editSubscription(${subscription.id})">編輯</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // 搜尋訂閱
    searchSubscriptions(query) {
        if (!this.crudManager) return;
        
        const subscriptions = this.crudManager.searchSubscriptions(query);
        this.displaySubscriptionList(subscriptions);
    }

    // 顯示訂閱列表
    displaySubscriptionList(subscriptions) {
        const container = document.getElementById('subscriptions-list');
        
        if (subscriptions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合的訂閱</h3>
                    <p>請嘗試其他搜尋關鍵字</p>
                </div>
            `;
            return;
        }

        container.innerHTML = subscriptions.map(sub => `
            <div class="subscription-card" data-id="${sub.id}">
                <div class="subscription-header">
                    <div class="subscription-info">
                        <h3>${sub.name}</h3>
                        <div class="subscription-url">
                            <a href="${sub.url}" target="_blank" style="color: #666; text-decoration: none;">
                                ${sub.url}
                            </a>
                        </div>
                    </div>
                    <div class="subscription-status ${sub.status === '活躍' ? 'status-active' : sub.status === '即將到期' ? 'status-expiring' : 'status-warning'}">
                        ${sub.status}
                    </div>
                </div>
                <div class="subscription-details">
                    <div class="subscription-detail">
                        <div class="subscription-detail-label">價格</div>
                        <div class="subscription-detail-value">${sub.price}</div>
                    </div>
                    <div class="subscription-detail">
                        <div class="subscription-detail-label">下次付款</div>
                        <div class="subscription-detail-value">${sub.nextPayment}</div>
                    </div>
                    <div class="subscription-detail">
                        <div class="subscription-detail-label">剩餘天數</div>
                        <div class="subscription-detail-value ${sub.daysLeft <= 3 ? 'text-danger' : sub.daysLeft <= 7 ? 'text-warning' : ''}">${sub.daysLeft} 天</div>
                    </div>
                </div>
                <div class="subscription-actions">
                    <button class="btn btn-edit" onclick="app.editSubscription(${sub.id})">編輯</button>
                    <button class="btn btn-info" onclick="app.viewSubscriptionDetails(${sub.id})">詳情</button>
                    <button class="btn btn-delete" onclick="app.deleteSubscription(${sub.id})">刪除</button>
                </div>
            </div>
        `).join('');
    }

    // 顯示訂閱統計
    showSubscriptionStats() {
        if (!this.crudManager) return;
        
        const stats = this.crudManager.getSubscriptionStats();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content stats-modal">
                <div class="modal-header">
                    <h3 class="modal-title">訂閱統計資訊</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.total}</div>
                            <div class="stat-label">總訂閱數</div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-number">${stats.active}</div>
                            <div class="stat-label">活躍訂閱</div>
                        </div>
                        <div class="stat-card alert">
                            <div class="stat-number">${stats.expiring3Days}</div>
                            <div class="stat-label">3天內到期</div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-number">${stats.expiring7Days}</div>
                            <div class="stat-label">7天內到期</div>
                        </div>
                        <div class="stat-card danger">
                            <div class="stat-number">${stats.expired}</div>
                            <div class="stat-label">已過期</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">關閉</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    // ========== 多語言音樂功能 ==========

    // 播放指定語言的歌曲
    playSongWithLanguage(songId, language = 'zh') {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const audioPath = this.songManager.getAudioFilePath(songId, language);
        if (!audioPath) {
            this.showNotification(`找不到 ${language} 版本的音樂檔案`, 'warning');
            return;
        }

        // 停止當前播放的音樂
        this.stopCurrentMusic();

        // 創建音樂播放器
        const player = document.createElement('div');
        player.className = 'music-player-widget';
        player.innerHTML = `
            <div class="music-player-content">
                <div class="music-info">
                    <div class="music-title">${song.title}</div>
                    <div class="music-artist">${song.artist} (${this.getLanguageName(language)})</div>
                </div>
                <div class="music-controls">
                    <audio id="music-audio" controls autoplay>
                        <source src="${audioPath}" type="audio/mpeg">
                        您的瀏覽器不支援音樂播放。
                    </audio>
                </div>
                <div class="music-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.showMusicLyrics(${songId}, '${language}')">📄 歌詞</button>
                    <button class="btn btn-sm btn-danger" onclick="app.stopCurrentMusic()">⏹️ 停止</button>
                </div>
            </div>
        `;

        // 移除現有播放器
        const existingPlayer = document.querySelector('.music-player-widget');
        if (existingPlayer) {
            existingPlayer.remove();
        }

        // 添加到頁面
        document.body.appendChild(player);

        // 設置音樂事件
        const audio = player.querySelector('#music-audio');
        audio.addEventListener('loadstart', () => {
            console.log('音樂開始載入:', song.title, language);
        });
        
        audio.addEventListener('canplay', () => {
            console.log('音樂可以播放:', song.title, language);
            this.showNotification(`🎵 正在播放：${song.title} (${this.getLanguageName(language)})`, 'success');
        });
        
        audio.addEventListener('error', (e) => {
            console.error('音樂播放錯誤:', e);
            this.showNotification(`音樂播放失敗：${song.title}`, 'error');
        });

        audio.addEventListener('ended', () => {
            this.showNotification('音樂播放完畢', 'info');
            setTimeout(() => {
                if (document.body.contains(player)) {
                    player.remove();
                }
            }, 2000);
        });

        // 儲存當前播放器引用
        this.currentMusicPlayer = player;
    }

    // 停止當前音樂
    stopCurrentMusic() {
        if (this.currentMusicPlayer) {
            const audio = this.currentMusicPlayer.querySelector('audio');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            this.currentMusicPlayer.remove();
            this.currentMusicPlayer = null;
            this.showNotification('音樂已停止', 'info');
        }
    }

    // 獲取語言名稱
    getLanguageName(languageCode) {
        const languageNames = {
            zh: '中文',
            en: 'English',
            ja: '日本語'
        };
        return languageNames[languageCode] || languageCode;
    }

    // 顯示音樂歌詞
    showMusicLyrics(songId, language = 'zh') {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const lyrics = this.songManager.getLyrics(songId, language);
        const description = this.songManager.getDescription(songId, language);

        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content lyrics-viewer">
                <div class="modal-header">
                    <h3 class="modal-title">${song.title} - ${song.artist} (${this.getLanguageName(language)})</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="song-description" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        ${description}
                    </div>
                    <div class="lyrics-display">
                        ${this.songManager.formatLyrics(lyrics)}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="language-selector" style="margin-right: auto;">
                        <select onchange="app.changeLyricsLanguage(${songId}, this.value, this.closest('.modal'))">
                            <option value="zh" ${language === 'zh' ? 'selected' : ''}>中文</option>
                            <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
                            <option value="ja" ${language === 'ja' ? 'selected' : ''}>日本語</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="app.playSongWithLanguage(${songId}, '${language}'); this.closest('.modal').remove();">🎵 播放歌曲</button>
                    <button class="btn btn-secondary" onclick="app.downloadLyricsMultiLanguage(${songId}, '${language}')">📄 下載歌詞</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 切換歌詞語言
    changeLyricsLanguage(songId, language, modal) {
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const lyrics = this.songManager.getLyrics(songId, language);
        const description = this.songManager.getDescription(songId, language);

        // 更新標題
        const title = modal.querySelector('.modal-title');
        title.textContent = `${song.title} - ${song.artist} (${this.getLanguageName(language)})`;

        // 更新描述
        const descriptionEl = modal.querySelector('.song-description');
        descriptionEl.textContent = description;

        // 更新歌詞
        const lyricsEl = modal.querySelector('.lyrics-display');
        lyricsEl.innerHTML = this.songManager.formatLyrics(lyrics);

        // 更新按鈕
        const playBtn = modal.querySelector('.btn-primary');
        playBtn.onclick = () => {
            this.playSongWithLanguage(songId, language);
            modal.remove();
        };

        const downloadBtn = modal.querySelector('.btn-secondary');
        downloadBtn.onclick = () => this.downloadLyricsMultiLanguage(songId, language);
    }

    // 切換歌曲詳情語言
    changeSongLanguage(songId, language) {
        const container = document.getElementById('music-content');
        if (this.songManager) {
            this.songManager.displayMultiLanguageSong(songId, container, language);
        }
    }

    // 下載多語言歌詞
    downloadLyricsMultiLanguage(songId, language = 'zh') {
        if (!this.songManager) return;
        
        const song = this.songManager.getSongById(songId);
        if (!song) return;

        const lyrics = this.songManager.getLyrics(songId, language);
        const description = this.songManager.getDescription(songId, language);

        const lyricsContent = `${song.title} (${this.getLanguageName(language)})
演唱：${song.artist}
${description}

${lyrics}

---
來自鋒兄AI資訊系統
生成時間：${new Date().toLocaleString()}`;

        const blob = new Blob([lyricsContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title} (${this.getLanguageName(language)}) - 歌詞.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`歌詞已下載 (${this.getLanguageName(language)})`, 'success');
    }

    // 顯示音樂檔案統計
    showMusicStats() {
        if (!this.songManager) return;
        
        const stats = this.songManager.getMusicFileStats();
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content stats-modal">
                <div class="modal-header">
                    <h3 class="modal-title">🎵 音樂庫統計</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.songs}</div>
                            <div class="stat-label">歌曲數量</div>
                        </div>
                        <div class="stat-card info">
                            <div class="stat-number">${stats.totalFiles}</div>
                            <div class="stat-label">音樂檔案</div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-number">${stats.languages.length}</div>
                            <div class="stat-label">支援語言</div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-number">${stats.totalSize}</div>
                            <div class="stat-label">總檔案大小</div>
                        </div>
                    </div>
                    <div class="stats-details">
                        <h4>支援語言</h4>
                        <div class="language-list">
                            ${stats.languages.map(lang => `<span class="tag">${lang}</span>`).join('')}
                        </div>
                        <h4>音樂格式</h4>
                        <div class="format-list">
                            ${stats.formats.map(format => `<span class="tag">${format}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">關閉</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    // 搜尋音樂
    searchMusic(query) {
        if (!this.songManager) return;
        
        const language = document.getElementById('music-language')?.value || 'zh';
        const songs = this.songManager.searchSongsMultiLanguage(query, language);
        this.displayMusicSearchResults(songs);
    }

    // 顯示音樂搜尋結果
    displayMusicSearchResults(songs) {
        const container = document.getElementById('music-content');
        
        if (songs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合的歌曲</h3>
                    <p>請嘗試其他搜尋關鍵字或切換語言</p>
                    <button class="btn btn-primary" onclick="app.loadMusic()" style="margin-top: 15px;">顯示所有歌曲</button>
                </div>
            `;
            return;
        }

        const language = document.getElementById('music-language')?.value || 'zh';

        container.innerHTML = `
            <div class="search-results-header">
                <h3>搜尋結果 (${songs.length} 首歌曲)</h3>
                <button class="btn btn-secondary" onclick="app.loadMusic()">返回所有歌曲</button>
            </div>
            <div class="songs-grid">
                ${songs.map(song => {
                    const availableLanguages = this.songManager.getAvailableLanguages(song.id);
                    return `
                        <div class="song-card" onclick="app.showSongDetail(${song.id})">
                            <div class="song-card-header">
                                <div class="song-icon">🎵</div>
                                <div class="song-info">
                                    <h3 class="song-title">${song.title}</h3>
                                    <div class="song-artist">${song.artist}</div>
                                </div>
                            </div>
                            <div class="song-description">${this.songManager.getDescription(song.id, language)}</div>
                            <div class="song-languages">
                                <label>可用語言：</label>
                                ${availableLanguages.map(lang => `
                                    <span class="language-tag ${lang.code}">${lang.name}</span>
                                `).join('')}
                            </div>
                            <div class="song-tags">
                                ${song.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                            <div class="song-actions">
                                ${availableLanguages.map(lang => `
                                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); app.playSongWithLanguage(${song.id}, '${lang.code}')">
                                        🎵 ${lang.name}
                                    </button>
                                `).join('')}
                                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); app.showMusicLyrics(${song.id}, '${language}')">📄 歌詞</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM 載入完成，初始化應用程式...');
    try {
        window.app = new App();
        console.log('✅ 應用程式初始化成功');
    } catch (error) {
        console.error('❌ 應用程式初始化失敗:', error);
    }
});