// 影片管理模組
class VideoManager {
    constructor() {
        // 在 Electron 環境中使用 Node.js 模組
        if (typeof require !== 'undefined') {
            this.fs = require('fs');
            this.path = require('path');
            // 修正路徑：從應用程式根目錄開始
            this.videosPath = this.path.join(process.cwd(), 'assets', 'videos');
        } else {
            // 瀏覽器環境的備用路徑
            this.videosPath = 'assets/videos';
        }
        this.supportedFormats = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];
    }

    // 掃描影片資料夾
    scanVideos() {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }

            if (!this.fs.existsSync(this.videosPath)) {
                this.fs.mkdirSync(this.videosPath, { recursive: true });
                return [];
            }

            const files = this.fs.readdirSync(this.videosPath);
            const videos = [];

            files.forEach(file => {
                // 跳過 README.md 和其他非影片檔案
                if (file === 'README.md' || file.startsWith('.')) {
                    return;
                }
                
                const ext = this.path.extname(file).toLowerCase();
                
                if (this.supportedFormats.includes(ext)) {
                    const filePath = this.path.join(this.videosPath, file);
                    const stats = this.fs.statSync(filePath);
                    
                    // 根據檔案名稱推測影片標題
                    let title = this.getVideoTitle(file);
                    let description = this.getVideoDescription(file);
                    
                    videos.push({
                        id: Date.now() + Math.random(),
                        name: file,
                        title: title,
                        description: description,
                        path: filePath,
                        relativePath: `file:///${process.cwd().replace(/\\/g, '/')}/assets/videos/${encodeURIComponent(file)}`,
                        type: ext.substring(1).toUpperCase(),
                        size: this.formatFileSize(stats.size),
                        sizeBytes: stats.size,
                        format: ext.substring(1).toUpperCase(),
                        duration: '未知', // 實際應用中可以使用 ffprobe 獲取
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    });
                }
            });

            return videos.sort((a, b) => b.modifiedAt - a.modifiedAt);
        } catch (error) {
            console.error('掃描影片時發生錯誤:', error);
            return [];
        }
    }

    // 根據檔案名稱推測影片標題
    getVideoTitle(fileName) {
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // 特定影片的標題映射
        const titleMap = {
            '19700121-1829-693fee512bec81918cbfd484c6a5ba8f-enx4rss0_SnR5lDG3': '鋒兄的傳奇人生',
            'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc': '鋒兄進化Show🔥'
        };

        // 檢查是否有預設標題
        for (const [key, title] of Object.entries(titleMap)) {
            if (nameWithoutExt.includes(key) || key.includes(nameWithoutExt)) {
                return title;
            }
        }

        // 如果沒有預設標題，嘗試清理檔案名稱
        return this.cleanFileName(nameWithoutExt);
    }

    // 根據檔案名稱推測影片描述
    getVideoDescription(fileName) {
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        
        // 特定影片的描述映射
        const descriptionMap = {
            '19700121-1829-693fee512bec81918cbfd484c6a5ba8f-enx4rss0_SnR5lDG3': '鋒兄人生歷程介紹',
            'clideo-editor-92eb6755d77b4603a482c25764865a58_7sLjgTgc': '鋒兄進化節目精彩內容'
        };

        // 檢查是否有預設描述
        for (const [key, description] of Object.entries(descriptionMap)) {
            if (nameWithoutExt.includes(key) || key.includes(nameWithoutExt)) {
                return description;
            }
        }

        return '鋒兄精彩影片內容';
    }

    // 清理檔案名稱
    cleanFileName(fileName) {
        return fileName
            .replace(/[-_]/g, ' ')
            .replace(/\d{8}-\d{4}-[a-f0-9]{32}-\w+/g, '') // 移除長ID
            .replace(/clideo-editor-[a-f0-9]{32}_\w+/g, '') // 移除編輯器ID
            .replace(/\s+/g, ' ')
            .trim() || '未命名影片';
    }

    // 格式化檔案大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // 新增影片
    addVideo(sourcePath, fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const destPath = this.path.join(this.videosPath, fileName);
            this.fs.copyFileSync(sourcePath, destPath);
            return { success: true, message: '影片已成功新增' };
        } catch (error) {
            console.error('新增影片時發生錯誤:', error);
            return { success: false, message: '新增影片失敗: ' + error.message };
        }
    }

    // 刪除影片
    deleteVideo(fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const filePath = this.path.join(this.videosPath, fileName);
            if (this.fs.existsSync(filePath)) {
                this.fs.unlinkSync(filePath);
                return { success: true, message: '影片已成功刪除' };
            }
            return { success: false, message: '找不到指定的影片' };
        } catch (error) {
            console.error('刪除影片時發生錯誤:', error);
            return { success: false, message: '刪除影片失敗: ' + error.message };
        }
    }

    // 取得影片資訊
    getVideoInfo(fileName) {
        try {
            if (!this.fs || !this.path) {
                throw new Error('此功能需要在 Electron 環境中運行');
            }
            const filePath = this.path.join(this.videosPath, fileName);
            if (this.fs.existsSync(filePath)) {
                const stats = this.fs.statSync(filePath);
                const ext = this.path.extname(fileName).toLowerCase();
                
                return {
                    name: fileName,
                    title: this.getVideoTitle(fileName),
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
            console.error('取得影片資訊時發生錯誤:', error);
            return null;
        }
    }

    // 搜尋影片
    searchVideos(query) {
        const allVideos = this.scanVideos();
        if (!query) return allVideos;
        
        const lowerQuery = query.toLowerCase();
        return allVideos.filter(video => 
            video.title.toLowerCase().includes(lowerQuery) ||
            video.name.toLowerCase().includes(lowerQuery) ||
            video.description.toLowerCase().includes(lowerQuery)
        );
    }

    // 依類型篩選
    filterByType(type) {
        const allVideos = this.scanVideos();
        if (!type || type === '所有類型') return allVideos;
        
        return allVideos.filter(video => 
            video.type.toLowerCase() === type.toLowerCase()
        );
    }

    // 排序影片
    sortVideos(videos, sortBy) {
        const sorted = [...videos];
        
        switch (sortBy) {
            case '按名稱排序':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
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
    module.exports = VideoManager;
}