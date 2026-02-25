/**
 * 黄氏家族寻根平台 - 主脚本文件
 * 处理页面加载、导航、动画等全局功能
 */

// 页面加载完成后隐藏加载动画
window.addEventListener('load', () => {
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        // 确保所有资源加载完成后隐藏加载动画
        setTimeout(() => {
            pageLoader.classList.add('hidden');
            // 300ms 后从 DOM 中移除（等待过渡动画完成）
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 600);
        }, 500); // 最少显示 500ms，确保视觉流畅
    }

    console.log('✅ 黄氏家族寻根平台已加载完成');

    // 注册 Service Worker（PWA）
    registerServiceWorker();
});

// 注册 Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/pwa/service-worker.js')
            .then((registration) => {
                console.log('[PWA] Service Worker 注册成功:', registration.scope);
                
                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('[PWA] 发现新版本，下载中...');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 有新版本可用
                            console.log('[PWA] 新版本已就绪，刷新页面应用更新');
                            if (confirm('🔄 发现新版本，是否立即刷新？')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[PWA] Service Worker 注册失败:', error);
            });

        // 监听控制器变更
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] 内容已更新，页面已刷新');
        });
        
        // 监听来自 SW 的消息
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                console.log('[PWA] 服务端通知：有更新可用');
            }
        });
    }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // 更新导航状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');

                // 移动端关闭菜单
                const nav = document.getElementById('mainNav');
                if (nav && nav.classList.contains('show')) {
                    nav.classList.remove('show');
                    document.getElementById('hamburgerBtn')?.classList.remove('active');
                }
            }
        });
    });

    // 汉堡菜单
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('show');
            hamburgerBtn.classList.toggle('active');
        });
    }

    // 滚动时导航栏效果
    const mainHeader = document.getElementById('mainHeader');
    if (mainHeader) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // 初始化检查
    }

    // 回到顶部按钮
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        const handleBackToTopScroll = () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        };
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', handleBackToTopScroll, { passive: true });
        handleBackToTopScroll(); // 初始化检查
    }

    // 数字动画（统计数字）- 使用 requestAnimationFrame 优化性能
    const animateNumbers = () => {
        const statNums = document.querySelectorAll('.stat-num');

        statNums.forEach(num => {
            const target = parseInt(num.getAttribute('data-count'));
            if (!target) return;

            const duration = 2000; // 2 秒动画
            const startTime = performance.now();
            const startValue = 0;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // 使用 ease-out 缓动函数
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

                num.textContent = currentValue.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    num.textContent = target.toLocaleString();
                }
            };

            requestAnimationFrame(animate);
        });
    };

    // 使用 Intersection Observer 在可见时触发动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                section.classList.add('visible');
                
                // 如果是首页区域，触发动画
                if (section.id === 'home') {
                    animateNumbers();
                }
                
                observer.unobserve(section);
            }
        });
    }, observerOptions);

    // 观察所有 section
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // 模态框功能
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeModal');
    const closeBtn2 = document.getElementById('modalClose2');
    
    if (modal) {
        window.closeModal = (modalElement = modal) => {
            modalElement.classList.remove('show');
            document.body.style.overflow = '';
        };

        closeBtn?.addEventListener('click', () => closeModal());
        closeBtn2?.addEventListener('click', () => closeModal());
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
});

// 防止快速双击缩放
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// =========================================
// 错误处理已由 error-monitor.js 统一处理
// =========================================
