/**
 * 黄氏家族寻根平台 - 数据模块
 * 包含家族树、字辈诗、PPT 等数据
 * 
 * 使用命名空间封装，避免全局变量污染
 */

// 创建命名空间
window.HuangshiData = (function() {
    // 私有数据
    const familyTreeData = {
    id: 'ancestor',
    name: '黄姓始祖',
    title: '伯益',
    period: '上古时期',
    avatar: '👤',
    children: [
        {
            id: 'branch-1',
            name: '江夏黄氏',
            title: '黄香',
            period: '东汉',
            avatar: '📚',
            bio: '江夏黄氏代表人物，二十四孝之一',
            location: '湖北江夏',
            children: [
                {
                    id: 'gen-1-1',
                    name: '江夏支系',
                    title: '黄琼',
                    period: '东汉',
                    avatar: '🏛️',
                    bio: '东汉名臣，官至太尉',
                    location: '湖北江夏',
                    children: []
                },
                {
                    id: 'gen-1-2',
                    name: '江夏支系',
                    title: '黄琬',
                    period: '东汉末年',
                    avatar: '🎭',
                    bio: '东汉末年大臣',
                    location: '湖北江夏',
                    children: []
                }
            ]
        },
        {
            id: 'branch-2',
            name: '金华黄氏',
            title: '黄岸',
            period: '唐代',
            avatar: '📖',
            bio: '唐代进士，金华黄氏始祖',
            location: '浙江金华',
            children: [
                {
                    id: 'gen-2-1',
                    name: '金华支系',
                    title: '黄峭',
                    period: '五代十国',
                    avatar: '🌾',
                    bio: '五代名臣，创办义门',
                    location: '福建邵武',
                    children: [
                        {
                            id: 'gen-2-1-1',
                            name: '邵武黄氏',
                            title: '黄维',
                            period: '宋代',
                            avatar: '✍️',
                            bio: '宋代文人',
                            location: '福建邵武',
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'branch-3',
            name: '闽台黄氏',
            title: '黄敦',
            period: '唐代',
            avatar: '🏮',
            bio: '唐代入闽始祖',
            location: '福建',
            children: [
                {
                    id: 'gen-3-1',
                    name: '闽台支系',
                    title: '黄彦斌',
                    period: '明代',
                    avatar: '⚓',
                    bio: '明代航海家',
                    location: '福建泉州',
                    children: []
                }
            ]
        }
    ]
};

// 字辈数据
window.generationPoems = {
    jiangxia: {
        name: '江夏黄氏',
        poem: '文章华国诗礼传家忠孝为本仁义是先',
        characters: '文章华国诗礼传家忠孝为本仁义是先'
    },
    shicheng: {
        name: '石城黄氏',
        poem: '祖德流芳远宗功世泽长箕裘绵骏业俎豆永腾光',
        characters: '祖德流芳远宗功世泽长箕裘绵骏业俎豆永腾光'
    },
    mianyang: {
        name: '绵阳黄氏',
        poem: '朝廷文仕正世代永兴隆',
        characters: '朝廷文仕正世代永兴隆'
    },
    fujian: {
        name: '福建黄氏',
        poem: '敦厚垂型远诗书世泽长',
        characters: '敦厚垂型远诗书世泽长'
    }
};

// PPT 数据
window.pptSlides = [
    {
        title: '愿景使命',
        subtitle: '数字化传承黄氏家族文化，连接全球宗亲',
        content: '打造全球黄氏宗亲的数字化精神家园，让千年血脉在数字时代继续传承。通过现代科技手段，保护和弘扬黄氏家族的优秀传统文化。',
        icon: '🎯',
        color: '#8B4513',
        tags: ['文化传承', '数字化', '精神家园']
    },
    {
        title: '核心功能',
        subtitle: '六大模块全面服务宗亲',
        content: '族谱树 · 字辈计算器 · AI 助手 · 区块链存证 · 留言墙 · 项目展示',
        icon: '⚙️',
        color: '#C8933A',
        tags: ['族谱查询', '智能计算', 'AI 对话', '区块链']
    },
    {
        title: '技术架构',
        subtitle: '现代化、可扩展的技术栈',
        content: 'Node.js + Express 后端 · 原生 JavaScript 前端 · 阿里云百炼 AI · JWT 认证体系 · 速率限制保护',
        icon: '🏗️',
        color: '#c0392b',
        tags: ['Node.js', 'Express', 'AI', 'JWT']
    },
    {
        title: '数据安全',
        subtitle: '区块链存证，确保数据真实可信',
        content: '采用 SHA-256 哈希上链技术，确保族谱数据不可篡改、可溯源、永久保存。每一次修改都有迹可循，守护家族历史的真实性。',
        icon: '🔗',
        color: '#27ae60',
        tags: ['SHA-256', '不可篡改', '可溯源']
    },
    {
        title: '未来规划',
        subtitle: '持续迭代，打造更好的服务平台',
        content: '移动端 APP 开发 · 3D 族谱可视化 · AI 族谱智能修复 · 全球宗亲地图 · 线上线下活动联动',
        icon: '🚀',
        color: '#2980b9',
        tags: ['移动端', '3D 可视化', 'AI 修复', '全球地图']
    }
];

    // 区块链存证记录
    const bcRecords = [
        { id: 'MBR-2024-001', name: '黄香', hash: '0x7a8f9c3e2d1b5a4c6e8f0a2b4d6e8f0a2b4d6e8f', verified: true },
        { id: 'MBR-2024-002', name: '黄峭', hash: '0x3b5d7f9a1c3e5g7i9k1m3o5q7s9u1w3y5a7c9e1g', verified: true },
        { id: 'MBR-2024-003', name: '黄岸', hash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d', verified: true }
    ];

    // 留言数据
    const guestMessages = [
        { id: 1, name: '黄志强', content: '寻找湖南宁乡黄氏宗亲，字辈为"光明正大"，望联系。', time: '2 小时前', location: '湖南长沙' },
        { id: 2, name: '黄文华', content: '感谢平台让我们这些海外游子能够了解家族历史！', time: '5 小时前', location: '美国旧金山' },
        { id: 3, name: '匿名宗亲', content: '福建邵武黄氏后裔，希望能找到同支系的宗亲。', time: '1 天前', location: '台湾台北' }
    ];

    // 公开 API
    return {
        familyTreeData,
        generationPoems,
        pptSlides,
        bcRecords,
        guestMessages,
        // 版本信息
        version: '3.2.0'
    };
})();

// 兼容性支持：同时暴露到全局（供旧代码使用）
window.familyTreeData = window.HuangshiData.familyTreeData;
window.generationPoems = window.HuangshiData.generationPoems;
window.pptSlides = window.HuangshiData.pptSlides;
window.bcRecords = window.HuangshiData.bcRecords;
window.guestMessages = window.HuangshiData.guestMessages;
