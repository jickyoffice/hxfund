/**
 * 黄氏家族寻根平台 - 主脚本
 * hxfund.cn
 * 包含：族谱树、字辈计算器、PPT展示、数据库ERD、区块链存证、留言墙
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  数据层 (Data Layer)
    // ============================================================

    /** 族谱数据 - 递归树结构 */
    const familyTreeData = {
        id: 1,
        name: '伯益',
        info: '始祖',
        bio: '黄姓得姓始祖，原名伯益，为颛顼帝孙，因助大禹治水有功，舜帝赐姓嬴，封丘为黄。后裔以国为姓，是为黄姓。',
        location: '河南潢川（古黄国）',
        bc: 'TX-0x7f3a2c8e9b1d4f6a',
        children: [
            {
                id: 2,
                name: '大廉',
                info: '二世祖',
                bio: '伯益长子，继承父业，精于驯鸟，因功封地。其后裔绵延至今，形成江夏黄氏重要支系。',
                location: '河南',
                bc: 'TX-0x4a9c1e3b7d2f8a5c',
                children: [
                    {
                        id: 4,
                        name: '孟戏',
                        info: '三世',
                        bio: '大廉长子，承继家业，在河南一带繁衍后代。',
                        location: '河南',
                        bc: null,
                        children: []
                    },
                    {
                        id: 5,
                        name: '仲衍',
                        info: '三世',
                        bio: '大廉次子，商朝大夫，其后辗转迁徙，形成多个分支。',
                        location: '河南',
                        bc: 'TX-0x2b8f4e6c9a3d1e7b',
                        children: [
                            {
                                id: 7,
                                name: '黄元',
                                info: '四世',
                                bio: '仲衍之子，迁居江夏（今湖北武汉），为江夏黄氏之始。',
                                location: '湖北武汉',
                                bc: null,
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 3,
                name: '若木',
                info: '二世祖',
                bio: '伯益次子，受封于黄地，建立黄国，子孙以黄为姓，为黄姓主要来源。黄国故址在今河南省潢川县。',
                location: '河南潢川',
                bc: 'TX-0x5c2d7f8a1e4b9c3d',
                children: [
                    {
                        id: 6,
                        name: '惠连',
                        info: '三世',
                        bio: '若木之子，世居黄国，守护先祖基业。',
                        location: '河南潢川',
                        bc: null,
                        children: [
                            {
                                id: 8,
                                name: '黄宪',
                                info: '四世',
                                bio: '惠连之子，博学多才，被誉为"天下模楷"。',
                                location: '河南汝南',
                                bc: null,
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    };

    /** 字辈数据 - 各分支字辈诗 */
    const generationData = {
        jiangxia: {
            label: '江夏黄氏',
            desc: '源自湖北武汉江夏，历史最久、分布最广的黄氏支系',
            words: ['福', '禄', '寿', '喜', '光', '明', '正', '大', '通', '达', '兴', '隆', '盛', '昌', '德', '仁']
        },
        shicheng: {
            label: '石城黄氏',
            desc: '源自江西赣州石城，以文学艺术著称的黄氏支系',
            words: ['文', '章', '华', '国', '诗', '礼', '传', '家', '忠', '厚', '信', '义', '廉', '耻', '仁', '智']
        },
        mianyang: {
            label: '绵阳黄氏',
            desc: '源自四川绵阳，随湖广填四川迁入，世代守耕',
            words: ['万', '邦', '化', '育', '廷', '朝', '正', '学', '振', '兴', '中', '华', '家', '国', '昌', '盛']
        },
        fujian: {
            label: '福建黄氏',
            desc: '源自福建漳州、泉州，为台湾及东南亚黄氏主要祖籍',
            words: ['宗', '子', '守', '先', '业', '贻', '谋', '慎', '毋', '忘', '克', '绍', '祖', '德', '长', '昭']
        }
    };

    /** PPT 幻灯片数据 */
    const pptSlides = [
        {
            icon: '🌅',
            title: '项目愿景',
            subtitle: '构建数字化黄氏宗亲生态圈\n连接全球3200万黄氏族人\n守护4600年华夏文明传承',
            tags: ['数字家谱', '文化传承', '宗亲连接'],
            idx: 0
        },
        {
            icon: '⚙️',
            title: '技术架构',
            subtitle: 'SPA前端 + 关系型数据库 + 区块链存证\n三层防护体系确保数据安全可信\n支持海量并发查询与实时协同',
            tags: ['MySQL', '区块链', 'SHA-256', '零知识证明'],
            idx: 1
        },
        {
            icon: '🗺️',
            title: '发展路线图',
            subtitle: 'Phase 1: 数字族谱上线（2024）\nPhase 2: 区块链存证接入（2025）\nPhase 3: AI辅助寻亲（2026）',
            tags: ['2024 MVP', '2025 链改', '2026 AI'],
            idx: 2
        },
        {
            icon: '🔗',
            title: '区块链存证',
            subtitle: '接入政务区块链平台\n每条世系数据生成唯一哈希指纹\n不可篡改·永久存证·公开透明',
            tags: ['联盟链', '政务链', '哈希存证'],
            idx: 3
        },
        {
            icon: '🌏',
            title: '全球化布局',
            subtitle: '覆盖中国28个省份及东南亚、北美地区\n多语言支持（中/英/马）\n文化输出·民族认同·根脉相连',
            tags: ['28省份', '东南亚', '北美宗亲'],
            idx: 4
        }
    ];

    /** 数据库ERD数据 */
    const erdData = [
        {
            name: 't_member',
            icon: '👤',
            desc: '家族成员表',
            fields: [
                { key: 'pk', name: 'id', type: 'BIGINT' },
                { key: '', name: 'name', type: 'VARCHAR' },
                { key: '', name: 'generation', type: 'INT' },
                { key: '', name: 'birth_date', type: 'DATE' },
                { key: '', name: 'death_date', type: 'DATE' },
                { key: '', name: 'gender', type: 'TINYINT' },
                { key: '', name: 'avatar_url', type: 'VARCHAR' },
                { key: '', name: 'bio', type: 'TEXT' },
                { key: '', name: 'location', type: 'VARCHAR' },
                { key: '', name: 'create_time', type: 'DATETIME' }
            ]
        },
        {
            name: 't_relation',
            icon: '🔗',
            desc: '关系关联表',
            fields: [
                { key: 'pk', name: 'id', type: 'BIGINT' },
                { key: 'fk', name: 'ancestor_id', type: 'BIGINT' },
                { key: 'fk', name: 'descendant_id', type: 'BIGINT' },
                { key: '', name: 'relation_type', type: 'TINYINT' },
                { key: 'fk', name: 'marriage_id', type: 'BIGINT' },
                { key: '', name: 'sort_order', type: 'INT' }
            ]
        },
        {
            name: 't_generation_words',
            icon: '📜',
            desc: '字辈字典表',
            fields: [
                { key: 'pk', name: 'id', type: 'BIGINT' },
                { key: '', name: 'branch_name', type: 'VARCHAR' },
                { key: '', name: 'words_sequence', type: 'TEXT' },
                { key: '', name: 'description', type: 'VARCHAR' }
            ]
        },
        {
            name: 't_blockchain_cert',
            icon: '⛓️',
            desc: '区块链存证表',
            fields: [
                { key: 'pk', name: 'id', type: 'BIGINT' },
                { key: '', name: 'resource_id', type: 'BIGINT' },
                { key: '', name: 'resource_type', type: 'VARCHAR' },
                { key: '', name: 'hash_value', type: 'VARCHAR' },
                { key: '', name: 'blockchain_tx_id', type: 'VARCHAR' },
                { key: '', name: 'block_height', type: 'BIGINT' },
                { key: '', name: 'cert_time', type: 'DATETIME' },
                { key: '', name: 'status', type: 'TINYINT' }
            ]
        },
        {
            name: 't_user',
            icon: '🔐',
            desc: '系统用户表',
            fields: [
                { key: 'pk', name: 'id', type: 'BIGINT' },
                { key: '', name: 'username', type: 'VARCHAR' },
                { key: '', name: 'password_hash', type: 'VARCHAR' },
                { key: '', name: 'real_name', type: 'VARCHAR' },
                { key: '', name: 'role', type: 'TINYINT' },
                { key: '', name: 'status', type: 'TINYINT' }
            ]
        }
    ];

    /** 区块链存证流程 */
    const bcSteps = [
        { num: '1', title: '数据采集', desc: '管理员在后台录入族人信息，包含姓名、生卒年、籍贯、世系ID等关键字段' },
        { num: '2', title: 'SHA-256 哈希', desc: '服务端对关键字段组合进行 SHA-256 加密，生成唯一数字指纹（Hash）' },
        { num: '3', title: '链上存证', desc: '调用政务区块链网关，将 Hash 值打包成区块上链，获取交易回执（TX ID）' },
        { num: '4', title: '结果回写', desc: '将交易ID和区块高度存入 t_blockchain_cert 表，完成双链路存证' },
        { num: '5', title: '存证验证', desc: '系统定期验证链上数据完整性，确保哈希值与原始数据匹配，保障数据可信度' },
        { num: '6', title: '存证查询', desc: '提供便捷的查询接口，用户可通过族人ID或哈希值验证数据真实性，实现公开透明' }
    ];

    /** 区块链示例记录 */
    const bcRecords = [
        { id: 'MBR-2024-001', name: '伯益', hash: '7f3a2c8e9b1d4f6a...', txId: 'TX-0x7f3a2c8e9b1d4f6a', block: 18942301 },
        { id: 'MBR-2024-002', name: '若木', hash: '5c2d7f8a1e4b9c3d...', txId: 'TX-0x5c2d7f8a1e4b9c3d', block: 18942456 },
        { id: 'MBR-2024-003', name: '大廉', hash: '4a9c1e3b7d2f8a5c...', txId: 'TX-0x4a9c1e3b7d2f8a5c', block: 18942512 }
    ];

    /** 技术栈 */
    const techItems = [
        { icon: '🗄️', name: 'MySQL / 达梦数据库', desc: '关系型数据库存储族谱核心数据，支持复杂血缘关系查询，适配国产化信创要求' },
        { icon: '⛓️', name: '百度超级链 / 政务链', desc: '接入省级政务区块链，天然公信力，提供合规商用密码评测认证' },
        { icon: '🔐', name: 'SHA-256 + 零知识证明', desc: '数据指纹哈希上链，隐私计算实现数据可用不可见，保护宗亲隐私' },
        { icon: '📦', name: 'OSS 对象存储', desc: '老谱扫描件、图片存储于对象存储，数据库仅保存路径，节省成本' },
        { icon: '🛡️', name: '双因素认证 (2FA)', desc: '管理员账号增加短信/邮箱验证码，分级权限系统保障数据安全' },
        { icon: '🌐', name: '分布式部署', desc: '多节点容灾，CDN 加速静态资源，保障全球宗亲低延迟访问' }
    ];

    // ============================================================
    //  模块一：页面加载器
    // ============================================================
    const loader = document.getElementById('pageLoader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 800);
    });
    // 兜底：最多等3秒
    setTimeout(() => loader.classList.add('hidden'), 3000);


    // ============================================================
    //  模块二：导航栏交互
    // ============================================================
    const header = document.getElementById('mainHeader');
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // 滚动时导航栏样式
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
        updateActiveNav();
        handleBackToTop();
    }, { passive: true });

    // 汉堡菜单
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
        hamburger.classList.toggle('open');
    });

    // 点击导航链接关闭菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            hamburger.classList.remove('open');
        });
    });

    // 滚动高亮当前导航
    function updateActiveNav() {
        let current = '';
        sections.forEach(sec => {
            const sTop = sec.offsetTop - 100;
            if (window.scrollY >= sTop) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.id === `nav-${current}`) link.classList.add('active');
        });
    }


    // ============================================================
    //  模块三：Hero 数字滚动动画
    // ============================================================
    function animateCount(el, target, duration = 1500) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { start = target; clearInterval(timer); }
            el.textContent = Math.floor(start).toLocaleString();
        }, 16);
    }
    const statNums = document.querySelectorAll('.stat-num');
    let statsAnimated = false;
    const heroObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statNums.forEach(el => {
                animateCount(el, parseInt(el.dataset.count));
            });
        }
    }, { threshold: 0.5 });
    const heroSection = document.getElementById('home');
    if (heroSection) heroObs.observe(heroSection);


    // ============================================================
    //  模块四：族谱树渲染
    // ============================================================
    const treeRoot = document.getElementById('treeRoot');

    function createTreeNode(node, depth = 0) {
        const li = document.createElement('li');

        const nodeDiv = document.createElement('div');
        nodeDiv.className = depth === 0 ? 'tree-node ancestor' : 'tree-node';
        nodeDiv.innerHTML = `
            <div class="tree-node-name">${node.name}</div>
            <div class="tree-node-gen">${node.info}</div>
        `;
        nodeDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(node);
        });

        // 悬浮提示
        nodeDiv.title = `${node.name} · ${node.info} · ${node.location}`;

        li.appendChild(nodeDiv);

        if (node.children && node.children.length > 0) {
            const ul = document.createElement('ul');
            node.children.forEach(child => {
                ul.appendChild(createTreeNode(child, depth + 1));
            });
            li.appendChild(ul);
        }

        return li;
    }

    function renderTree() {
        treeRoot.innerHTML = '';
        const treeUl = document.createElement('ul');
        treeUl.appendChild(createTreeNode(familyTreeData));
        treeRoot.appendChild(treeUl);
    }
    renderTree();

    // 展开/收折按钮
    document.getElementById('expandAll').addEventListener('click', () => {
        document.querySelectorAll('.tree-wrapper ul ul').forEach(ul => {
            ul.style.display = 'flex';
        });
    });
    document.getElementById('collapseAll').addEventListener('click', () => {
        document.querySelectorAll('.tree-wrapper ul ul').forEach(ul => {
            ul.style.display = 'none';
        });
    });


    // ============================================================
    //  模块五：族人详情 Modal
    // ============================================================
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const closeModal2 = document.getElementById('modalClose2');

    function openModal(node) {
        document.getElementById('modalName').textContent = node.name;
        document.getElementById('modalInfo').textContent = node.info;
        document.getElementById('modalBio').textContent = node.bio;
        document.getElementById('modalLoc').textContent = node.location;
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(node.name)}&background=8B4513&color=fff&size=160&font-size=0.4&bold=true`;
        document.getElementById('modalImg').src = avatarUrl;

        const bcEl = document.getElementById('modalBc');
        const bcSection = document.getElementById('modalBcSection');
        if (node.bc) {
            bcEl.textContent = node.bc;
            bcSection.style.display = 'flex';
        } else {
            bcSection.style.display = 'none';
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModalFn() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    closeModal.addEventListener('click', closeModalFn);
    closeModal2.addEventListener('click', closeModalFn);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFn();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModalFn();
    });


    // ============================================================
    //  模块六：字辈计算器
    // ============================================================
    const calcBtn = document.getElementById('calcBtn');
    const branchSelect = document.getElementById('branchSelect');
    const genInput = document.getElementById('genInput');
    const resultBox = document.getElementById('calcResult');
    const resultChar = document.getElementById('resultChar');
    const resultContext = document.getElementById('resultContext');
    const genSequence = document.getElementById('genSequence');

    calcBtn.addEventListener('click', () => {
        const branchKey = branchSelect.value;
        const gen = parseInt(genInput.value);

        if (!gen || gen < 1 || gen > 999) {
            shakeElement(genInput);
            return;
        }

        const branch = generationData[branchKey];
        const chars = branch.words;
        const index = (gen - 1) % chars.length;
        const char = chars[index];

        resultChar.textContent = char;
        resultContext.innerHTML = `
            第 <strong>${gen}</strong> 世 · ${branch.label}<br>
            <span style="font-size:0.82rem;color:var(--text-light)">${branch.desc}</span>
        `;

        // 渲染字辈序列
        genSequence.innerHTML = '';
        const startIdx = Math.max(0, index - 4);
        const endIdx = Math.min(chars.length - 1, index + 4);
        for (let i = startIdx; i <= endIdx; i++) {
            const span = document.createElement('span');
            span.className = 'gen-char' + (i === index ? ' current' : '');
            span.textContent = chars[i];
            span.title = `第${i + 1}位`;
            genSequence.appendChild(span);
        }

        resultBox.classList.remove('hidden');
    });

    // Enter键触发计算
    genInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') calcBtn.click();
    });

    function shakeElement(el) {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'shake 0.4s ease';
        el.focus();
        setTimeout(() => el.style.animation = '', 400);
    }


    // ============================================================
    //  模块七：PPT 轮播展示
    // ============================================================
    const pptTrack = document.getElementById('pptTrack');
    const pptIndicators = document.getElementById('pptIndicators');
    const pptPrev = document.getElementById('pptPrev');
    const pptNext = document.getElementById('pptNext');
    const pptPageInfo = document.getElementById('pptPageInfo');
    let pptCurrentIndex = 0;
    let pptDragging = false;
    let pptDragStartX = 0;
    let pptDragCurrentX = 0;

    // 渲染幻灯片
    pptSlides.forEach((slide, i) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'ppt-slide';
        slideDiv.dataset.idx = i;
        slideDiv.innerHTML = `
            <div class="ppt-slide-inner">
                <div class="ppt-deco"></div>
                <div class="ppt-slide-icon">${slide.icon}</div>
                <div class="ppt-slide-title">${slide.title}</div>
                <div class="ppt-slide-subtitle">${slide.subtitle.replace(/\n/g, '<br>')}</div>
                <div class="ppt-slide-tags">
                    ${slide.tags.map(t => `<span class="ppt-tag">${t}</span>`).join('')}
                </div>
                <div class="slide-num">${String(i + 1).padStart(2, '0')} / ${String(pptSlides.length).padStart(2, '0')}</div>
            </div>
        `;
        pptTrack.appendChild(slideDiv);

        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `第${i + 1}张`);
        dot.addEventListener('click', () => goToSlide(i));
        pptIndicators.appendChild(dot);
    });

    function goToSlide(idx) {
        pptCurrentIndex = Math.max(0, Math.min(pptSlides.length - 1, idx));
        pptTrack.style.transform = `translateX(-${pptCurrentIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === pptCurrentIndex);
        });
        pptPageInfo.textContent = `${pptCurrentIndex + 1} / ${pptSlides.length}`;
    }

    pptPrev.addEventListener('click', () => goToSlide(pptCurrentIndex - 1));
    pptNext.addEventListener('click', () => goToSlide(pptCurrentIndex + 1));

    // 键盘箭头键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToSlide(pptCurrentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(pptCurrentIndex + 1);
    });

    // 拖拽/触摸
    function onDragStart(x) {
        pptDragging = true;
        pptDragStartX = x;
        pptDragCurrentX = x;
        pptTrack.classList.add('dragging');
    }
    function onDragMove(x) {
        if (!pptDragging) return;
        pptDragCurrentX = x;
    }
    function onDragEnd() {
        if (!pptDragging) return;
        pptDragging = false;
        pptTrack.classList.remove('dragging');
        const diff = pptDragStartX - pptDragCurrentX;
        if (Math.abs(diff) > 50) {
            goToSlide(diff > 0 ? pptCurrentIndex + 1 : pptCurrentIndex - 1);
        }
    }
    pptTrack.addEventListener('mousedown', (e) => onDragStart(e.clientX));
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
    window.addEventListener('mouseup', onDragEnd);
    pptTrack.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
    pptTrack.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), { passive: true });
    pptTrack.addEventListener('touchend', onDragEnd);

    // 自动播放
    let autoPlayTimer = setInterval(() => goToSlide((pptCurrentIndex + 1) % pptSlides.length), 5000);
    pptTrack.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    pptTrack.addEventListener('mouseleave', () => {
        autoPlayTimer = setInterval(() => goToSlide((pptCurrentIndex + 1) % pptSlides.length), 5000);
    });


    // ============================================================
    //  模块八：数据库 ERD 渲染
    // ============================================================
    const erdDiagram = document.getElementById('erdDiagram');
    const erdRelations = document.getElementById('erdRelations');

    erdData.forEach(table => {
        const div = document.createElement('div');
        div.className = 'erd-table fade-in';
        div.innerHTML = `
            <div class="erd-table-head">
                <span class="erd-table-icon">${table.icon}</span>
                <span>${table.name}</span>
            </div>
            <div class="erd-table-body">
                <div style="font-size:0.72rem;color:var(--text-light);margin-bottom:8px;letter-spacing:1px;">${table.desc}</div>
                ${table.fields.map(f => `
                    <div class="erd-field">
                        <div class="erd-field-key ${f.key || 'none'}">${f.key ? f.key.toUpperCase() : ''}</div>
                        <div class="erd-field-name">${f.name}</div>
                        <div class="erd-field-type">${f.type}</div>
                    </div>
                `).join('')}
            </div>
        `;
        erdDiagram.appendChild(div);
    });

    const relationsData = [
        { title: 't_member → t_relation', desc: 'ancestor_id & descendant_id 均引用 t_member.id，一个成员可作为多条关系的祖先或后代' },
        { title: 't_generation_words → t_member', desc: '通过 generation 字段将字辈字典与成员代数关联，支持快速查询' },
        { title: 't_blockchain_cert → t_member', desc: 'resource_id 指向 t_member.id，对成员信息变更进行区块链存证' },
        { title: 't_blockchain_cert → t_relation', desc: 'resource_id 指向 t_relation.id，对世系关系变更进行存证，确保溯源' },
        { title: 't_user 权限体系', desc: 'role 字段区分游客(0)、宗亲(1)、管理员(2)，基于角色实现分级数据访问控制' },
        { title: '兼容性说明', desc: '主键均使用 BIGINT 保证超大规模族谱扩展需求，同时兼容国产达梦、人大金仓数据库' }
    ];

    relationsData.forEach(rel => {
        const div = document.createElement('div');
        div.className = 'erd-rel-item fade-in';
        div.innerHTML = `<div class="erd-rel-title">${rel.title}</div><div>${rel.desc}</div>`;
        erdRelations.appendChild(div);
    });


    // ============================================================
    //  模块九：区块链存证
    // ============================================================
    const bcStepsEl = document.getElementById('bcSteps');
    const bcRecordsEl = document.getElementById('bcRecords');
    const techItemsEl = document.getElementById('techItems');
    const bcVerifyBtn = document.getElementById('bcVerifyBtn');
    const bcInput = document.getElementById('bcInput');
    const bcResult = document.getElementById('bcResult');

    // 渲染存证步骤
    bcSteps.forEach((step, i) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="bc-step fade-in">
                <div class="bc-step-num">${step.num}</div>
                <div>
                    <div class="bc-step-title">${step.title}</div>
                    <div class="bc-step-desc">${step.desc}</div>
                </div>
            </div>
            ${i < bcSteps.length - 1 ? '<div class="bc-arrow">↓</div>' : ''}
        `;
        bcStepsEl.appendChild(div);
    });

    // 渲染示例存证记录
    bcRecordsEl.innerHTML = `<div class="bc-records-title">已存证记录 (示例)</div>`;
    bcRecords.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'bc-record-item';
        div.innerHTML = `
            <div class="bc-record-dot"></div>
            <div class="bc-record-name">${rec.name}</div>
            <div class="bc-record-hash">${rec.hash}</div>
            <div class="bc-record-status">✓ 通过</div>
        `;
        div.addEventListener('click', () => {
            bcInput.value = rec.id;
            simulateVerify(rec.id, true);
        });
        bcRecordsEl.appendChild(div);
    });

    // 渲染技术栈
    techItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'tech-item fade-in';
        div.innerHTML = `
            <div class="tech-item-icon">${item.icon}</div>
            <div>
                <div class="tech-item-name">${item.name}</div>
                <div class="tech-item-desc">${item.desc}</div>
            </div>
        `;
        techItemsEl.appendChild(div);
    });

    // 区块链核验
    bcVerifyBtn.addEventListener('click', () => {
        const val = bcInput.value.trim();
        if (!val) {
            shakeElement(bcInput);
            return;
        }
        // 模拟验证（已知记录通过，其他失败）
        const knownIds = bcRecords.map(r => r.id);
        const isValid = knownIds.includes(val);
        simulateVerify(val, isValid);
    });

    function simulateVerify(id, isValid) {
        bcResult.className = 'bc-result hidden';
        bcVerifyBtn.textContent = '核验中...';
        bcVerifyBtn.disabled = true;

        setTimeout(() => {
            const rec = bcRecords.find(r => r.id === id) || {};
            const mockHash = rec.hash ? rec.hash + 'a8f4c2e1b3d9' : generateMockHash();
            const mockBlock = rec.block || Math.floor(Math.random() * 1000000 + 18000000);

            if (isValid) {
                bcResult.className = 'bc-result success';
                bcResult.innerHTML = `
                    <div class="bc-result-title">✅ 认证通过 · 数据未被篡改</div>
                    <div class="bc-result-detail">
                        族人ID: ${id}<br>
                        哈希值: ${mockHash}<br>
                        交易ID: TX-0x${mockHash.replace('...', '').slice(0, 16)}<br>
                        区块高度: #${mockBlock.toLocaleString()}<br>
                        存证时间: ${new Date().toLocaleString()}<br>
                        存证平台: 江西省政务区块链平台
                    </div>
                `;
            } else {
                bcResult.className = 'bc-result fail';
                bcResult.innerHTML = `
                    <div class="bc-result-title">❌ 核验失败 · 未找到存证记录</div>
                    <div class="bc-result-detail">
                        查询ID: ${id}<br>
                        状态: 该记录未在区块链上找到对应存证<br>
                        建议: 请确认族人ID是否正确，或联系管理员补录存证<br>
                        提示: 可点击下方已存证记录进行体验
                    </div>
                `;
            }

            bcResult.classList.remove('hidden');
            const btn = document.getElementById('bcVerifyBtn');
            btn.innerHTML = '<span>核验真伪</span><span class="btn-icon">🔗</span>';
            btn.disabled = false;
        }, 1500);
    }

    function generateMockHash() {
        const chars = '0123456789abcdef';
        return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * 16)]).join('') + '...';
    }


    // ============================================================
    //  模块十：留言墙 (LocalStorage)
    // ============================================================
    const guestInput = document.getElementById('guestInput');
    const guestNameEl = document.getElementById('guestName');
    const postBtn = document.getElementById('postBtn');
    const guestList = document.getElementById('guestList');
    const charCount = document.getElementById('charCount');

    // 字数计数
    guestInput.addEventListener('input', () => {
        const len = guestInput.value.length;
        charCount.textContent = `${len}/300`;
        charCount.style.color = len > 250 ? 'var(--red-seal)' : 'var(--text-light)';
    });

    const STORAGE_KEY = 'hxfund_guests_v2';

    function loadGuests() {
        let guests = [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            guests = stored ? JSON.parse(stored) : [];
        } catch (e) {
            guests = [];
        }

        // 初始留言（仅在空时添加）
        if (guests.length === 0) {
            guests = [
                {
                    name: '黄氏后人',
                    text: '寻找湖北黄冈宗亲，祖上字辈为"光明正大"，相传先祖清朝末年迁至黄冈，望同宗联系！',
                    time: '2024-01-15 10:32:48'
                },
                {
                    name: '湘赣黄氏',
                    text: '本人出生于湖南宁乡，字辈"文章华国"，正在整理家谱，望石城黄氏宗亲与我联系，共同完善族谱。',
                    time: '2024-02-03 15:21:07'
                }
            ];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
            } catch (e) { /* ignore */ }
        }

        renderGuests(guests);
    }

    function renderGuests(guests) {
        guestList.innerHTML = '';
        const reversed = guests.slice().reverse();
        reversed.forEach(guest => {
            const item = document.createElement('div');
            item.className = 'guest-item';
            const firstChar = (guest.name || '匿')[0];
            item.innerHTML = `
                <div class="guest-avatar">${firstChar}</div>
                <div class="guest-content">
                    <div class="guest-meta">
                        <span class="guest-name-tag">${escapeHtml(guest.name || '匿名宗亲')}</span>
                        <span class="guest-time">${guest.time}</span>
                    </div>
                    <div class="guest-text">${escapeHtml(guest.text)}</div>
                </div>
            `;
            guestList.appendChild(item);
        });
    }

    postBtn.addEventListener('click', () => {
        const text = guestInput.value.trim();
        if (!text) { shakeElement(guestInput); return; }
        if (text.length > 300) { alert('留言不能超过300字'); return; }

        const name = guestNameEl.value.trim() || '匿名宗亲';
        const newGuest = {
            name,
            text,
            time: new Date().toLocaleString('zh-CN')
        };

        let guests = [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            guests = stored ? JSON.parse(stored) : [];
        } catch (e) { guests = []; }
        guests.push(newGuest);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
        } catch (e) { /* ignore */ }

        guestInput.value = '';
        guestNameEl.value = '';
        charCount.textContent = '0/300';
        loadGuests();

        // 成功反馈
        postBtn.innerHTML = '<span>发布成功！</span><span class="btn-icon">✓</span>';
        postBtn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
        setTimeout(() => {
            postBtn.innerHTML = '<span>发布留言</span><span class="btn-icon">✉</span>';
            postBtn.style.background = '';
        }, 2000);
    });

    loadGuests();

    // HTML 转义防止 XSS
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }


    // ============================================================
    //  模块七：Qwen AI 客户端
    // ============================================================
    const qwenMessages = document.getElementById('qwenMessages');
    const qwenInput = document.getElementById('qwenInput');
    const qwenSendBtn = document.getElementById('qwenSendBtn');
    const qwenTokens = document.getElementById('qwenTokens');
    const qwenModelSelect = document.getElementById('qwenModelSelect');
    const qwenTemperature = document.getElementById('qwenTemperature');
    const tempValue = document.getElementById('tempValue');
    const qwenApiKey = document.getElementById('qwenApiKey');
    const qwenSaveConfig = document.getElementById('qwenSaveConfig');

    // 获取图片上传相关元素
    const qwenImageUpload = document.getElementById('qwenImageUpload');
    const qwenImagePreview = document.getElementById('qwenImagePreview');
    
    // 当前选中的图片文件
    let selectedImageFile = null;

    // 从localStorage加载配置
    function loadQwenConfig() {
        const savedConfig = localStorage.getItem('qwenConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            qwenModelSelect.value = config.model || 'qwen-turbo';
            qwenTemperature.value = config.temperature || '0.7';
            tempValue.textContent = config.temperature || '0.7';
            qwenApiKey.value = config.apiKey || '';
        }
    }

    // 保存配置到localStorage
    function saveQwenConfig() {
        const config = {
            model: qwenModelSelect.value,
            temperature: qwenTemperature.value,
            apiKey: qwenApiKey.value
        };
        localStorage.setItem('qwenConfig', JSON.stringify(config));
        alert('配置已保存！');
    }

    // 图片上传处理
    qwenImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 验证文件类型
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            // 检查文件大小（限制为5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('图片文件大小不能超过5MB');
                return;
            }
            
            selectedImageFile = file;
            
            // 显示图片预览
            const reader = new FileReader();
            reader.onload = function(event) {
                qwenImagePreview.innerHTML = `<img src="${event.target.result}" alt="预览图片">`;
                qwenImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // 更新温度值显示
    qwenTemperature.addEventListener('input', () => {
        tempValue.textContent = qwenTemperature.value;
    });

    // 保存配置按钮事件
    qwenSaveConfig.addEventListener('click', saveQwenConfig);

    // 初始化配置
    loadQwenConfig();

    // 添加消息到聊天窗口
    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `qwen-message ${role}-message`;
        
        const avatarClass = role === 'user' ? 'user-avatar' : 'ai-avatar';
        const avatarEmoji = role === 'user' ? '👤' : '🤖';
        const nameText = role === 'user' ? '您' : 'Qwen AI';
        
        messageDiv.innerHTML = `
            <div class="qwen-avatar ${avatarClass}">${avatarEmoji}</div>
            <div class="qwen-content">
                <div class="qwen-name">${nameText}</div>
                <div class="qwen-text">${content}</div>
            </div>
        `;
        
        qwenMessages.appendChild(messageDiv);
        qwenMessages.scrollTop = qwenMessages.scrollHeight;
    }

    // 计算token数量（简单估算）
    function estimateTokens(text) {
        // 简单估算：中文字符按1个token计算，英文单词按1个token计算
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
        return chineseChars + englishWords;
    }

    // 发送消息到Qwen API（真实实现，支持多模态）
    async function sendMessageToQwen(message, imageFile = null) {
        // 显示加载状态
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'qwen-message ai-message';
        loadingMsg.innerHTML = `
            <div class="qwen-avatar ai-avatar">🤖</div>
            <div class="qwen-content">
                <div class="qwen-name">Qwen AI</div>
                <div class="qwen-text"><i>正在思考中...</i></div>
            </div>
        `;
        qwenMessages.appendChild(loadingMsg);
        qwenMessages.scrollTop = qwenMessages.scrollHeight;

        try {
            // 获取配置
            const config = JSON.parse(localStorage.getItem('qwenConfig')) || {};
            const apiKey = config.apiKey || '';
            const model = config.model || 'qwen-turbo';
            const temperature = parseFloat(config.temperature) || 0.7;

            // 检查API密钥
            if (!apiKey) {
                throw new Error('请先在配置面板中输入API密钥');
            }

            // 调用真实的Qwen API（支持多模态）
            // 注意：出于安全考虑，前端直接调用API密钥存在风险
            // 实际部署时，建议通过后端代理API请求
            const response = await callQwenAPI(message, model, temperature, apiKey, imageFile);

            // 移除加载状态
            qwenMessages.removeChild(loadingMsg);

            // 添加真实响应
            addMessage('ai', response);

            // 更新token统计（简化计算）
            const tokens = estimateTokens(message + response);
            qwenTokens.textContent = tokens;

        } catch (error) {
            // 移除加载状态
            qwenMessages.removeChild(loadingMsg);

            // 添加错误消息
            addMessage('ai', `抱歉，出现了一个错误：${error.message || '请求失败'}`);
        }
    }

    // 调用Qwen API的函数（通过后端代理，支持多模态）
    async function callQwenAPI(prompt, model, temperature, apiKey, imageFile = null) {
        // 通过后端代理调用API以保护API密钥
        const proxyUrl = '/api/qwen';  // 后端代理端点
        
        // 准备请求数据
        const requestData = {
            prompt: prompt,
            model: model,
            temperature: temperature,
            hasImage: !!imageFile  // 标识是否有图片
        };

        // 如果有图片，则转换为base64
        if (imageFile) {
            const reader = new FileReader();
            try {
                // 这里我们不能直接等待FileReader，因为它使用回调
                // 我们需要使用Promise包装
                const imageBase64 = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result.split(',')[1]); // 获取base64部分
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
                
                requestData.image = imageBase64;
                requestData.imageType = imageFile.type;
            } catch (error) {
                console.error('图片处理错误:', error);
            }
        }

        try {
            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API请求失败: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('API调用错误:', error);
            // 如果API调用失败，返回一个模拟响应
            return `API调用失败: ${error.message}。请检查API密钥是否正确配置在服务器端，以及网络连接是否正常。`;
        }
    }

    // 发送按钮事件
    qwenSendBtn.addEventListener('click', async () => {
        const message = qwenInput.value.trim();
        if (!message && !selectedImageFile) {
            shakeElement(qwenInput);
            return;
        }

        // 添加用户消息（包含图片信息）
        let messageContent = message;
        if (selectedImageFile) {
            messageContent = `[图片: ${selectedImageFile.name}] ${message}`;
        }
        addMessage('user', messageContent);

        // 清空输入框和图片预览
        qwenInput.value = '';
        qwenImagePreview.style.display = 'none';
        selectedImageFile = null;

        // 发送消息到Qwen（包含图片）
        await sendMessageToQwen(message, selectedImageFile);
    });

    // Enter键发送消息（Ctrl+Enter换行）
    qwenInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            qwenSendBtn.click();
        }
    });


    // ============================================================
    //  模块十一：回到顶部
    // ============================================================
    const backToTop = document.getElementById('backToTop');
    function handleBackToTop() {
        if (window.scrollY > 400) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    }
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // ============================================================
    //  模块十二：滚动进场动画 (Intersection Observer)
    // ============================================================
    const fadeEls = document.querySelectorAll('.fade-in');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // 延迟挂载，确保所有元素已渲染
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    }, 100);


    // ============================================================
    //  CSS 补丁：抖动动画
    // ============================================================
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    console.log('🟡 黄氏家族寻根平台 | hxfund.cn | 已启动');
});
