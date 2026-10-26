# Tiangan Print Kiosk

基于 Electron + React + Vite + JavaScript 的 Windows 触摸屏文化互动应用。核心流程离线运行，使用公历出生日期计算日干，再通过本地配置查找串珠内容。

当前版本为 **0.1.0 基础原型**：三页流程、表单校验、日干计算、安全 Preload、浏览器预览和 Windows 打包配置已建立。视觉风格为临时排版；全部串珠数据为占位内容。已加入 **58 mm 小票预览和 Windows 驱动测试打印**，票面和条码均标注为测试用途，不是正式核销凭证。实机出纸效果尚待验收。

## 环境与启动

使用 **Node.js 24 LTS（含 npm）**。Windows Electron 开发请使用原生 Windows 终端。

```sh
npm ci
npm run dev:web        # 仅浏览器，http://127.0.0.1:5173
npm run dev:electron   # 自动启动 Vite 和 Electron，关窗后一起结束
```

`npm run dev` 等同于桌面开发。Vite 端口固定为 5173，端口占用会明确报错，避免桌面窗口连接到错误的开发服务。

```sh
npm run lint
npm test
npm run build          # 生成 dist/，不打包 Electron
npm run preview        # 预览生产前端，http://127.0.0.1:4173
npm start              # 加载已生成的 dist/，窗口模式
npm run start:kiosk    # 加载 dist/，Kiosk 模式
```

开发 Kiosk 可用 `npm run dev:electron -- --kiosk`。本地预览退出全屏可使用 Windows 的 Alt+F4；正式现场维护入口仍待确认。安装包默认以 Kiosk 模式运行。

开发窗口使用独立的用户配置目录和单实例锁，可与已打包程序同时运行。缓存与窗口配置不包含本应用主动保存的参与者表单。

## Windows 打包

在原生 Windows x64 环境运行：

```sh
npm run pack:win       # 生成 release/win-unpacked/，用于集成检查
npm run dist:win       # 生成 release/ 下的 NSIS 安装包
```

当前打包为本地调试版本，未配置发布签名。安装包、图标、安装与卸载、正式设备系统版本均需现场验收。不要把 release/ 或 dist/ 提交到 Git。

打包脚本会复用当前 Windows x64 的 Electron 二进制，首次需要下载；脚本会拒绝在 Linux 或其他架构误用 Windows 打包入口。浏览器开发与构建仍可跨平台运行。

再次构建前，请先关闭从同一输出目录运行的程序，以便 Windows 允许替换可执行文件。

本次本机工具未写入系统目录；若当前终端没有 npm，可在项目目录执行 `./.tools/bin/npm.cmd run dev:electron`。`.tools/` 是忽略的本机工具目录，不会上传；其他机器与 Codex Cloud 使用正常安装的 Node.js 24 和 npm。

## Codex Cloud / Linux

将 GitHub 仓库连接到云端开发环境，以 **仓库根目录** 作为工作目录，而不是本机的父目录。

```sh
npm ci
npm run lint
npm test
npm run build
npm run dev:web -- --host 0.0.0.0
```

浏览器预览不需要启动 Electron，也不依赖系统打印机。无桌面环境时不能用 `npm run dev` 替代 `dev:web`；Electron GUI、Windows 驱动、触摸键盘和热敏打印在 Windows 本地验证。不要为了安装成功而全局关闭证书检查或 Electron 沙箱。

代码通过普通 Git 分支、提交和 PR 同步；Windows 拉取同一提交后验证。仅在用户明确要求时 push GitHub，不在每次修改后自动推送。Node 依赖通过锁文件重新安装，不跨系统复制 node_modules。当前没有配置云服务、远程数据保存、自动发布或复杂 CI/CD。

## 当前行为与暂定规则

- 欢迎 → 七项信息表单 → 日干与串珠结果 → 完成后回首页。
- 昵称、出生日期必填，其余选填；部分填写出生时间时要求同时提供小时和分钟。
- 点击昵称打开离线中英触摸键盘：中文单字拼音选字、候选翻页、英文大小写、数字符号与光标编辑；最多24个字符。样式和布局均可定制，见 [键盘说明](docs/KEYBOARD.md)。
- 日期范围暂为 1900-01-01 至运行设备的当天。仅按输入年月日计算日干，不转 UTC、不作出生地时区校正。
- 出生地点和现居地共用中国离线地点索引，支持国家 → 省级行政区 → 城市／地区联动，以及按名称、完整路径或代码搜索。包含34个省级选项、333个地级行政区，以及直辖市、省直辖县级地区和港澳台的相应选择。
- 选出生城市时建议 IANA 时区，也可手动调整；更改上级地点会清空下级与原时区建议。时区不参与计算，不展示历史 UTC 偏移。目前不开放其他国家。
- 所有十天干暂时共用一颗“测试串珠 A”，用于验证多对一配置，**不代表正式映射**。
- 所有参与者信息仅保存在内存。返回首页、完成、连续 120 秒无输入、重启或渲染进程重载后清空；不收集统计、不写入日志或远程数据库。
- Electron 仅暴露读取运行环境与窄范围测试打印接口。浏览器可预览测试票，不能提交到打印机；打印任务由主进程创建并持久化最小状态，不保存昵称或出生日期。

## POS58 打印测试

在安装了打印驱动的 Windows 电脑上启动 Electron，完成一次体验后，在结果页查看小票预览并点击“打印测试票”。主进程从 Windows 打印机列表查找 `POS58 Printer`（名称中的空格不影响匹配），用静默模式提交 58 × 156 mm 的测试票。浏览器预览中的 `TEST-PREVIEW` 只供排版检查，Electron 预览与提交使用同一个主进程生成的 `TEST-` 条码值。测试票写明不可核销。

请核对是否仅打印一张、纸宽/留白/裁切、中文及细线清晰度，并扫描条码与票面字符串逐字对照。Electron 的“已提交”仅指打印调用成功，不证明实物已经出纸。任务记录保存在 `userData/print-jobs`，只含测试任务 ID、条码、时间、版本、状态和尝试次数。结果不明时不会自动重打。当前没有补打或正式核销功能。详细步骤见 [打印测试说明](docs/PRINT_TEST.md)。

## 目录

```text
electron/  主进程、Preload、来源校验
src/       React 页面、控件、临时样式、浏览器接口
shared/    日期、日干、内容查询、表单与会话逻辑
content/   天干/串珠配置、中国地点索引与时区
scripts/   跨平台桌面开发启动脚本
tests/     Node 内置测试运行器的业务测试
docs/      开发计划与验收清单
```

`content/fortune.json` 分为 stems、beads、assignments 三部分，支持多个天干对应同一串珠。正式图片、字体和文案均应随包离线提供。

地点数据的来源、覆盖范围、特殊层级和手动更新方式见 [地点数据说明](docs/LOCATION_DATA.md)。运行应用不调用在线地点服务。

## 验证边界

自动测试覆盖日期边界、昵称与时间校验、连续天干循环、不同进程时区下结果一致、配置完整性、会话清空和允许加载的 URL。固定日干样本取自 lunar-javascript 公开示例，仅是回归样本；**独立历书核对尚待正式验收**。

浏览器/桌面操作、安装包和硬件的本次检查记录见 [开发检查记录](docs/VERIFICATION.md)。后续阶段及打印约束见 [开发计划](docs/PLAN.md)。
