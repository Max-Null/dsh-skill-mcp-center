# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与[语义化版本](https://semver.org/lang/zh-CN/)。

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
