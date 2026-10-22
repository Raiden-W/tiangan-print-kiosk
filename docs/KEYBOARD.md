# 昵称触摸键盘

昵称字段使用 `react-simple-keyboard@3.8.286`，中文候选来自 `simple-keyboard-layouts@3.4.273` 的 Chinese 布局。两者均为 MIT；依赖固定版本并随应用打包。仅导入中文词典，运行时不请求 CDN、翻译或输入法服务。

选型依据：React 集成、Pointer Events 触摸按键、可配置布局，以及直接暴露 DOM/CSS 的 `theme`、`buttonTheme` 和 `buttonAttributes`。无需修改第三方库即可调整视觉。上游说明：[React 组件](https://github.com/hodgef/react-simple-keyboard)、[布局与候选数据](https://github.com/simple-keyboard/simple-keyboard-layouts)、[按键主题](https://hodgef.com/simple-keyboard/documentation/options/buttontheme/)。

## 使用方式

- 点击昵称输入框或“键盘”按钮打开。底部模态面板中包含编辑框，不会被自身按键遮挡；“完成”收起并保留已经输入的昵称。
- 中文使用不带声调的**单字全拼**，`ü` 写作 `v`，点选候选字后再输入下一字。候选支持翻页，空格选当前拼音的第一个候选。
- 词典为固定候选顺序，覆盖常用简体字；目前不支持连续整句拼音、智能联想、用户词库或所有生僻姓名字。
- 拼音在独立的待选区，选字前不会写入昵称。待选状态下点击完成、切换语言/符号会提示先选字或取消拼音；退格优先删除拼音。“取消拼音”保留已经提交的昵称。
- English 支持大小写；123 页提供数字、常用符号。左右箭头移动光标，支持选择文字后替换，清空会删除昵称和待选拼音。
- 限制与表单一致：最多 24 个 Unicode 码点。虚拟退格和光标按完整字素移动，避免将 emoji 或组合字母拆开。物理键盘和系统 IME 仍可编辑，IME 组合结束时应用长度限制。
- 使用原生 `dialog.showModal()` 管理焦点和页面交互，Escape 可关闭并丢弃未选拼音。`inputMode="none"` 用于提示系统不要同时弹出触摸键盘；Windows 实机仍需验证系统键盘策略。
- 昵称、待选拼音和键盘状态只在内存中。新打开默认中文；退出体验、完成、闲置 120 秒或刷新后清空参与者信息。没有输入日志、学习记录或浏览器持久化。

## 修改视觉

主样式入口为 `src/styles/keyboard.css`，不导入厂商默认主题，也不改 node_modules。

| 入口 | 用途 |
| --- | --- |
| `.nickname-keyboard` 的 `--keyboard-*` CSS 变量 | 面板/按键背景、文字、强调色、边框、圆角、间距、键高和字号 |
| `.keyboard-toolbar` / `.keyboard-languages` | 标题、语言切换、完成按钮 |
| `.keyboard-composition` / `.keyboard-candidate-*` | 拼音、取消按钮、候选字和页码 |
| `.kiosk-keyboard-keys .hg-row` / `.hg-button` | 键盘行、普通按键和按压反馈 |
| `.keyboard-key-function` / `[data-skbtn='{space}']` | 功能键配色和空格宽度 |
| `src/components/nicknameKeyboard.js` 的 `nicknameLayouts` | 字母、大小写、数字符号的行与键序 |
| `src/components/NicknameKeyboard.jsx` 的 `display` / `buttonTheme` | 按键文案和特殊按键类别 |

默认按键高 54 px，窄屏为 48 px。390 px 窄屏每行字母多，键宽较小；正式 kiosk 按实际尺寸、方向及设计重新验收触摸目标。候选在窄屏换为两行。

键盘库仅处理按键交互；应用使用独立的候选栏和待选拼音状态，以便固定候选栏位置、单独设计样式，并防止拼音误写入昵称。库的内部文本写入和内置浮动候选框均关闭，长度与光标逻辑集中在 `shared/nickname.js`。

## 验证

Node 测试覆盖实际离线词典的常用拼音、ü、选区替换、字符上限及 emoji/组合字退格。生产页面的浏览器触摸模拟覆盖中英混输、候选翻页、数字符号、光标、离线、完成/闲置清空，以及 390/800/1280 px 布局。Electron 中验证了中英输入与会话流程，开发 StrictMode 下也完成选字。

自动化触摸模拟不能代替一体机的触控驱动、系统软键盘是否重复弹出、实际按键命中率与长时间运行验证。本轮未重新生成 Windows 安装包。

键盘与上游拼音数据的许可保留在 `public/KEYBOARD_LICENSES.txt`，Vite 会复制进 dist 并随应用分发。
