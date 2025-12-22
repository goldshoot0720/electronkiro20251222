const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false, // 允許載入本地檔案
            allowRunningInsecureContent: true // 允許載入本地內容
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        show: false,
        titleBarStyle: 'default'
    });

    mainWindow.loadFile('src/index.html');

    // 開發模式下開啟開發者工具
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('🚀 鋒兄AI資訊系統已啟動');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 設置應用程式選單
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: '檔案',
            submenu: [
                {
                    label: '新增',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new');
                    }
                },
                {
                    label: '開啟',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-open');
                    }
                },
                { type: 'separator' },
                {
                    label: '重新載入',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: '強制重新載入',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '檢視',
            submenu: [
                { role: 'reload', label: '重新載入' },
                { role: 'forceReload', label: '強制重新載入' },
                { role: 'toggleDevTools', label: '開發者工具' },
                { type: 'separator' },
                { role: 'resetZoom', label: '重設縮放' },
                { role: 'zoomIn', label: '放大' },
                { role: 'zoomOut', label: '縮小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全螢幕' }
            ]
        },
        {
            label: '功能',
            submenu: [
                {
                    label: '圖片庫',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'images');
                    }
                },
                {
                    label: '影片庫',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'videos');
                    }
                },
                {
                    label: '音樂庫',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'music');
                    }
                },
                { type: 'separator' },
                {
                    label: '食品管理',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'food');
                    }
                },
                {
                    label: '訂閱管理',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'subscriptions');
                    }
                },
                { type: 'separator' },
                {
                    label: '系統儀表板',
                    click: () => {
                        mainWindow.webContents.send('navigate-to', 'templates');
                    }
                }
            ]
        },
        {
            label: '說明',
            submenu: [
                {
                    label: '關於鋒兄AI資訊系統',
                    click: () => {
                        mainWindow.webContents.send('show-about');
                    }
                },
                {
                    label: '使用說明',
                    click: () => {
                        mainWindow.webContents.send('show-help');
                    }
                },
                { type: 'separator' },
                {
                    label: '檢查更新',
                    click: () => {
                        mainWindow.webContents.send('check-updates');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();
    console.log('🎯 Electron 應用程式已準備就緒');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC 事件處理
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-info', () => {
    return {
        name: '鋒兄AI資訊系統',
        version: app.getVersion(),
        author: '鋒兄達哥',
        description: '智能管理您的數位生活',
        copyright: '© 2025-2125 版權所有'
    };
});

// 錯誤處理
process.on('uncaughtException', (error) => {
    console.error('未捕獲的異常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未處理的 Promise 拒絕:', reason);
});