/**
 * 黄氏家族寻根平台 - 功能模块脚本（轻量版）
 * 处理家族树、PPT、区块链、留言墙等 UI 渲染
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 模块一：家族世系树
    // =========================================

    // 渲染家族树节点
    function renderTreeNode(node, level = 0) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.dataset.level = level;

        const hasChildren = node.children && node.children.length > 0;

        nodeDiv.innerHTML = `
            <div class="tree-node-card" data-id="${node.id}">
                <div class="node-avatar">${node.avatar}</div>
                <div class="node-info">
                    <div class="node-name">${node.name}</div>
                    <div class="node-title">${node.title}</div>
                    <div class="node-period">${node.period}</div>
                </div>
                ${hasChildren ? '<span class="node-expand">▼</span>' : ''}
            </div>
            ${hasChildren ? `<div class="tree-node-children" style="display: ${level === 0 ? 'flex' : 'none'}"></div>` : ''}
        `;

        const card = nodeDiv.querySelector('.tree-node-card');
        card.addEventListener('click', () => {
            if (hasChildren) {
                const childrenContainer = nodeDiv.querySelector('.tree-node-children');
                const expandIcon = card.querySelector('.node-expand');

                if (childrenContainer.style.display === 'none') {
                    childrenContainer.style.display = 'flex';
                    expandIcon.textContent = '▼';
                } else {
                    childrenContainer.style.display = 'none';
                }
            }
            if (node.bio) showMemberDetail(node);
        });

        if (hasChildren) {
            const childrenContainer = nodeDiv.querySelector('.tree-node-children');
            node.children.forEach(child => {
                childrenContainer.appendChild(renderTreeNode(child, level + 1));
            });
        }

        return nodeDiv;
    }

    // 显示族人详情
    function showMemberDetail(member) {
        const modal = document.getElementById('modal');
        if (!modal) return;

        document.getElementById('modalName').textContent = member.title;
        document.getElementById('modalInfo').textContent = `${member.period} · ${member.name}`;
        document.getElementById('modalBio').textContent = member.bio || '暂无详细信息';
        document.getElementById('modalLoc').textContent = member.location || '未知';

        const modalImg = document.getElementById('modalImg');
        if (modalImg) {
            modalImg.alt = member.avatar;
            modalImg.loading = 'lazy';
            modalImg.src = 'data:image/svg+xml,' + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#8B4513" rx="10"/>
                    <text x="50" y="65" font-size="50" text-anchor="middle" fill="white">${member.avatar}</text>
                </svg>`
            );
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 初始化家族树
    const treeRoot = document.getElementById('treeRoot');
    if (treeRoot) {
        const data = window.HuangshiData?.familyTreeData || window.familyTreeData;
        if (data) {
            treeRoot.appendChild(renderTreeNode(data));

            document.getElementById('expandAll')?.addEventListener('click', () => {
                treeRoot.querySelectorAll('.tree-node-children').forEach(el => el.style.display = 'flex');
                treeRoot.querySelectorAll('.node-expand').forEach(el => el.textContent = '▼');
            });

            document.getElementById('collapseAll')?.addEventListener('click', () => {
                treeRoot.querySelectorAll('.tree-node-children').forEach(el => {
                    const parentLevel = parseInt(el.parentElement.dataset.level);
                    if (parentLevel >= 0) el.style.display = 'none';
                });
                treeRoot.querySelectorAll('.node-expand').forEach(el => el.textContent = '▼');
            });
        }
    }

    // =========================================
    // 模块二：智能字辈计算器
    // =========================================

    const calcBtn = document.getElementById('calcBtn');
    const branchSelect = document.getElementById('branchSelect');
    const genInput = document.getElementById('genInput');
    const calcResult = document.getElementById('calcResult');

    if (calcBtn && branchSelect && genInput) {
        calcBtn.addEventListener('click', () => {
            const branch = branchSelect.value;
            const generation = parseInt(genInput.value);

            if (!generation || generation < 1 || generation > 999) {
                alert('请输入有效的代数（1-999）');
                return;
            }

            const poems = window.HuangshiData?.generationPoems || window.generationPoems;
            const data = poems?.[branch];
            if (!data) return;

            const charIndex = (generation - 1) % data.characters.length;
            const character = data.characters[charIndex];

            if (calcResult) {
                document.getElementById('resultChar').textContent = character;
                document.getElementById('resultContext').innerHTML = `
                    <strong>${data.name}</strong> 第${generation}世<br>
                    字辈诗：${data.poem}
                `;

                const sequenceEl = document.getElementById('genSequence');
                if (sequenceEl) {
                    const start = Math.max(0, charIndex - 3);
                    const end = Math.min(data.characters.length, charIndex + 4);
                    let seqHtml = '<div class="sequence-label">前后字辈</div><div class="sequence-characters">';
                    for (let i = start; i < end; i++) {
                        seqHtml += `<span class="seq-char ${i === charIndex ? 'current' : ''}">${data.characters[i]}</span>`;
                    }
                    sequenceEl.innerHTML = seqHtml + '</div>';
                }
                calcResult.classList.remove('hidden');
            }
        });
    }

    // =========================================
    // 模块三：项目愿景 PPT 展示
    // =========================================

    let currentSlide = 0;

    function renderPPT() {
        const pptTrack = document.getElementById('pptTrack');
        const pptIndicators = document.getElementById('pptIndicators');
        if (!pptTrack) return;

        const slides = window.HuangshiData?.pptSlides || window.pptSlides;
        if (!slides) return;

        pptTrack.innerHTML = slides.map((slide, index) => `
            <div class="ppt-slide" data-idx="${index}">
                <div class="ppt-slide-inner">
                    <div class="ppt-deco"></div>
                    <div class="ppt-icon">${slide.icon}</div>
                    <h3 class="ppt-title">${slide.title}</h3>
                    <p class="ppt-subtitle">${slide.subtitle}</p>
                    <div class="ppt-slide-content">${slide.content}</div>
                    ${slide.tags ? `
                    <div class="ppt-slide-tags">
                        ${slide.tags.map(tag => `<span class="ppt-tag">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                    <div class="slide-num">${index + 1} / ${slides.length}</div>
                </div>
            </div>
        `).join('');

        pptIndicators.innerHTML = slides.map((_, index) =>
            `<button class="ppt-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="第${index + 1}页"></button>`
        ).join('');

        updatePPT();

        pptIndicators.querySelectorAll('.ppt-indicator').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSlide = parseInt(btn.dataset.index);
                updatePPT();
            });
        });
    }

    function updatePPT() {
        const pptTrack = document.getElementById('pptTrack');
        const pptPageInfo = document.getElementById('pptPageInfo');
        const indicators = document.querySelectorAll('.ppt-indicator');
        if (!pptTrack) return;

        pptTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        indicators.forEach((btn, index) => btn.classList.toggle('active', index === currentSlide));
        if (pptPageInfo) pptPageInfo.textContent = `${currentSlide + 1} / ${window.HuangshiData?.pptSlides.length || window.pptSlides.length}`;
    }

    document.getElementById('pptPrev')?.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + window.HuangshiData?.pptSlides.length || window.pptSlides.length) % window.HuangshiData?.pptSlides.length || window.pptSlides.length;
        updatePPT();
    });

    document.getElementById('pptNext')?.addEventListener('click', () => {
        const slides = window.HuangshiData?.pptSlides || window.pptSlides;
        currentSlide = (currentSlide + 1) % slides.length;
        updatePPT();
    });

    renderPPT();

    // =========================================
    // 模块四：区块链存证
    // =========================================

    const bcStepsEl = document.getElementById('bcSteps');
    if (bcStepsEl) {
        const bcSteps = [
            { icon: '📝', title: '提交数据', desc: '录入族人信息' },
            { icon: '🔐', title: '生成哈希', desc: 'SHA-256 加密' },
            { icon: '⛓️', title: '上链存证', desc: '区块链网络确认' },
            { icon: '✅', title: '获取凭证', desc: '存证证书生成' }
        ];
        bcStepsEl.innerHTML = bcSteps.map((step, i) => `
            <div class="bc-step">
                <div class="bc-step-num">${i + 1}</div>
                <div class="bc-step-icon">${step.icon}</div>
                <div class="bc-step-title">${step.title}</div>
                <div class="bc-step-desc">${step.desc}</div>
            </div>
        `).join('');
    }

    const bcRecordsEl = document.getElementById('bcRecords');
    if (bcRecordsEl) {
        const records = window.HuangshiData?.bcRecords || window.bcRecords;
        if (records) {
            bcRecordsEl.innerHTML = `
            <h4>已存证记录</h4>
            ${records.map(record => `
                <div class="bc-record-item">
                    <span class="bc-record-id">${record.id}</span>
                    <span class="bc-record-name">${record.name}</span>
                    <span class="bc-record-hash">${record.hash.substring(0, 12)}...</span>
                    <span class="bc-record-status ${record.verified ? 'verified' : 'pending'}">
                        ${record.verified ? '✓ 已验证' : '⏳ 待验证'}
                    </span>
                </div>
            `).join('')}
        `;
        }
    }

    const bcVerifyBtn = document.getElementById('bcVerifyBtn');
    const bcInput = document.getElementById('bcInput');
    const bcResult = document.getElementById('bcResult');

    if (bcVerifyBtn && bcInput) {
        const records = window.HuangshiData?.bcRecords || window.bcRecords;

        bcVerifyBtn.addEventListener('click', () => {
            const input = bcInput.value.trim();
            if (!input) { alert('请输入族人 ID 或哈希值'); return; }

            const record = records?.find(r => r.id === input || r.hash.startsWith(input));

            if (bcResult) {
                bcResult.classList.remove('hidden');
                bcResult.innerHTML = record ? `
                    <div class="verify-result success">
                        <span class="verify-icon">✅</span>
                        <div class="verify-info">
                            <strong>验证成功</strong>
                            <p>族人 ID: ${record.id}</p>
                            <p>姓名：${record.name}</p>
                            <p>哈希值：${record.hash}</p>
                        </div>
                    </div>
                ` : `
                    <div class="verify-result fail">
                        <span class="verify-icon">❌</span>
                        <div class="verify-info">
                            <strong>未找到记录</strong>
                            <p>输入的 ID 或哈希值不存在于存证系统中</p>
                        </div>
                    </div>
                `;
            }
        });
    }

    // =========================================
    // 模块五：宗亲留言墙
    // =========================================

    function renderGuestList() {
        const guestList = document.getElementById('guestList');
        if (!guestList) return;

        const messages = window.HuangshiData?.guestMessages || window.guestMessages;
        if (!messages) return;

        guestList.innerHTML = messages.map(msg => `
            <div class="guest-item">
                <div class="guest-header">
                    <span class="guest-name">${msg.name}</span>
                    <span class="guest-location">📍 ${msg.location}</span>
                </div>
                <div class="guest-content">${msg.content}</div>
                <div class="guest-footer">
                    <span class="guest-time">${msg.time}</span>
                    <button class="guest-reply">回复</button>
                </div>
            </div>
        `).join('');
    }

    const postBtn = document.getElementById('postBtn');
    const guestInput = document.getElementById('guestInput');
    const guestNameInput = document.getElementById('guestName');
    const charCount = document.getElementById('charCount');

    if (postBtn && guestInput) {
        postBtn.addEventListener('click', () => {
            const content = guestInput.value.trim();
            const name = guestNameInput?.value.trim() || '匿名宗亲';

            if (!content) { alert('请输入留言内容'); return; }
            if (content.length > 300) { alert('留言内容不能超过 300 字'); return; }

            const messages = window.HuangshiData?.guestMessages || window.guestMessages;
            if (messages) {
                messages.unshift({
                    id: Date.now(), name, content, time: '刚刚', location: '未知'
                });
            }

            renderGuestList();
            guestInput.value = '';
            if (guestNameInput) guestNameInput.value = '';
            if (charCount) charCount.textContent = '0/300';
            alert('留言发布成功！');
        });
    }

    if (guestInput && charCount) {
        guestInput.addEventListener('input', () => {
            charCount.textContent = `${guestInput.value.length}/300`;
        });
    }

    renderGuestList();
});
