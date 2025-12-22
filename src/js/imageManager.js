// 圖片管理模組
class ImageManager {
    constructor() {
        // 在 Electron 環境中使用 Node.js 模組
        if (typeof require !== 'undefined') {
            this.fs = require('fs');
            this.path = require('path');
            // 修正路徑：從應用程式根目錄開始
            this.imagesPath = this.path.join(process.cwd(), 'assets', 'images');
        } else {
            // 瀏覽器環境的備用路徑
            this.imagesPath = 'assets/images';
        }
        this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    }

    // 掃描圖片資料夾
    scanImages() {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }

            if (!this.fs.existsSync(this.imagesPath)) {
                this.fs.mkdirSync(this.imagesPath, { recursive: true });
                return [];
            }

            const files = this.fs.readdirSync(this.imagesPath);
            const images = [];

            files.forEach(file => {
                // 跳過 README.md 和其他非圖片檔案
                if (file === 'README.md' || file.startsWith('.')) {
                    return;
                }
                
                const ext = this.path.extname(file).toLowerCase();
                
                if (this.supportedFormats.includes(ext)) {
                    const filePath = this.path.join(this.imagesPath, file);
                    const stats = this.fs.statSync(filePath);
                    
                    images.push({
                        id: Date.now() + Math.random(),
                        name: file,
                        path: filePath,
                        relativePath: `file:///${process.cwd().replace(/\\/g, '/')}/assets/images/${encodeURIComponent(file)}`,
                        type: ext.substring(1).toUpperCase(),
                        size: this.formatFileSize(stats.size),
                        sizeBytes: stats.size,
                        format: ext.substring(1).toUpperCase(),
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    });
                }
            });

            return images.sort((a, b) => b.modifiedAt - a.modifiedAt);
        } catch (error) {
            console.error('掃描圖片時發生錯誤:', error);
            return [];
        }
    }

    // 格式化檔案大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // 新增圖片
    addImage(sourcePath, fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const destPath = this.path.join(this.imagesPath, fileName);
            this.fs.copyFileSync(sourcePath, destPath);
            return { success: true, message: '圖片已成功新增' };
        } catch (error) {
            console.error('新增圖片時發生錯誤:', error);
            return { success: false, message: '新增圖片失敗: ' + error.message };
        }
    }

    // 刪除圖片
    deleteImage(fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const filePath = this.path.join(this.imagesPath, fileName);
            if (this.fs.existsSync(filePath)) {
                this.fs.unlinkSync(filePath);
                return { success: true, message: '圖片已成功刪除' };
            }
            return { success: false, message: '找不到指定的圖片' };
        } catch (error) {
            console.error('刪除圖片時發生錯誤:', error);
            return { success: false, message: '刪除圖片失敗: ' + error.message };
        }
    }

    // 取得圖片資訊
    getImageInfo(fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const filePath = this.path.join(this.imagesPath, fileName);
            if (this.fs.existsSync(filePath)) {
                const stats = this.fs.statSync(filePath);
                const ext = this.path.extname(fileName).toLowerCase();
                
                return {
                    name: fileName,
                    path: filePath,
                    type: ext.substring(1).toUpperCase(),
                    size: this.formatFileSize(stats.size),
                    sizeBytes: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                };
            }
            return null;
        } catch (error) {
            console.error('取得圖片資訊時發生錯誤:', error);
            return null;
        }
    }

    // 搜尋圖片
    searchImages(query) {
        const allImages = this.scanImages();
        if (!query) return allImages;
        
        const lowerQuery = query.toLowerCase();
        return allImages.filter(image => 
            image.name.toLowerCase().includes(lowerQuery)
        );
    }

    // 依類型篩選
    filterByType(type) {
        const allImages = this.scanImages();
        if (!type || type === '所有類型') return allImages;
        
        return allImages.filter(image => 
            image.type.toLowerCase() === type.toLowerCase()
        );
    }

    // 排序圖片
    sortImages(images, sortBy) {
        const sorted = [...images];
        
        switch (sortBy) {
            case '按名稱排序':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case '按日期排序':
                return sorted.sort((a, b) => b.modifiedAt - a.modifiedAt);
            case '按大小排序':
                return sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);
            default:
                return sorted;
        }
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageManager;
}