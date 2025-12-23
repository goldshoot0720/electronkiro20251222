// 修復彈跳窗口無故消失的問題
// 問題分析：彈跳窗口可能因為事件冒泡或重複綁定事件而意外關閉

console.log('🔧 開始修復彈跳窗口消失問題...');

// 1. 檢查現有的模態框實現
function analyzeModalIssues() {
    console.log('📊 分析模態框問題...');
    
    // 檢查是否有重複的事件監聽器
    const modals = document.querySelectorAll('.modal');
    console.log('當前模態框數量:', modals.length);
    
    modals.forEach((modal, index) => {
        console.log(`模態框 ${index + 1}:`, {
            id: modal.id,
            display: window.getComputedStyle(modal).display,
            zIndex: window.getComputedStyle(modal).zIndex,
            hasClickListener: modal.onclick !== null
        });
    });
}

// 2. 修復模態框的 showModal 方法
function fixShowModal() {
    if (window.app && typeof window.app.showModal === 'function') {
        console.log('🔧 修復 showModal 方法...');
        
        // 備份原始方法
        const originalShowModal = window.app.showModal.bind(window.app);
        
        // 重寫 showModal 方法
        window.app.showModal = function(id, title, content) {
            console.log('🔄 顯示模態框:', id);
            
            // 移除現有的模態框
            const existingModal = document.getElementById(id);
            if (existingModal) {
                console.log('移除現有模態框:', id);
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
                console.log('✅ 模態框已顯示:', id);
            }, 10);

            // 修復點擊背景關閉的邏輯
            modal.addEventListener('click', (e) => {
                // 只有點擊模態框背景（不是內容區域）才關閉
                if (e.target === modal) {
                    console.log('🖱️ 點擊背景關閉模態框:', id);
                    this.closeModal(id);
                }
            });
            
            // 阻止模態框內容區域的點擊事件冒泡
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
            
            // 添加 ESC 鍵關閉功能
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    console.log('⌨️ ESC 鍵關閉模態框:', id);
                    this.closeModal(id);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // 儲存 ESC 處理器以便清理
            modal._escHandler = escHandler;
        };
        
        console.log('✅ showModal 方法已修復');
    }
}

// 3. 修復 closeModal 方法
function fixCloseModal() {
    if (window.app && typeof window.app.closeModal === 'function') {
        console.log('🔧 修復 closeModal 方法...');
        
        // 重寫 closeModal 方法
        window.app.closeModal = function(id) {
            console.log('🔄 關閉模態框:', id);
            
            const modal = document.getElementById(id);
            if (modal) {
                // 清理 ESC 事件監聽器
                if (modal._escHandler) {
                    document.removeEventListener('keydown', modal._escHandler);
                }
                
                modal.classList.remove('show');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                        console.log('✅ 模態框已移除:', id);
                    }
                }, 300);
            } else {
                console.warn('⚠️ 找不到要關閉的模態框:', id);
            }
        };
        
        console.log('✅ closeModal 方法已修復');
    }
}

// 4. 修復表單提交事件
function fixFormSubmission() {
    console.log('🔧 修復表單提交事件...');
    
    // 修復食品表單提交
    if (window.app && typeof window.app.showFoodForm === 'function') {
        const originalShowFoodForm = window.app.showFoodForm.bind(window.app);
        
        window.app.showFoodForm = function(foodId = null) {
            console.log('🔄 顯示食品表單:', foodId ? '編輯' : '新增');
            
            // 調用原始方法
            originalShowFoodForm(foodId);
            
            // 延遲綁定表單事件，確保 DOM 已創建
            setTimeout(() => {
                const form = document.getElementById('food-form');
                if (form) {
                    // 移除現有的事件監聽器
                    const newForm = form.cloneNode(true);
                    form.parentNode.replaceChild(newForm, form);
                    
                    // 重新綁定事件
                    newForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📝 食品表單提交');
                        this.saveFoodForm(e, foodId);
                    });
                    
                    console.log('✅ 食品表單事件已重新綁定');
                }
            }, 100);
        };
    }
    
    // 修復訂閱表單提交
    if (window.app && typeof window.app.showSubscriptionForm === 'function') {
        const originalShowSubscriptionForm = window.app.showSubscriptionForm.bind(window.app);
        
        window.app.showSubscriptionForm = function(subscriptionId = null) {
            console.log('🔄 顯示訂閱表單:', subscriptionId ? '編輯' : '新增');
            
            // 調用原始方法
            originalShowSubscriptionForm(subscriptionId);
            
            // 延遲綁定表單事件，確保 DOM 已創建
            setTimeout(() => {
                const form = document.getElementById('subscription-form');
                if (form) {
                    // 移除現有的事件監聽器
                    const newForm = form.cloneNode(true);
                    form.parentNode.replaceChild(newForm, form);
                    
                    // 重新綁定事件
                    newForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📝 訂閱表單提交');
                        this.saveSubscriptionForm(e, subscriptionId);
                    });
                    
                    console.log('✅ 訂閱表單事件已重新綁定');
                }
            }, 100);
        };
    }
}

// 5. 添加全域錯誤處理
function addGlobalErrorHandling() {
    console.log('🔧 添加全域錯誤處理...');
    
    // 捕獲未處理的錯誤
    window.addEventListener('error', (e) => {
        console.error('🚨 全域錯誤:', e.error);
        if (e.error && e.error.message && e.error.message.includes('modal')) {
            console.error('模態框相關錯誤:', e.error);
        }
    });
    
    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (e) => {
        console.error('🚨 未處理的 Promise 拒絕:', e.reason);
    });
}

// 6. 添加調試工具
function addDebugTools() {
    console.log('🔧 添加調試工具...');
    
    // 添加全域調試函數
    window.debugModal = {
        listModals: () => {
            const modals = document.querySelectorAll('.modal');
            console.log('當前模態框:', Array.from(modals).map(m => ({
                id: m.id,
                visible: m.classList.contains('show'),
                display: window.getComputedStyle(m).display
            })));
        },
        
        closeAllModals: () => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (window.app && window.app.closeModal) {
                    window.app.closeModal(modal.id);
                } else {
                    modal.remove();
                }
            });
            console.log('已關閉所有模態框');
        },
        
        testModal: () => {
            if (window.app && window.app.showModal) {
                window.app.showModal('test-modal', '測試模態框', '<p>這是一個測試模態框</p>');
                console.log('測試模態框已顯示');
            }
        }
    };
    
    console.log('✅ 調試工具已添加 (使用 debugModal.* 方法)');
}

// 7. 主修復函數
function applyFixes() {
    console.log('🚀 開始應用修復...');
    
    try {
        analyzeModalIssues();
        fixShowModal();
        fixCloseModal();
        fixFormSubmission();
        addGlobalErrorHandling();
        addDebugTools();
        
        console.log('✅ 所有修復已應用完成');
        console.log('💡 如果問題仍然存在，請使用 debugModal.listModals() 檢查模態框狀態');
        
    } catch (error) {
        console.error('❌ 應用修復時發生錯誤:', error);
    }
}

// 等待應用程式載入完成後應用修復
if (window.app) {
    applyFixes();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyFixes, 1000); // 延遲 1 秒確保應用程式完全載入
    });
}

// 導出修復函數供手動調用
window.fixModalIssues = applyFixes;

console.log('🔧 模態框修復腳本已載入');
console.log('💡 如需手動應用修復，請調用 fixModalIssues()');