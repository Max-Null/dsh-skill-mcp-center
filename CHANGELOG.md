# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与[语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.8.2] - 2026-11-23

### Fixed

**profile 层的顶格覆盖不再被当成面板可解除**（issue #6 的 `LingYingNX` 在官方桌面端实测发现）。0.8.1 的 `patchDisableState()` 同时读 profile 与 home 两个文件，却只按「是不是顶格块」判断归属，没记这个块来自哪个文件；而解除只删 **home 层**的块。于是 profile 里手写的 `- id: ui-schedule / disabled: true` 会被报成 `permanentDisabled: true`，面板给它一个「解除持久禁用」按钮，点了返回 `changed: false`、文件一动不动——**正是这个功能要消灭的那种假按钮**。

现在 `panelOwned` 只对 home 层成立：profile 层的顶格覆盖仍算 `pinnedInPatch`（重启后仍然关），但归到只读说明里，面板不去替用户改 profile。

## [0.8.1] - 2026-11-20

### Fixed

**手写在 `insert` 子条目里的 `disabled: true` 不再被当成面板可解除的持久禁用**。0.8.0 读取时把任何可写层里的字面 `disabled: true` 都算作 `permanentDisabled`，而解除只删顶格覆盖块——于是按 issue #6 的 workaround 手写过的条目会显示「解除持久禁用」，点了却提示「配置文件已是目标状态」，条目仍然是禁用的。

`McpServer` 现在区分两个字段：`permanentDisabled` 只表示**面板拥有的**那种（顶格 `- id:` 覆盖块里字面 true，面板能改写），新增的 `pinnedInPatch` 表示**任何来源**的持久禁用（含 `insert` 子条目）。手写的条目显示「已由 cordis.patch.yml 手动禁用……要重新启用请直接改那个文件」，开关与按钮都置灰，面板不代劳。

## [0.8.0] - 2026-11-15

### Added

**MCP 的「永久禁用」按钮**：面板的启停只改内存树（宿主把 Loader 根树的 `write` 做成空实现），重启即恢复；卡片上多一个按钮，把 `disabled: true` 钉进 **home 层** `$DSH_HOME/cordis.patch.yml`，重启后仍然关。再点「解除持久禁用」删掉那两行，恢复启用。

- 写 home 层而不是 profile 层：它在所有 bundle 层与当前 profile 层之后应用（later wins），并且不在 `profile-seed` 的改写范围内——profile 自己的 patch 会被 seed 按模板归属退役掉出厂条目（`apps/desktop/src/ssid/profile-seed.ts` 的 `owned` 判据），而 SSiD 出厂的三个 MCP 条目恰好在 `owned` 里。
- 只追加/删除顶格的 `- id: <id>` 覆盖块，**从不改动 `insert` 子条目内的任何字段**：真机上的 `disabled:` 是 `!!js` 条件表达式（CLI 缺失即停用，否则整棵插件树加载失败），就地改写会毁掉那次求值，解除时删整行更会让条目永远启用。
- 按行编辑，保留注释、空行、字段顺序与 CRLF；解除后文件逐字节还原；写入走临时文件 + `rename`，失败清理临时文件。
- 运行时 id 带 `include:` 前缀（根 Include 的 id 是 `include`），写入时逐层剥到文件里的裸 id；同 id 多次出现时改最后一个（`applyEntryPatches` 的 `entryMap` 是后者覆盖前者）；`- id: x # 注释` 可定位。
- `McpServer` 新增 `permanentDisabled` 与 `createdThisRun`。持久禁用时普通开关置灰（先解除才能重新启用），配合 0.7.0 的 `sessionToggled` 让三种「关」各自可读。条目来自包内置 patch 同样可钉住；本次运行从面板新建的条目按钮置灰并说明原因。
- 新增端点 `setMcpServerPermanent` 与 19 条测试。

### Changed

卡片顶部说明从「要长期禁用，给该条目加 `disabled: true`」改为指向新按钮。README 的 MCP 管理条目补上效力边界：增删改与普通开关都只作用于本次运行。

## [0.7.1] - 2026-11-13

### Fixed

**设置页导航图标改成注册宿主的 `settings.section.icon` 插槽**（DSH 0.2.2-rc.1 起提供）。

旧方案用 `MutationObserver` 按 label 标记导航行、`::before` mask 画扳手、并隐藏导航按钮的直接子 svg。0.2.2-rc.1 把图标包进 `span.navIcon` 之后，`> svg:first-child` 不再命中，齿轮重新露出来，设置页「Skill & MCP」一行会同时显示扳手和齿轮。现在按 section id 注册图标组件（宿主按 `size` 缩放、用它替代默认齿轮），旧的 DOM 钩子与那份 CSS 一起删除。

**代价（有意为之）**：内核低于 0.2.2-rc.1 没有该插槽，图标退回宿主默认齿轮；2026-11-13 明确不做旧内核降级。

## [0.7.0] - 2026-10-26

### Added

**插件包内的技能可以启停了**（`#1` 的后半段）。它们没有可写的 `SKILL.md`，改名 / 移出目录 / 断链对安装内容都不生效（社区同类项目因此只能显示「内置只读」）。现在走 registry 的 rank 遮蔽：

- **停用**：`ctx.skills.register()` 一个同名占位技能——runtime rank 250 赢过包内 provider ≈550 与 bundled 600，两个 invocation 都设为 false。技能仍在 catalog 里、仍可被面板列出，但模型与人都调不到它。
- **启用**：调 disposer，恢复原本的 provider。
- 停用清单落在 `$DSH_HOME/skill-mcp-center/disabled-skills.json` 并在启动后重放——registry 不提供「查看被遮蔽定义」的 API，不落盘就等于重启即失忆。
- 面板的 `enabled` 只在「清单里有 **且** 占位注册成功」时为 false：同名冲突会让 `register()` 抛错，那时不能谎报禁用。

### Changed

- `SkillView` 新增 `enabled`；非磁盘技能（有路径但 `writable: false`）也显示开关，走新增的 `setSkillEnabled` RPC。
- README 截图段补 Skill 标签页的插件技能启停。

## [0.6.5] - 2026-10-25

### Fixed

- **README 的 MCP 截图重拍**：0.6.4 带的是整窗截图，把侧栏的会话标题一起框了进去；换成只含设置对话框的裁剪图（`[role="dialog"]` 的 boundingBox），内容不变。

## [0.6.4] - 2026-10-25

### Fixed

- **MCP 卡片的命令行不再渲染成 `[object Object]`**：`cordis.yml` 里的 `command` / `args` 可以是 `!!js` 表达式，`options.config` 上保留为 `{ __jsExpr }` 节点、求值结果在 `fiber.config` 上（与 `pluginSkillRoots` 同一个坑）。`listMcpServers` 原来照 options 读，`playwright-headless` 这类条目就显示成 `[object Object] {"__jsExpr":"…"}`。现在优先读 `fiber.config`，非字符串值再归一成字符串。

### Changed

- README 截图段补 MCP 标签页，含开关的效力边界说明与「本次运行已停用」的行内提示。

## [0.6.3] - 2026-10-25

### Changed

- **MCP 开关的效力边界写进界面**：DSH 的 `Loader.write()` 是空实现（`cordis-plugin-loader@1.0.2` 的 `lib/index.js:715` 就是 `write() {}`，源码注释写明「root tree is in-memory; writes are no-ops」），所以面板的启停只对本次运行生效，重启后从 `cordis.patch.yml` 重新加载、恢复启用（`#6`）。MCP 视图顶部现在写明这一点，被面板关掉且属于本次运行的条目显示「本次运行已停用 · 重启恢复」。
- `listMcpServers` 新增 `sessionToggled`：只有本运行内被面板改过开关的条目才为真。`cordis.patch.yml` 里 `disabled: true` 的条目是持久禁用，不能被标成「重启恢复」——两种「关」要能区分开。

## [0.6.2] - 2026-10-24

### Fixed

- **代码注册的 skill 不再把空路径发给 `readSkill`**：`ctx.skills.register()` 注册的条目（office 系列、`browser-skill`、`diagnose-windows-sandbox-acl` 等）没有 `SKILL.md`，`listSkills` 对它们一律报 `path: ''`。设置页此前无条件渲染「查看 SKILL.md」，点下去就是 `readSkill: path is required` 红字。现在这些条目不渲染该按钮，改为显示「无 SKILL.md」徽章，路径行也写同样的话，不再留一个空白让人以为加载失败。
- **运行时 skill 不再共用同一个展开/阅读身份**：`expanded` 与 `mdPath` 都拿 `s.path` 当 key，而所有代码注册条目的 `path` 都是空串——点开一张卡，同组的卡全部跟着展开。新增 `skillKeyOf()` 给无文件条目一个 `\0runtime:<name>` 形式的稳定别名（NUL 不会出现在路径里，因此不会与真实路径相撞），磁盘条目仍以路径为身份。侧栏的 React key 一并改用它。

## [0.6.1] - 2026-10-18

### Fixed

- **skill 列表补上「代码注册」的条目**：用 `ctx.skills.register()` 注册的 skill（office 系列、jubensha 的 DM 手册、genui 等）没有 `SKILL.md`，而本插件此前只做磁盘扫描，于是面板一律不显示它们——用户在 2026-10-18 报「skill 列表少了很多」。现在在磁盘结果之后追加一次 `ctx.skills.list()` 补齐（skills 服务不存在时静默跳过，不改变既有行为），这些条目标 `writable: false`。
- **侧栏按来源分组**：项目级 / 用户级 / 插件自带 / 内置（DSH 官方）/ 代码注册，各组带数量、空组不渲染。「代码注册」组下方标注「由插件在运行时注册，不可在此禁用」，且组内条目不渲染开关——此前那排开关点上去会把空路径发给 `toggleSkill`。
