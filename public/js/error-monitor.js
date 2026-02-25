/**
 * 黄氏家族寻根平台 - 错误监控模块
 * 
 * 功能：
 * - 捕获未处理的 JavaScript 错误
 * - 捕获未处理的 Promise 拒绝
 * - 性能指标监控
 * - 错误上报（可选集成 Sentry）
 * 
 * 使用方式：
 * <script src="/js/error-monitor.js" defer></script>
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        // 是否启用错误上报（生产环境可改为 true）
        enableReporting: false,
        // 错误上报端点（可选）
        reportEndpoint: null,
        // 是否记录到控制台
        enableLogging: true,
        // 采样率（0-1，1 表示 100% 上报）
        sampleRate: 0.1
    };

    // 错误统计
    const errorStats = {
        count: 0,
        lastError: null,
        errors: []
    };

    /**
     * 格式化错误信息
     */
    function formatError(error, type = 'error') {
        return {
            type: type,
            message: error?.message || error?.reason || String(error),
            filename: error?.filename || window.location.href,
            lineno: error?.lineno || error?.lineNumber,
            colno: error?.colno || error?.columnNumber,
            stack: error?.stack || error?.reason?.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            meta: {
                online: navigator.onLine,
                language: navigator.language,
                platform: navigator.platform,
                deviceMemory: navigator.deviceMemory,
                hardwareConcurrency: navigator.hardwareConcurrency
            }
        };
    }

    /**
     * 错误上报（可选）
     */
    function reportError(errorInfo) {
        if (!CONFIG.enableReporting || !CONFIG.reportEndpoint) {
            return;
        }

        // 采样上报
        if (Math.random() > CONFIG.sampleRate) {
            return;
        }

        // 使用 sendBeacon 上报（不阻塞页面）
        try {
            const blob = new Blob([JSON.stringify(errorInfo)], { type: 'application/json' });
            navigator.sendBeacon(CONFIG.reportEndpoint, blob);
        } catch (e) {
            // 上报失败，静默处理
        }
    }

    /**
     * 记录错误
     */
    function logError(errorInfo) {
        if (!CONFIG.enableLogging) return;

        const prefix = errorInfo.type === 'unhandledrejection' ? '[未处理 Promise]' : '[全局错误]';
        console.error(`${prefix} ${errorInfo.message}`);
        if (errorInfo.stack) {
            console.error(errorInfo.stack);
        }
    }

    /**
     * 显示用户友好的错误提示
     */
    function showNotification(message, type = 'error') {
        // 避免频繁提示
        if (errorStats.count > 5) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#c0392b' : '#f39c12'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 14px;
            animation: slideIn 0.3s ease;
            cursor: pointer;
        `;
        notification.textContent = message;
        notification.onclick = () => notification.remove();

        // 添加动画样式
        if (!document.getElementById('error-monitor-style')) {
            const style = document.createElement('style');
            style.id = 'error-monitor-style';
            style.textContent = `@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    /**
     * 处理全局错误
     */
    function handleError(event) {
        const errorInfo = formatError(event.error || event, 'error');
        
        // 更新统计
        errorStats.count++;
        errorStats.lastError = errorInfo;
        errorStats.errors.push(errorInfo);

        // 限制存储的错误数量
        if (errorStats.errors.length > 50) {
            errorStats.errors.shift();
        }

        logError(errorInfo);
        reportError(errorInfo);

        // 脚本加载失败时显示友好提示
        if (event.filename?.includes('/js/')) {
            showNotification('⚠️ 脚本加载失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 处理未处理的 Promise 拒绝
     */
    function handleUnhandledRejection(event) {
        const errorInfo = formatError(event.reason, 'unhandledrejection');
        
        errorStats.count++;
        errorStats.lastError = errorInfo;
        errorStats.errors.push(errorInfo);

        if (errorStats.errors.length > 50) {
            errorStats.errors.shift();
        }

        logError(errorInfo);
        reportError(errorInfo);
    }

    /**
     * 监控性能指标
     */
    function monitorPerformance() {
        if ('PerformanceObserver' in window) {
            try {
                // 监控长任务
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) {
                            console.warn('[性能警告] 检测到长任务:', entry.duration.toFixed(2) + 'ms');
                        }
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });

                // 监控布局偏移 (CLS)
                const clsObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.hadRecentInput) return;
                        console.warn('[性能警告] 布局偏移:', entry.value.toFixed(4));
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

            } catch (e) {
                // PerformanceObserver 不支持时静默失败
            }
        }
    }

    /**
     * 监听网络状态
     */
    function monitorNetwork() {
        window.addEventListener('offline', () => {
            console.warn('[网络状态] 已离线');
        });

        window.addEventListener('online', () => {
            console.log('[网络状态] 已在线');
        });
    }

    /**
     * 初始化错误监控
     */
    function init() {
        // 监听全局错误
        window.addEventListener('error', handleError, { passive: true });

        // 监听未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', handleUnhandledRejection, { passive: true });

        // 监控性能
        monitorPerformance();

        // 监听网络状态
        monitorNetwork();

        // 监听页面卸载前上报剩余错误
        window.addEventListener('beforeunload', () => {
            if (errorStats.errors.length > 0 && CONFIG.enableReporting && CONFIG.reportEndpoint) {
                const blob = new Blob([JSON.stringify({ errors: errorStats.errors })], { type: 'application/json' });
                navigator.sendBeacon(CONFIG.reportEndpoint, blob);
            }
        });

        console.log('[错误监控] 已初始化');
    }

    // 公开 API
    window.ErrorMonitor = {
        // 获取错误统计
        getStats: () => errorStats,
        
        // 清除错误记录
        clear: () => {
            errorStats.count = 0;
            errorStats.lastError = null;
            errorStats.errors = [];
        },
        
        // 手动上报错误
        report: (error, context = {}) => {
            const errorInfo = { ...formatError(error, 'manual'), context };
            logError(errorInfo);
            reportError(errorInfo);
        },

        // 配置
        configure: (options) => {
            Object.assign(CONFIG, options);
        },

        // 初始化
        init
    };

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
