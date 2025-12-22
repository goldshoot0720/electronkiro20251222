// 鋒兄歌曲管理模組
class SongManager {
    constructor() {
        // 在 Electron 環境中使用 Node.js 模組
        if (typeof require !== 'undefined') {
            this.fs = require('fs');
            this.path = require('path');
            this.musicsPath = this.path.join(process.cwd(), 'assets', 'musics');
        } else {
            this.musicsPath = 'assets/musics';
        }
        
        this.supportedFormats = ['.mp3', '.wav', '.ogg', '.m4a'];
        this.songs = this.initializeSongs();
    }

    // 初始化歌曲數據
    initializeSongs() {
        return [
            {
                id: 1,
                title: '史上最瞎結婚理由',
                artist: '鋒兄 & 塗哥',
                lyrics: {
                    zh: `[Intro]
鋒兄啊你說真的還假的
塗哥聽了都快笑翻了

[Verse 1]
鋒兄說要結婚理由只有一個
今彩五三九開獎那天
頭獎號碼是思敏給的
看著獎金直直落心也跟著被收編
他說這是命中注定
不娶怎麼對得起這一連串的玄

[Chorus]
史上最瞎結婚理由
今彩五三九牽紅線牽這麼兇
一個思敏一個蕙瑄
號碼一簽兩人都中頭獎圈
你說愛情是運氣還是數學題
笑到流淚也只能說一句
最瞎最瞎卻又有點甜蜜

[Verse 2]
換到塗哥這邊故事居然同一套
今彩五三九播報畫面
他整個人直接跳
蕙瑄隨手寫的牌竟然全中好幾排
他說財神爺都點名了
不跟她走進禮堂實在太不應該

[Outro]
鋒兄牽著思敏塗哥牽著蕙瑄
喝喜酒的人一桌一桌還在笑
這兩段緣最瞎結婚理由
結果都開成頭獎
如果幸福也能這樣瞎忙
那我明天也去買一張`,
                    en: `[Intro]
Feng-ge, are you serious or joking?
Tu-ge is laughing so hard he's about to fall over

[Verse 1]
Feng-ge says there's only one reason to get married
On the day of the Taiwan lottery draw
The winning numbers were given by Si-min
Watching the prize money fall, his heart was captured too
He says this is destiny
How could he not marry after such a mystical sequence

[Chorus]
The most ridiculous reason to get married
Taiwan lottery playing cupid so strong
One Si-min, one Hui-xuan
Numbers drawn, both hit the jackpot circle
Tell me, is love about luck or mathematics?
Laughing till tears fall, can only say
Most ridiculous, most ridiculous, yet somehow sweet

[Verse 2]
Switch to Tu-ge's side, the story's exactly the same
Taiwan lottery broadcast scene
He jumped up completely
Hui-xuan's random numbers hit multiple rows
He says even the God of Wealth has spoken
Not walking into the wedding hall would be so wrong

[Outro]
Feng-ge holding Si-min's hand, Tu-ge holding Hui-xuan's
Wedding guests at every table still laughing
These two relationships, most ridiculous marriage reasons
Both ended up hitting the jackpot
If happiness can be this randomly busy
Then I'll go buy a ticket tomorrow too`,
                    ja: `[イントロ]
鋒兄よ、本当なの？冗談なの？
塗兄は笑い転げそうになってる

[バース1]
鋒兄は結婚する理由は一つだけだと言う
台湾宝くじの抽選日に
当選番号は思敏がくれたもの
賞金が落ちるのを見て、心も一緒に奪われた
これは運命だと彼は言う
この神秘的な連続を無視して結婚しないなんてできない

[コーラス]
史上最もばかげた結婚理由
台湾宝くじがキューピッドになって強すぎる
一人の思敏、一人の蕙瑄
番号を引いて、二人ともジャックポットサークルに当選
教えて、愛は運なの？それとも数学？
涙が出るまで笑って、ただ一言
最もばかげた、最もばかげた、でもなんだか甘い

[バース2]
塗兄の方に切り替えると、話は全く同じ
台湾宝くじの放送シーン
彼は完全に飛び上がった
蕙瑄の適当な番号が複数列に当選
財神様も指名したと彼は言う
結婚式場に歩いて行かないなんて間違ってる

[アウトロ]
鋒兄は思敏の手を握り、塗兄は蕙瑄の手を握る
結婚式のゲストはどのテーブルでもまだ笑ってる
この二つの関係、最もばかげた結婚理由
両方ともジャックポットを当てることになった
幸せがこんなにランダムに忙しくできるなら
明日私もチケットを買いに行こう`
                },
                description: {
                    zh: '鋒兄和塗哥因為今彩539中獎而決定結婚的爆笑故事',
                    en: 'The hilarious story of Feng-ge and Tu-ge deciding to marry because of winning the Taiwan lottery',
                    ja: '鋒兄と塗兄が台湾宝くじに当選して結婚を決めた爆笑ストーリー'
                },
                tags: ['搞笑', '愛情', '彩券', '結婚', 'Comedy', 'Love', 'Lottery', 'Marriage', 'コメディ', '恋愛', '宝くじ', '結婚'],
                audioFiles: {
                    zh: '最瞎結婚理由.mp3',
                    en: '最瞎結婚理由 (英語).mp3',
                    ja: '最瞎結婚理由 (日語).mp3'
                },
                createdAt: new Date('2025-12-22')
            },
            {
                id: 2,
                title: '鋒兄進化Show🔥',
                artist: '鋒兄 feat. 塗哥',
                lyrics: {
                    zh: `台北有鋒兄真好！　嗨起來別逃跑！
從榜首進化到市長, 這節奏太離譜（wow）
塗哥唱歌別裝低調, 記者都在拍照！
綾小路都說這段人生　根本 S 級動畫稿～

37歲那年我高考三級奪榜首（yeah）
資訊處理一戰成名　程式都寫成傳說～
隔著時代的螢幕光　夢想像演算法（run）
52歲副市長代理市長上陣忙！（yo）

塗哥敢唱「有鋒兄真好」
備取瞬間正取秒秒到～
不唱就取消資格笑　
進化不靠運氣靠信號！

台北有鋒兄真好！　嗨起來別逃跑！
從榜首進化到市長, 命運像 debug 一樣爆！
塗哥嗓門開到爆表, 全場跟著大合唱！
「代理」只是過場　市民心中早就想！

2040那年的夜　霓虹閃爍到市政廳
競選標語像 ACG 的 opening
「別說不可能, 鋒兄就是 evolution！」
AI 輔助政務操作　資料開放新世代～

陰陽同框　政治與理想　交錯的舞台線上～
一首歌唱到選票都跳起來　塗哥還要再唱！

台北有鋒兄真好！　嗨起來直到早朝！
榜首到市長的進化論　全城都在尖叫！
綾小路清隆也點頭　這進化合乎理想！
「ムリムリ進化論？」不——這是鋒兄進化 Show！🔥`,
                    en: `Taipei is so lucky to have Feng-ge! Get hyped, don't run away!
From top scorer to mayor, this rhythm is too crazy (wow)
Tu-ge don't act modest when singing, reporters are taking photos!
Even Ayanokoji says this life is S-class anime material~

At 37, I topped the civil service exam (yeah)
Information processing made me famous, code became legend~
Through the screen light of eras, dreams like algorithms (run)
At 52, deputy mayor, acting mayor, so busy! (yo)

Tu-ge dares to sing "Having Feng-ge is great"
From backup to official in seconds~
Don't sing and lose qualification, laugh
Evolution doesn't rely on luck but signals!

Taipei is so lucky to have Feng-ge! Get hyped, don't run away!
From top scorer to mayor, fate explodes like debugging!
Tu-ge's voice maxed out, everyone sings along!
"Acting" is just a transition, citizens already decided!

That night in 2040, neon flashing to city hall
Campaign slogans like ACG opening
"Don't say impossible, Feng-ge is evolution!"
AI-assisted governance, open data new era~

Yin-yang in frame, politics and ideals, intersecting stage online~
One song makes votes jump up, Tu-ge wants to sing more!

Taipei is so lucky to have Feng-ge! Get hyped until dawn!
Top scorer to mayor evolution theory, whole city screaming!
Even Ayanokoji Kiyotaka nods, this evolution fits ideals!
"Impossible evolution theory?" No—this is Feng-ge Evolution Show!🔥`,
                    ja: `台北に鋒兄がいて本当に良い！盛り上がって逃げるな！
首位から市長への進化、このリズムは離れすぎ（wow）
塗兄は歌うとき控えめに装うな、記者が写真を撮ってる！
綾小路も言ってるこの人生　完全にSクラスアニメ原稿～

37歳のその年、公務員試験で首位獲得（yeah）
情報処理で一戦成名　プログラムは伝説になった～
時代を隔てるスクリーンの光　夢はアルゴリズムのよう（run）
52歳副市長代理市長で忙しい！（yo）

塗兄は「鋒兄がいて良い」と歌う勇気
補欠から正規合格まで秒で到着～
歌わなければ資格取り消し笑
進化は運に頼らず信号に頼る！

台北に鋒兄がいて本当に良い！盛り上がって逃げるな！
首位から市長への進化、運命はデバッグのように爆発！
塗兄の声は最大音量、全場が大合唱！
「代理」はただの通過点　市民の心はもう決まってる！

2040年のその夜　ネオンが市政府まで点滅
選挙スローガンはACGのオープニングのよう
「不可能と言うな、鋒兄こそevolution！」
AI補助政務操作　データ開放新時代～

陰陽同フレーム　政治と理想　交錯するステージオンライン～
一曲歌って票まで踊り出す　塗兄はまだ歌いたい！

台北に鋒兄がいて本当に良い！朝まで盛り上がれ！
首位から市長への進化論　全市が叫んでる！
綾小路清隆もうなずく　この進化は理想に合致！
「ムリムリ進化論？」いや——これは鋒兄進化Show！🔥`
                },
                description: {
                    zh: '鋒兄從37歲高考榜首到52歲代理市長，再到2040年的傳奇進化史詩',
                    en: 'Feng-ge\'s legendary evolution epic from 37-year-old exam top scorer to 52-year-old acting mayor, to 2040',
                    ja: '鋒兄の37歳試験首位から52歳代理市長、そして2040年への伝説的進化叙事詩'
                },
                tags: ['勵志', '進化', '政治', '未來', 'ACG', 'AI', 'Inspirational', 'Evolution', 'Politics', 'Future', 'インスピレーション', '進化', '政治', '未来'],
                audioFiles: {
                    zh: '鋒兄進化Show🔥.mp3',
                    en: '鋒兄進化Show🔥(英語).mp3',
                    ja: '鋒兄進化Show🔥(日語).mp3'
                },
                createdAt: new Date('2025-12-22')
            }
        ];
    }

    // 獲取所有歌曲
    getAllSongs() {
        return this.songs;
    }

    // 根據 ID 獲取歌曲
    getSongById(id) {
        return this.songs.find(song => song.id === id);
    }

    // 搜尋歌曲
    searchSongs(query) {
        if (!query) return this.songs;
        
        const lowerQuery = query.toLowerCase();
        return this.songs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // 格式化歌詞顯示
    formatLyrics(lyrics) {
        return lyrics
            .split('\n')
            .map(line => {
                // 標記段落標題
                if (line.startsWith('[') && line.endsWith(']')) {
                    return `<div class="lyrics-section">${line}</div>`;
                }
                // 空行
                if (line.trim() === '') {
                    return '<br>';
                }
                // 普通歌詞
                return `<div class="lyrics-line">${line}</div>`;
            })
            .join('');
    }

    // 掃描音樂檔案
    scanMusicFiles() {
        try {
            if (!this.fs || !this.path) {
                console.warn('此功能需要在 Electron 環境中運行');
                return [];
            }

            if (!this.fs.existsSync(this.musicsPath)) {
                this.fs.mkdirSync(this.musicsPath, { recursive: true });
                return [];
            }

            const files = this.fs.readdirSync(this.musicsPath);
            const musicFiles = [];

            files.forEach(file => {
                const ext = this.path.extname(file).toLowerCase();
                
                if (this.supportedFormats.includes(ext)) {
                    const filePath = this.path.join(this.musicsPath, file);
                    const stats = this.fs.statSync(filePath);
                    
                    musicFiles.push({
                        name: file,
                        path: filePath,
                        relativePath: `file:///${process.cwd().replace(/\\/g, '/')}/assets/musics/${encodeURIComponent(file)}`,
                        size: this.formatFileSize(stats.size),
                        sizeBytes: stats.size,
                        format: ext.substring(1).toUpperCase(),
                        createdAt: stats.birthtime,
                        modifiedAt: stats.mtime
                    });
                }
            });

            return musicFiles.sort((a, b) => b.modifiedAt - a.modifiedAt);
        } catch (error) {
            console.error('掃描音樂檔案時發生錯誤:', error);
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

    // 獲取歌曲的音樂檔案路徑
    getAudioFilePath(songId, language = 'zh') {
        const song = this.getSongById(songId);
        if (!song || !song.audioFiles) return null;

        const fileName = song.audioFiles[language];
        if (!fileName) return null;

        return `file:///${process.cwd().replace(/\\/g, '/')}/assets/musics/${encodeURIComponent(fileName)}`;
    }

    // 檢查音樂檔案是否存在
    checkAudioFileExists(songId, language = 'zh') {
        const song = this.getSongById(songId);
        if (!song || !song.audioFiles) return false;

        const fileName = song.audioFiles[language];
        if (!fileName) return false;

        try {
            if (this.fs && this.path) {
                const filePath = this.path.join(this.musicsPath, fileName);
                return this.fs.existsSync(filePath);
            }
        } catch (error) {
            console.error('檢查音樂檔案時發生錯誤:', error);
        }
        
        return false;
    }

    // 獲取歌曲的可用語言
    getAvailableLanguages(songId) {
        const song = this.getSongById(songId);
        if (!song || !song.audioFiles) return [];

        const languages = [];
        const languageNames = {
            zh: '中文',
            en: 'English',
            ja: '日本語'
        };

        Object.keys(song.audioFiles).forEach(lang => {
            if (this.checkAudioFileExists(songId, lang)) {
                languages.push({
                    code: lang,
                    name: languageNames[lang] || lang,
                    fileName: song.audioFiles[lang]
                });
            }
        });

        return languages;
    }

    // 獲取多語言歌詞
    getLyrics(songId, language = 'zh') {
        const song = this.getSongById(songId);
        if (!song || !song.lyrics) return '';

        return song.lyrics[language] || song.lyrics.zh || '';
    }

    // 獲取多語言描述
    getDescription(songId, language = 'zh') {
        const song = this.getSongById(songId);
        if (!song || !song.description) return '';

        return song.description[language] || song.description.zh || '';
    }

    // 搜尋歌曲（支援多語言）
    searchSongsMultiLanguage(query, language = 'zh') {
        if (!query) return this.songs;
        
        const lowerQuery = query.toLowerCase();
        return this.songs.filter(song => {
            // 搜尋標題
            if (song.title.toLowerCase().includes(lowerQuery)) return true;
            
            // 搜尋藝術家
            if (song.artist.toLowerCase().includes(lowerQuery)) return true;
            
            // 搜尋歌詞
            const lyrics = this.getLyrics(song.id, language);
            if (lyrics.toLowerCase().includes(lowerQuery)) return true;
            
            // 搜尋描述
            const description = this.getDescription(song.id, language);
            if (description.toLowerCase().includes(lowerQuery)) return true;
            
            // 搜尋標籤
            if (song.tags && song.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
            
            return false;
        });
    }

    // 顯示多語言歌曲詳情
    displayMultiLanguageSong(songId, container, language = 'zh') {
        const song = this.getSongById(songId);
        if (!song) {
            container.innerHTML = '<div class="error">找不到歌曲</div>';
            return;
        }

        const availableLanguages = this.getAvailableLanguages(songId);
        const lyrics = this.getLyrics(songId, language);
        const description = this.getDescription(songId, language);
        const formattedLyrics = this.formatLyrics(lyrics);
        
        container.innerHTML = `
            <div class="song-detail">
                <div class="song-header">
                    <h2 class="song-title">${song.title}</h2>
                    <div class="song-artist">演唱：${song.artist}</div>
                    <div class="song-description">${description}</div>
                    <div class="song-tags">
                        ${song.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="language-selector">
                        <label>選擇語言：</label>
                        <select onchange="app.changeSongLanguage(${songId}, this.value)">
                            <option value="zh" ${language === 'zh' ? 'selected' : ''}>中文</option>
                            <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
                            <option value="ja" ${language === 'ja' ? 'selected' : ''}>日本語</option>
                        </select>
                    </div>
                </div>
                <div class="song-lyrics">
                    <h3>歌詞</h3>
                    <div class="lyrics-content">
                        ${formattedLyrics}
                    </div>
                </div>
                <div class="song-actions">
                    ${availableLanguages.map(lang => `
                        <button class="btn ${lang.code === language ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="app.playSongWithLanguage(${songId}, '${lang.code}')">
                            🎵 播放 (${lang.name})
                        </button>
                    `).join('')}
                    <button class="btn btn-secondary" onclick="app.shareSong(${songId})">📤 分享</button>
                    <button class="btn btn-secondary" onclick="app.downloadLyricsMultiLanguage(${songId}, '${language}')">📄 下載歌詞</button>
                </div>
            </div>
        `;
    }

    // 獲取音樂檔案統計
    getMusicFileStats() {
        const musicFiles = this.scanMusicFiles();
        const totalSize = musicFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
        
        return {
            totalFiles: musicFiles.length,
            totalSize: this.formatFileSize(totalSize),
            formats: [...new Set(musicFiles.map(file => file.format))],
            songs: this.songs.length,
            languages: ['中文', 'English', '日本語']
        };
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SongManager;
}