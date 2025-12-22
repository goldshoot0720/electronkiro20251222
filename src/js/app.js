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

    // 基本頁面載入方法
    loadImages() {
        const container = document.getElementById('images-grid');
        container.innerHTML = '<div class="loading">載入圖片中...</div>';
        
        try {
            // 初始化圖片管理器
            if (!this.imageManager) {
                if (typeof ImageManager !== 'undefined') {
                    this.imageManager = new ImageManager();
                } else {
                    throw new Error('ImageManager 未載入');
                }
            }
            
            // 掃描圖片
            const images = this.imageManager.scanImages();
            
            if (images.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🖼️</div>
                        <h3>沒有找到圖片</h3>
                        <p>請將圖片檔案放入 assets/images 資料夾</p>
                        <p>支援格式：JPG, PNG, GIF, WebP</p>
                    </div>
                `;
                return;
            }
            
            // 顯示圖片
            container.innerHTML = images.map(image => `
                <div class="image-card" data-id="${image.id}">
                    <div class="image-preview">
                        <img src="${image.relativePath}" alt="${image.name}" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                             onclick="app.viewImage('${image.relativePath}', '${image.name}')">
                        <div class="image-placeholder" style="display:none;">🖼️</div>
                    </div>
                    <div class="image-info">
                        <div class="image-title" title="${image.name}">${image.name}</div>
                        <div class="image-details">
                            <span class="image-format">${image.format}</span>
                            <span class="image-size">${image.size}</span>
                        </div>
                        <div class="image-actions">
                            <button class="btn btn-sm btn-info" onclick="app.viewImage('${image.relativePath}', '${image.name}')">檢視</button>
                            <button class="btn btn-sm btn-secondary" onclick="app.showImageDetails('${image.id}')">詳情</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            console.log(`✅ 載入了 ${images.length} 張圖片`);
            
        } catch (error) {
            console.error('載入圖片時發生錯誤:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3>載入圖片失敗</h3>
                    <p>錯誤：${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadImages()">重試</button>
                </div>
            `;
        }
    }

    loadVideos() {
        const container = document.getElementById('videos-grid');
        container.innerHTML = '<div class="loading">載入影片中...</div>';
        
        try {
            // 初始化影片管理器
            if (!this.videoManager) {
                if (typeof VideoManager !== 'undefined') {
                    this.videoManager = new VideoManager();
                } else {
                    throw new Error('VideoManager 未載入');
                }
            }
            
            // 掃描影片
            const videos = this.videoManager.scanVideos();
            
            if (videos.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎬</div>
                        <h3>沒有找到影片</h3>
                        <p>請將影片檔案放入 assets/videos 資料夾</p>
                        <p>支援格式：MP4, AVI, MOV, WMV, MKV, WebM</p>
                    </div>
                `;
                return;
            }
            
            // 顯示影片
            container.innerHTML = videos.map(video => `
                <div class="video-card" data-id="${video.id}">
                    <div class="video-thumbnail">
                        <div class="video-icon">🎬</div>
                        <div class="video-format">${video.format}</div>
                        <div class="video-duration">${video.duration}</div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-description">${video.description}</div>
                        <div class="video-meta">
                            <span>${video.size}</span>
                            <span>${new Date(video.modifiedAt).toLocaleDateString('zh-TW')}</span>
                        </div>
                        <div class="video-actions">
                            <button class="btn btn-sm btn-primary" onclick="app.playVideo('${video.relativePath}', '${video.title}')">播放</button>
                            <button class="btn btn-sm btn-info" onclick="app.showVideoDetails('${video.id}')">詳情</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            console.log(`✅ 載入了 ${videos.length} 個影片`);
            
        } catch (error) {
            console.error('載入影片時發生錯誤:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3>載入影片失敗</h3>
                    <p>錯誤：${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadVideos()">重試</button>
                </div>
            `;
        }
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

    loadMusic() {
        const container = document.getElementById('music-content');
        container.innerHTML = '<div class="loading">載入音樂中...</div>';
        
        try {
            // 確保音樂管理器已初始化
            if (!this.songManager) {
                this.initSongManager();
            }
            
            if (!this.songManager) {
                throw new Error('SongManager 未載入');
            }
            
            const songs = this.songManager.getAllSongs();
            const currentLanguage = document.getElementById('music-language')?.value || 'zh';
            
            if (songs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎵</div>
                        <h3>沒有找到音樂</h3>
                        <p>請將音樂檔案放入 assets/musics 資料夾</p>
                        <p>支援格式：MP3, WAV, OGG, M4A</p>
                    </div>
                `;
                return;
            }
            
            // 顯示音樂統計
            const stats = this.songManager.getMusicFileStats();
            const statsHtml = `
                <div class="music-header">
                    <h3>🎵 鋒兄音樂庫統計</h3>
                    <div class="music-stats">
                        <div class="stat-item">📀 歌曲數量: ${stats.songs}</div>
                        <div class="stat-item">🗂️ 檔案數量: ${stats.totalFiles}</div>
                        <div class="stat-item">💾 總大小: ${stats.totalSize}</div>
                        <div class="stat-item">🌐 語言: ${stats.languages.join(', ')}</div>
                    </div>
                </div>
            `;
            
            // 顯示歌曲列表
            const songsHtml = `
                <div class="songs-grid">
                    ${songs.map(song => {
                        const description = this.songManager.getDescription(song.id, currentLanguage);
                        const availableLanguages = this.songManager.getAvailableLanguages(song.id);
                        
                        return `
                            <div class="song-card" data-id="${song.id}">
                                <div class="song-card-header">
                                    <div class="song-icon">🎵</div>
                                    <div class="song-info">
                                        <div class="song-title">${song.title}</div>
                                        <div class="song-artist">${song.artist}</div>
                                    </div>
                                </div>
                                <div class="song-description">${description}</div>
                                <div class="song-languages">
                                    <label>可用語言:</label>
                                    ${availableLanguages.map(lang => 
                                        `<span class="language-tag ${lang.code}">${lang.name}</span>`
                                    ).join('')}
                                </div>
                                <div class="song-tags">
                                    ${song.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                                <div class="song-actions">
                                    ${availableLanguages.map(lang => `
                                        <button class="btn btn-sm btn-primary" 
                                                onclick="app.playSongWithLanguage(${song.id}, '${lang.code}')">
                                            🎵 ${lang.name}
                                        </button>
                                    `).join('')}
                                    <button class="btn btn-sm btn-secondary" 
                                            onclick="app.showLyrics(${song.id}, '${currentLanguage}')">
                                        📄 歌詞
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            container.innerHTML = statsHtml + songsHtml;
            console.log(`✅ 載入了 ${songs.length} 首歌曲`);
            
        } catch (error) {
            console.error('載入音樂時發生錯誤:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <h3>載入音樂失敗</h3>
                    <p>錯誤：${error.message}</p>
                    <button class="btn btn-primary" onclick="app.loadMusic()">重試</button>
                </div>
            `;
        }
    }

    // 音樂相關方法
    playSongWithLanguage(songId, language) {
        if (!this.songManager) {
            this.showNotification('音樂管理器未初始化', 'error');
            return;
        }

        const song = this.songManager.getSongById(songId);
        if (!song) {
            this.showNotification('找不到指定的歌曲', 'error');
            return;
        }

        const audioPath = this.songManager.getAudioFilePath(songId, language);
        if (!audioPath) {
            this.showNotification(`找不到 ${language} 版本的音樂檔案`, 'error');
            return;
        }

        // 檢查檔案是否存在
        if (!this.songManager.checkAudioFileExists(songId, language)) {
            this.showNotification(`音樂檔案不存在: ${song.audioFiles[language]}`, 'error');
            return;
        }

        const languageName = language === 'zh' ? '中文' : language === 'en' ? 'English' : '日本語';
        this.showNotification(`正在播放：${song.title} (${languageName})`, 'success');

        // 創建音樂播放器
        this.createMusicPlayer(song, language, audioPath);
    }

    createMusicPlayer(song, language, audioPath) {
        // 移除現有的播放器
        const existingPlayer = document.getElementById('music-player-widget');
        if (existingPlayer) {
            existingPlayer.remove();
        }

        const languageName = language === 'zh' ? '中文' : language === 'en' ? 'English' : '日本語';
        
        const player = document.createElement('div');
        player.id = 'music-player-widget';
        player.className = 'music-player-widget';
        player.innerHTML = `
            <div class="music-player-content">
                <div class="music-info">
                    <div class="music-title">${song.title}</div>
                    <div class="music-artist">${song.artist} (${languageName})</div>
                </div>
                <div class="music-controls">
                    <audio controls autoplay>
                        <source src="${audioPath}" type="audio/mpeg">
                        您的瀏覽器不支援音樂播放
                    </audio>
                </div>
                <div class="music-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.showLyrics(${song.id}, '${language}')">歌詞</button>
                    <button class="btn btn-sm btn-secondary" onclick="app.closeMusicPlayer()">關閉</button>
                </div>
            </div>
        `;

        document.body.appendChild(player);
    }

    closeMusicPlayer() {
        const player = document.getElementById('music-player-widget');
        if (player) {
            player.remove();
        }
    }

    showLyrics(songId, language = 'zh') {
        if (!this.songManager) {
            this.showNotification('音樂管理器未初始化', 'error');
            return;
        }

        const song = this.songManager.getSongById(songId);
        if (!song) {
            this.showNotification('找不到指定的歌曲', 'error');
            return;
        }

        const lyrics = this.songManager.getLyrics(songId, language);
        const description = this.songManager.getDescription(songId, language);
        const formattedLyrics = this.songManager.formatLyrics(lyrics);
        const languageName = language === 'zh' ? '中文' : language === 'en' ? 'English' : '日本語';

        const lyricsContent = `
            <div class="song-detail">
                <div class="song-header">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    <div class="song-description">${description}</div>
                    <div class="language-selector">
                        <label>語言版本：</label>
                        <select onchange="app.showLyrics(${songId}, this.value)">
                            <option value="zh" ${language === 'zh' ? 'selected' : ''}>中文</option>
                            <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
                            <option value="ja" ${language === 'ja' ? 'selected' : ''}>日本語</option>
                        </select>
                    </div>
                </div>
                <div class="song-lyrics">
                    <h3>歌詞 (${languageName})</h3>
                    <div class="lyrics-content">
                        ${formattedLyrics}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="app.playSongWithLanguage(${songId}, '${language}')">🎵 播放</button>
                <button class="btn btn-secondary" onclick="app.downloadLyrics(${songId}, '${language}')">📄 下載歌詞</button>
                <button class="btn btn-secondary" onclick="app.closeModal('lyrics-modal')">關閉</button>
            </div>
        `;

        this.showModal('lyrics-modal', `${song.title} - 歌詞`, lyricsContent);
    }

    downloadLyrics(songId, language) {
        if (!this.songManager) {
            this.showNotification('音樂管理器未初始化', 'error');
            return;
        }

        const song = this.songManager.getSongById(songId);
        const lyrics = this.songManager.getLyrics(songId, language);
        const languageName = language === 'zh' ? '中文' : language === 'en' ? 'English' : '日本語';

        const content = `${song.title} - ${song.artist} (${languageName})\n\n${lyrics}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title}_${languageName}_歌詞.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showNotification('歌詞已下載', 'success');
    }

    searchMusic(query) {
        if (!this.songManager) {
            return;
        }

        const language = document.getElementById('music-language')?.value || 'zh';
        const results = this.songManager.searchSongsMultiLanguage(query, language);
        
        const container = document.getElementById('music-content');
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合條件的歌曲</h3>
                    <p>請嘗試其他搜尋關鍵字</p>
                    <button class="btn btn-primary" onclick="app.loadMusic()">顯示所有歌曲</button>
                </div>
            `;
            return;
        }

        // 重新載入音樂頁面但只顯示搜尋結果
        this.displayMusicResults(results, language);
    }

    displayMusicResults(songs, language) {
        const container = document.getElementById('music-content');
        
        const songsHtml = `
            <div class="search-results-header">
                <h3>🔍 搜尋結果 (${songs.length} 首歌曲)</h3>
                <button class="btn btn-secondary" onclick="app.loadMusic()">顯示所有歌曲</button>
            </div>
            <div class="songs-grid">
                ${songs.map(song => {
                    const description = this.songManager.getDescription(song.id, language);
                    const availableLanguages = this.songManager.getAvailableLanguages(song.id);
                    
                    return `
                        <div class="song-card" data-id="${song.id}">
                            <div class="song-card-header">
                                <div class="song-icon">🎵</div>
                                <div class="song-info">
                                    <div class="song-title">${song.title}</div>
                                    <div class="song-artist">${song.artist}</div>
                                </div>
                            </div>
                            <div class="song-description">${description}</div>
                            <div class="song-languages">
                                <label>可用語言:</label>
                                ${availableLanguages.map(lang => 
                                    `<span class="language-tag ${lang.code}">${lang.name}</span>`
                                ).join('')}
                            </div>
                            <div class="song-tags">
                                ${song.tags.slice(0, 4).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                            <div class="song-actions">
                                ${availableLanguages.map(lang => `
                                    <button class="btn btn-sm btn-primary" 
                                            onclick="app.playSongWithLanguage(${song.id}, '${lang.code}')">
                                        🎵 ${lang.name}
                                    </button>
                                `).join('')}
                                <button class="btn btn-sm btn-secondary" 
                                        onclick="app.showLyrics(${song.id}, '${language}')">
                                    📄 歌詞
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = songsHtml;
    }

    // 圖片和影片相關方法
    viewImage(imagePath, imageName) {
        const imageContent = `
            <div class="image-viewer">
                <img src="${imagePath}" alt="${imageName}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;">
                <div style="text-align: center; margin-top: 15px;">
                    <h4>${imageName}</h4>
                </div>
            </div>
        `;
        
        this.showModal('image-viewer-modal', '圖片檢視', imageContent);
    }

    playVideo(videoPath, videoTitle) {
        const videoContent = `
            <div class="video-player">
                <video controls style="max-width: 100%; max-height: 70vh; border-radius: 8px;">
                    <source src="${videoPath}" type="video/mp4">
                    您的瀏覽器不支援影片播放
                </video>
                <div style="text-align: center; margin-top: 15px;">
                    <h4>${videoTitle}</h4>
                </div>
            </div>
        `;
        
        this.showModal('video-player-modal', '影片播放', videoContent);
    }

    showImageDetails(imageId) {
        if (!this.imageManager) {
            this.showNotification('圖片管理器未初始化', 'error');
            return;
        }

        const images = this.imageManager.scanImages();
        const image = images.find(img => img.id == imageId);
        
        if (!image) {
            this.showNotification('找不到指定的圖片', 'error');
            return;
        }

        const detailsContent = `
            <div class="details-grid">
                <div class="detail-item">
                    <label>檔案名稱</label>
                    <div class="detail-value">${image.name}</div>
                </div>
                <div class="detail-item">
                    <label>格式</label>
                    <div class="detail-value">${image.format}</div>
                </div>
                <div class="detail-item">
                    <label>檔案大小</label>
                    <div class="detail-value">${image.size}</div>
                </div>
                <div class="detail-item">
                    <label>建立時間</label>
                    <div class="detail-value">${new Date(image.createdAt).toLocaleString('zh-TW')}</div>
                </div>
                <div class="detail-item">
                    <label>修改時間</label>
                    <div class="detail-value">${new Date(image.modifiedAt).toLocaleString('zh-TW')}</div>
                </div>
                <div class="detail-item">
                    <label>檔案路徑</label>
                    <div class="detail-value" style="word-break: break-all;">${image.path}</div>
                </div>
            </div>
        `;

        this.showModal('image-details-modal', `圖片詳情 - ${image.name}`, detailsContent);
    }

    showVideoDetails(videoId) {
        if (!this.videoManager) {
            this.showNotification('影片管理器未初始化', 'error');
            return;
        }

        const videos = this.videoManager.scanVideos();
        const video = videos.find(vid => vid.id == videoId);
        
        if (!video) {
            this.showNotification('找不到指定的影片', 'error');
            return;
        }

        const detailsContent = `
            <div class="details-grid">
                <div class="detail-item">
                    <label>影片標題</label>
                    <div class="detail-value">${video.title}</div>
                </div>
                <div class="detail-item">
                    <label>檔案名稱</label>
                    <div class="detail-value">${video.name}</div>
                </div>
                <div class="detail-item">
                    <label>描述</label>
                    <div class="detail-value">${video.description}</div>
                </div>
                <div class="detail-item">
                    <label>格式</label>
                    <div class="detail-value">${video.format}</div>
                </div>
                <div class="detail-item">
                    <label>檔案大小</label>
                    <div class="detail-value">${video.size}</div>
                </div>
                <div class="detail-item">
                    <label>時長</label>
                    <div class="detail-value">${video.duration}</div>
                </div>
                <div class="detail-item">
                    <label>建立時間</label>
                    <div class="detail-value">${new Date(video.createdAt).toLocaleString('zh-TW')}</div>
                </div>
                <div class="detail-item">
                    <label>修改時間</label>
                    <div class="detail-value">${new Date(video.modifiedAt).toLocaleString('zh-TW')}</div>
                </div>
            </div>
        `;

        this.showModal('video-details-modal', `影片詳情 - ${video.title}`, detailsContent);
    }

    // CRUD 功能的基本方法
    showFoodForm(foodId = null) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }
        
        const isEdit = foodId !== null;
        const food = isEdit ? this.crudManager.readFood(foodId) : null;
        
        const formContent = `
            <form id="food-form" class="app-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">食品名稱 *</label>
                        <input type="text" name="name" class="form-input" required 
                               value="${food ? food.name : ''}" placeholder="請輸入食品名稱">
                    </div>
                    <div class="form-group">
                        <label class="form-label">數量 *</label>
                        <input type="number" name="amount" class="form-input" required min="1"
                               value="${food ? (food.amount || 1) : 1}" placeholder="1">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">價格</label>
                        <input type="text" name="price" class="form-input" 
                               value="${food ? food.price : 'NT$ 0'}" placeholder="NT$ 0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">購買商店</label>
                        <input type="text" name="shop" class="form-input" 
                               value="${food ? (food.shop || '') : ''}" placeholder="請輸入購買商店">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">到期日期 *</label>
                    <input type="date" name="todate" class="form-input" required 
                           value="${food ? (food.todate || food.expiry || '') : ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">狀態</label>
                    <select name="status" class="form-select">
                        <option value="良好" ${food && food.status === '良好' ? 'selected' : ''}>良好</option>
                        <option value="即將到期" ${food && food.status === '即將到期' ? 'selected' : ''}>即將到期</option>
                        <option value="已過期" ${food && food.status === '已過期' ? 'selected' : ''}>已過期</option>
                        <option value="已用完" ${food && food.status === '已用完' ? 'selected' : ''}>已用完</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">食品照片</label>
                    <input type="file" name="photo" class="form-input" accept="image/*" 
                           onchange="app.handleFoodPhotoUpload(this)">
                    ${food && food.photo ? `
                        <div class="current-photo">
                            <img src="${food.photo}" alt="當前照片" style="max-width: 100px; max-height: 100px; margin-top: 10px; border-radius: 4px;">
                            <p style="font-size: 12px; color: #666; margin-top: 5px;">當前照片</p>
                        </div>
                    ` : ''}
                    <div id="photo-preview" style="margin-top: 10px;"></div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeFoodForm()">取消</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '更新' : '新增'}</button>
                </div>
            </form>
        `;
        
        this.showModal('food-form-modal', `${isEdit ? '編輯' : '新增'}食品`, formContent);
        
        // 綁定表單提交事件
        document.getElementById('food-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFoodForm(e, foodId);
        });
    }

    showSubscriptionForm(subscriptionId = null) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }
        
        const isEdit = subscriptionId !== null;
        const subscription = isEdit ? this.crudManager.readSubscription(subscriptionId) : null;
        
        const formContent = `
            <form id="subscription-form" class="app-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">服務名稱 *</label>
                        <input type="text" name="name" class="form-input" required 
                               value="${subscription ? subscription.name : ''}" placeholder="請輸入服務名稱">
                    </div>
                    <div class="form-group">
                        <label class="form-label">帳號</label>
                        <input type="text" name="account" class="form-input" 
                               value="${subscription ? (subscription.account || '') : ''}" placeholder="請輸入帳號">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">價格 *</label>
                        <input type="text" name="price" class="form-input" required
                               value="${subscription ? subscription.price : 'NT$ 0'}" placeholder="NT$ 0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">下次付款日期 *</label>
                        <input type="date" name="nextdate" class="form-input" required 
                               value="${subscription ? (subscription.nextdate || subscription.nextPayment || '') : ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">網站網址</label>
                    <input type="url" name="site" class="form-input" 
                           value="${subscription ? (subscription.site || subscription.url || '') : ''}" placeholder="https://example.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">備註</label>
                    <textarea name="note" class="form-textarea" rows="3" 
                              placeholder="請輸入備註資訊">${subscription ? (subscription.note || '') : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">付款週期</label>
                    <select name="cycle" class="form-select">
                        <option value="monthly" ${subscription && subscription.cycle === 'monthly' ? 'selected' : ''}>每月</option>
                        <option value="yearly" ${subscription && subscription.cycle === 'yearly' ? 'selected' : ''}>每年</option>
                        <option value="weekly" ${subscription && subscription.cycle === 'weekly' ? 'selected' : ''}>每週</option>
                        <option value="quarterly" ${subscription && subscription.cycle === 'quarterly' ? 'selected' : ''}>每季</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeSubscriptionForm()">取消</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '更新' : '新增'}</button>
                </div>
            </form>
        `;
        
        this.showModal('subscription-form-modal', `${isEdit ? '編輯' : '新增'}訂閱`, formContent);
        
        // 綁定表單提交事件
        document.getElementById('subscription-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSubscriptionForm(e, subscriptionId);
        });
    }

    async saveFoodForm(event, foodId = null) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        try {
            const formData = new FormData(event.target);
            const foodData = {
                name: formData.get('name'),
                amount: parseInt(formData.get('amount')) || 1,
                price: formData.get('price'),
                shop: formData.get('shop'),
                todate: formData.get('todate'),
                status: formData.get('status'),
                // 保持向後相容性
                expiry: formData.get('todate'),
                brand: formData.get('shop') // 將商店映射到品牌欄位以保持相容性
            };

            // 處理照片上傳
            const photoFile = formData.get('photo');
            if (photoFile && photoFile.size > 0) {
                try {
                    const photoData = await this.processPhotoUpload(photoFile);
                    foodData.photo = photoData.dataUrl;
                    foodData.photoHash = photoData.hash;
                } catch (photoError) {
                    console.warn('照片處理失敗:', photoError);
                    this.showNotification('照片上傳失敗，但食品資料將正常儲存', 'warning');
                }
            }

            let result;
            if (foodId) {
                result = await this.crudManager.updateFood(foodId, foodData);
            } else {
                result = await this.crudManager.createFood(foodData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeFoodForm();
                this.loadFood(); // 重新載入食品列表
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('儲存食品時發生錯誤:', error);
            this.showNotification('儲存食品時發生錯誤', 'error');
        }
    }

    async saveSubscriptionForm(event, subscriptionId = null) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        try {
            const formData = new FormData(event.target);
            const subscriptionData = {
                name: formData.get('name'),
                account: formData.get('account'),
                price: formData.get('price'),
                nextdate: formData.get('nextdate'),
                site: formData.get('site'),
                note: formData.get('note'),
                cycle: formData.get('cycle'),
                // 保持向後相容性
                nextPayment: formData.get('nextdate'),
                url: formData.get('site')
            };

            let result;
            if (subscriptionId) {
                result = await this.crudManager.updateSubscription(subscriptionId, subscriptionData);
            } else {
                result = await this.crudManager.createSubscription(subscriptionData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.closeSubscriptionForm();
                this.loadSubscriptions(); // 重新載入訂閱列表
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('儲存訂閱時發生錯誤:', error);
            this.showNotification('儲存訂閱時發生錯誤', 'error');
        }
    }

    editFood(foodId) {
        this.showFoodForm(foodId);
    }

    editSubscription(subscriptionId) {
        this.showSubscriptionForm(subscriptionId);
    }

    async deleteFood(foodId) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        if (confirm('確定要刪除這個食品嗎？此操作無法復原。')) {
            try {
                const result = await this.crudManager.deleteFood(foodId);
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

    async deleteSubscription(subscriptionId) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        if (confirm('確定要刪除這個訂閱嗎？此操作無法復原。')) {
            try {
                const result = await this.crudManager.deleteSubscription(subscriptionId);
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

    viewFoodDetails(foodId) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        const food = this.crudManager.readFood(foodId);
        if (!food) {
            this.showNotification('找不到指定的食品', 'error');
            return;
        }

        const detailsContent = `
            <div class="food-details-container">
                ${food.photo ? `
                    <div class="food-photo-section">
                        <img src="${food.photo}" alt="${food.name}" class="food-detail-photo">
                    </div>
                ` : ''}
                
                <div class="details-grid">
                    <div class="detail-item">
                        <label>食品名稱</label>
                        <div class="detail-value">${food.name}</div>
                    </div>
                    <div class="detail-item">
                        <label>數量</label>
                        <div class="detail-value">${food.amount || food.brand || '1'}</div>
                    </div>
                    <div class="detail-item">
                        <label>價格</label>
                        <div class="detail-value">${food.price}</div>
                    </div>
                    <div class="detail-item">
                        <label>購買商店</label>
                        <div class="detail-value">${food.shop || food.brand || '未設定'}</div>
                    </div>
                    <div class="detail-item">
                        <label>狀態</label>
                        <div class="detail-value status-${food.status}">${food.status}</div>
                    </div>
                    <div class="detail-item">
                        <label>到期日期</label>
                        <div class="detail-value">${food.todate || food.expiry}</div>
                    </div>
                    <div class="detail-item">
                        <label>剩餘天數</label>
                        <div class="detail-value ${food.daysLeft <= 7 ? 'text-danger' : food.daysLeft <= 14 ? 'text-warning' : ''}">${food.daysLeft} 天</div>
                    </div>
                    <div class="detail-item">
                        <label>建立時間</label>
                        <div class="detail-value">${new Date(food.createdAt).toLocaleString('zh-TW')}</div>
                    </div>
                    <div class="detail-item">
                        <label>更新時間</label>
                        <div class="detail-value">${new Date(food.updatedAt).toLocaleString('zh-TW')}</div>
                    </div>
                    ${food.photoHash ? `
                        <div class="detail-item">
                            <label>照片雜湊值</label>
                            <div class="detail-value" style="font-family: monospace; font-size: 12px;">${food.photoHash}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.showModal('food-details-modal', `食品詳情 - ${food.name}`, detailsContent);
    }

    viewSubscriptionDetails(subscriptionId) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        const subscription = this.crudManager.readSubscription(subscriptionId);
        if (!subscription) {
            this.showNotification('找不到指定的訂閱', 'error');
            return;
        }

        const detailsContent = `
            <div class="details-grid">
                <div class="detail-item">
                    <label>服務名稱</label>
                    <div class="detail-value">${subscription.name}</div>
                </div>
                <div class="detail-item">
                    <label>帳號</label>
                    <div class="detail-value">${subscription.account || '未設定'}</div>
                </div>
                <div class="detail-item">
                    <label>價格</label>
                    <div class="detail-value">${subscription.price}</div>
                </div>
                <div class="detail-item">
                    <label>付款週期</label>
                    <div class="detail-value">${this.getCycleLabel(subscription.cycle)}</div>
                </div>
                <div class="detail-item">
                    <label>網站網址</label>
                    <div class="detail-value">
                        ${(subscription.site || subscription.url) ? 
                            `<a href="${subscription.site || subscription.url}" target="_blank">${subscription.site || subscription.url}</a>` : 
                            '未設定'}
                    </div>
                </div>
                <div class="detail-item">
                    <label>狀態</label>
                    <div class="detail-value status-${subscription.status}">${subscription.status}</div>
                </div>
                <div class="detail-item">
                    <label>下次付款日期</label>
                    <div class="detail-value">${subscription.nextdate || subscription.nextPayment}</div>
                </div>
                <div class="detail-item">
                    <label>剩餘天數</label>
                    <div class="detail-value ${subscription.daysLeft <= 3 ? 'text-danger' : subscription.daysLeft <= 7 ? 'text-warning' : ''}">${subscription.daysLeft} 天</div>
                </div>
                ${subscription.note ? `
                    <div class="detail-item detail-full-width">
                        <label>備註</label>
                        <div class="detail-value">${subscription.note}</div>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <label>建立時間</label>
                    <div class="detail-value">${new Date(subscription.createdAt).toLocaleString('zh-TW')}</div>
                </div>
                <div class="detail-item">
                    <label>更新時間</label>
                    <div class="detail-value">${new Date(subscription.updatedAt).toLocaleString('zh-TW')}</div>
                </div>
            </div>
        `;

        this.showModal('subscription-details-modal', `訂閱詳情 - ${subscription.name}`, detailsContent);
    }

    getCycleLabel(cycle) {
        const cycleLabels = {
            'monthly': '每月',
            'yearly': '每年',
            'weekly': '每週',
            'quarterly': '每季'
        };
        return cycleLabels[cycle] || '每月';
    }

    playRandomSong() {
        if (!this.songManager) {
            this.showNotification('音樂管理器未初始化', 'error');
            return;
        }

        const songs = this.songManager.getAllSongs();
        if (songs.length === 0) {
            this.showNotification('沒有可播放的歌曲', 'warning');
            return;
        }

        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        const languages = ['zh', 'en', 'ja'];
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

        this.showNotification(`正在播放：${randomSong.title} (${randomLanguage === 'zh' ? '中文' : randomLanguage === 'en' ? 'English' : '日本語'})`, 'info');
        
        // 這裡可以添加實際的音樂播放邏輯
        console.log('播放歌曲:', randomSong.title, '語言:', randomLanguage);
    }

    // 照片處理功能
    handleFoodPhotoUpload(input) {
        const file = input.files[0];
        if (!file) return;

        // 檢查檔案類型
        if (!file.type.startsWith('image/')) {
            this.showNotification('請選擇圖片檔案', 'error');
            input.value = '';
            return;
        }

        // 檢查檔案大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('圖片檔案不能超過 5MB', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            if (preview) {
                preview.innerHTML = `
                    <div class="photo-preview">
                        <img src="${e.target.result}" alt="照片預覽" style="max-width: 150px; max-height: 150px; border-radius: 4px; border: 1px solid #ddd;">
                        <p style="font-size: 12px; color: #666; margin-top: 5px;">照片預覽</p>
                    </div>
                `;
            }
        };
        reader.readAsDataURL(file);
    }

    async processPhotoUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                // 生成簡單的雜湊值
                const hash = this.generateSimpleHash(dataUrl);
                resolve({ dataUrl, hash });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    generateSimpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 轉換為32位整數
        }
        return Math.abs(hash).toString(16);
    }

    // 模態框相關方法
    showModal(id, title, content) {
        // 移除現有的模態框
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="app.closeModal('${id}')">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 顯示模態框
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 點擊背景關閉模態框
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(id);
            }
        });
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    closeFoodForm() {
        this.closeModal('food-form-modal');
    }

    closeSubscriptionForm() {
        this.closeModal('subscription-form-modal');
    }

    // 搜尋功能
    searchFood(query) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            return;
        }

        const results = this.crudManager.searchFood(query);
        this.displayFoodResults(results);
    }

    searchSubscriptions(query) {
        if (!this.crudManager || !this.crudManagerInitialized) {
            return;
        }

        const results = this.crudManager.searchSubscriptions(query);
        this.displaySubscriptionResults(results);
    }

    displayFoodResults(foods) {
        const container = document.getElementById('food-grid');
        if (!container) return;

        if (foods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合條件的食品</h3>
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
                        <div class="food-detail-value status-${food.status}">${food.status}</div>
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

    displaySubscriptionResults(subscriptions) {
        const container = document.getElementById('subscriptions-list');
        if (!container) return;

        if (subscriptions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>沒有找到符合條件的訂閱</h3>
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
                            ${sub.url ? `<a href="${sub.url}" target="_blank">${sub.url}</a>` : '未設定網址'}
                        </div>
                    </div>
                    <div class="subscription-status status-${sub.status.replace(/\s+/g, '')}">${sub.status}</div>
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

    // 統計功能
    showFoodStats() {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        const stats = this.crudManager.getFoodStats();
        const statsContent = `
            <div class="stats-grid">
                <div class="stat-card success">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">總食品數</div>
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
        `;

        this.showModal('food-stats-modal', '食品統計資訊', statsContent);
    }

    showSubscriptionStats() {
        if (!this.crudManager || !this.crudManagerInitialized) {
            this.showNotification('CRUD 管理器未初始化，請稍後再試', 'error');
            return;
        }

        const stats = this.crudManager.getSubscriptionStats();
        const statsContent = `
            <div class="stats-grid">
                <div class="stat-card success">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">總訂閱數</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-number">${stats.active}</div>
                    <div class="stat-label">活躍訂閱</div>
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
        `;

        this.showModal('subscription-stats-modal', '訂閱統計資訊', statsContent);
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