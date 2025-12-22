// 組件相關功能
class ComponentManager {
    constructor() {
        this.modals = new Map();
        this.init();
    }

    init() {
        this.setupModalSystem();
        this.setupFormHandlers();
        this.setupFileHandlers();
    }

    // 模態框系統
    setupModalSystem() {
        // 創建模態框容器
        if (!document.getElementById('modal-container')) {
            const modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        }
    }

    createModal(id, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = id;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="componentManager.closeModal('${id}')">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.getElementById('modal-container').appendChild(modal);
        this.modals.set(id, modal);
        return modal;
    }

    showModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // 表單處理
    setupFormHandlers() {
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('app-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('表單提交:', data);
        
        // 模擬提交
        this.showLoadingState(form);
        
        setTimeout(() => {
            this.hideLoadingState(form);
            this.showNotification('資料已儲存', 'success');
            
            // 關閉模態框
            const modal = form.closest('.modal');
            if (modal) {
                this.closeModal(modal.id);
            }
        }, 1000);
    }

    showLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '儲存中...';
        }
    }

    hideLoadingState(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '儲存';
        }
    }

    // 檔案處理
    setupFileHandlers() {
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                this.handleFileSelect(e.target);
            }
        });

        // 拖放功能
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('drop-zone')) {
                this.handleFileDrop(e);
            }
        });
    }

    handleFileSelect(input) {
        const files = Array.from(input.files);
        files.forEach(file => {
            this.processFile(file);
        });
    }

    handleFileDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => {
            this.processFile(file);
        });
    }

    processFile(file) {
        console.log('處理檔案:', file.name, file.type, file.size);
        
        // 檔案類型驗證
        if (file.type.startsWith('image/')) {
            this.processImage(file);
        } else if (file.type.startsWith('video/')) {
            this.processVideo(file);
        } else {
            this.showNotification('不支援的檔案類型', 'error');
        }
    }

    processImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // 創建圖片預覽
            this.createImagePreview(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    processVideo(file) {
        // 處理影片檔案
        this.createVideoPreview(file.name, URL.createObjectURL(file));
    }

    createImagePreview(name, src) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <img src="${src}" alt="${name}" style="max-width: 100px; max-height: 100px;">
            <p>${name}</p>
        `;
        
        // 添加到預覽區域
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.appendChild(preview);
        }
    }

    createVideoPreview(name, src) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <video src="${src}" controls style="max-width: 200px; max-height: 150px;"></video>
            <p>${name}</p>
        `;
        
        // 添加到預覽區域
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            previewContainer.appendChild(preview);
        }
    }

    // 通知系統
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

    // 創建新增表單
    createAddForm(type) {
        let formContent = '';
        
        switch (type) {
            case 'image':
                formContent = this.getImageForm();
                break;
            case 'video':
                formContent = this.getVideoForm();
                break;
            case 'food':
                formContent = this.getFoodForm();
                break;
            case 'subscription':
                formContent = this.getSubscriptionForm();
                break;
        }

        const modalId = `add-${type}-modal`;
        this.createModal(modalId, `新增${this.getTypeLabel(type)}`, formContent);
        this.showModal(modalId);
    }

    getTypeLabel(type) {
        const labels = {
            image: '圖片',
            video: '影片',
            food: '食品',
            subscription: '訂閱'
        };
        return labels[type] || type;
    }

    getImageForm() {
        return `
            <form class="app-form">
                <div class="form-group">
                    <label class="form-label">圖片檔案</label>
                    <input type="file" name="image" accept="image/*" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">圖片名稱</label>
                    <input type="text" name="name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">標籤</label>
                    <input type="text" name="tags" class="form-input" placeholder="用逗號分隔多個標籤">
                </div>
                <div class="form-group">
                    <label class="form-label">描述</label>
                    <textarea name="description" class="form-textarea"></textarea>
                </div>
                <div class="preview-container"></div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="componentManager.closeModal('add-image-modal')">取消</button>
                    <button type="submit" class="btn btn-primary">儲存</button>
                </div>
            </form>
        `;
    }

    getVideoForm() {
        return `
            <form class="app-form">
                <div class="form-group">
                    <label class="form-label">影片檔案</label>
                    <input type="file" name="video" accept="video/*" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">影片標題</label>
                    <input type="text" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">描述</label>
                    <textarea name="description" class="form-textarea"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">標籤</label>
                    <input type="text" name="tags" class="form-input" placeholder="用逗號分隔多個標籤">
                </div>
                <div class="preview-container"></div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="componentManager.closeModal('add-video-modal')">取消</button>
                    <button type="submit" class="btn btn-primary">儲存</button>
                </div>
            </form>
        `;
    }

    getFoodForm() {
        return `
            <form class="app-form">
                <div class="form-group">
                    <label class="form-label">食品名稱</label>
                    <input type="text" name="name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">品牌</label>
                    <input type="text" name="brand" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">價格</label>
                    <input type="number" name="price" class="form-input" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">到期日期</label>
                    <input type="date" name="expiry" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">數量</label>
                    <input type="number" name="quantity" class="form-input" min="1" value="1">
                </div>
                <div class="form-group">
                    <label class="form-label">備註</label>
                    <textarea name="notes" class="form-textarea"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="componentManager.closeModal('add-food-modal')">取消</button>
                    <button type="submit" class="btn btn-primary">儲存</button>
                </div>
            </form>
        `;
    }

    getSubscriptionForm() {
        return `
            <form class="app-form">
                <div class="form-group">
                    <label class="form-label">服務名稱</label>
                    <input type="text" name="name" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">網站網址</label>
                    <input type="url" name="url" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">月費</label>
                    <input type="number" name="price" class="form-input" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">下次付款日期</label>
                    <input type="date" name="nextPayment" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">備註</label>
                    <textarea name="notes" class="form-textarea"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="componentManager.closeModal('add-subscription-modal')">取消</button>
                    <button type="submit" class="btn btn-primary">儲存</button>
                </div>
            </form>
        `;
    }
}

// 初始化組件管理器
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager = new ComponentManager();
});