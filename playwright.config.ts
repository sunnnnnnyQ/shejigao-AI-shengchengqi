import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E测试配置
 * 文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // 测试文件目录
    testDir: './tests/e2e',

    // 完全并行执行测试
    fullyParallel: true,

    // CI环境下禁止使用test.only
    forbidOnly: !!process.env.CI,

    // 失败重试次数
    retries: process.env.CI ? 2 : 0,

    // 工作进程数
    workers: process.env.CI ? 1 : undefined,

    // 测试报告格式
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],

    // 全局测试配置
    use: {
        // 基础URL - 更新为当前开发服务器端口
        baseURL: process.env.BASE_URL || 'http://localhost:3001',

        // 失败时记录trace
        trace: 'on-first-retry',

        // 失败时截图
        screenshot: 'only-on-failure',

        // 失败时录制视频
        video: 'retain-on-failure',

        // 浏览器视口大小
        viewport: { width: 1280, height: 720 },
    },

    // 测试项目配置
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // 可选：添加更多浏览器
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],

    // 注释掉自动启动服务器，需要手动启动开发服务器
    // 运行测试前先执行: npm run dev
    // webServer: {
    //     command: 'npm run dev',
    //     url: 'http://localhost:5173',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120 * 1000, // 2分钟超时
    // },
});
