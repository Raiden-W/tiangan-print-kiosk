# 基础版本检查记录

此文件只记录实际完成的验证。尚未验证的事项不视为通过。

## 自动检查

2026-10-22，Windows x64，Node.js 24.19.0：

| 检查 | 结果 |
| --- | --- |
| npm run lint | 通过，零警告 |
| npm test | 8 项通过 |
| npm run build | 通过，全部资源本地打包 |
| npm audit --omit=dev | 已报告的运行依赖漏洞为 0 |

构建目前有单个 JS chunk 超过 500 kB 的体积提示（约 541 kB，gzip 约 176 kB），未影响本地离线运行；首版未为此增加拆包逻辑。

## 本地集成

Playwright 浏览器检查通过：空表单校验、部分时间校验、城市建议时区、手动调整时区不改变日干、结果展示、完成清空、断网后再次走通流程、120 秒闲置清空。390 / 800 / 1280 px 三种宽度下，表单和结果没有横向溢出；已查看欢迎页、表单与结果截图。

Windows Electron 检查通过：Preload 运行环境接口、contextIsolation=true、nodeIntegration=false、sandbox=true、三页流程、昵称/日干结果、打印按钮禁用、完成与页面重载后的清空；检查过程中没有页面脚本异常。

桌面开发脚本已验证：自动启动 Vite 与 Electron，实际加载开发页面，关窗后 Vite 一起退出。开发配置与单实例锁已与打包版本隔离；缓存、构建和截图目录已排除在 Vite 监听之外。

`npm run pack:win` 通过。打包后的程序已启动并完成同一流程检查，Kiosk 模式为 true，安全设置保持生效。打包脚本复用已经下载的 Electron 二进制，避免当前环境下载解压阶段的临时目录重命名问题。

NSIS 安装包已成功生成，输出为 `release/installer-check/Tiangan Print Kiosk Setup 0.1.0.exe`。为保留当时已从资源管理器打开的程序，检查使用独立输出目录；未关闭该用户窗口。尚未实际安装或卸载应用，也没有配置项目发布签名。

安装包检查命令（前端已先构建）：

```sh
node node_modules/electron-builder/out/cli/cli.js --win --x64 --publish never --config.electronDist=node_modules/electron/dist --config.directories.output=release/installer-check
```

默认 `npm run dist:win` 的第一次检查在旧 Vite 监听仍持有缓存文件时遇到解压重命名失败；排除生成目录并关闭旧监听后，上述独立目录构建已通过。标准脚本使用相同 NSIS 目标和 Electron 配置，默认输出到 release/。

Linux / Codex Cloud 尚未实机执行；仓库已提供对应环境的安装、浏览器预览和检查命令。所有已记录的运行检查均来自本机 Windows。

## 仍需现场确认

- 独立历书核对与正式串珠内容。
- Windows 触摸键盘、中文输入、触摸日历、最终分辨率与方向。
- 真实热敏打印、纸张尺寸、条形码扫码、缺纸、断连和切纸。
- 最终安装/卸载、正式 Kiosk 维护入口、断电恢复和整场活动时长运行。
