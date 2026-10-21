# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与[语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed

- **代码注册的 skill 不再把空路径发给 `readSkill`**：`ctx.skills.register()` 注册的条目（office 系列、`browser-skill`、`diagnose-windows-sandbox-acl` 等）没有 `SKILL.md`，`listSkills` 对它们一律报 `path: ''`。设置页此前无条件渲染「查看 SKILL.md」，点下去就是 `readSkill: path is required` 红字。现在这些条目不渲染该按钮，改为显示「无 SKILL.md」徽章，路径行也写同样的话，不再留一个空白让人以为加载失败。
- **运行时 skill 不再共用同一个展开/阅读身份**：`expanded` 与 `mdPath` 都拿 `s.path` 当 key，而所有代码注册条目的 `path` 都是空串——点开一张卡，同组的卡全部跟着展开。新增 `skillKeyOf()` 给无文件条目一个 `\0runtime:<name>` 形式的稳定别名（NUL 不会出现在路径里，因此不会与真实路径相撞），磁盘条目仍以路径为身份。侧栏的 React key 一并改用它。

## [0.6.1] - 2026-10-18

### Fixed

- **skill 列表补上「代码注册」的条目**：用 `ctx.skills.register()` 注册的 skill（office 系列、jubensha 的 DM 手册、genui 等）没有 `SKILL.md`，而本插件此前只做磁盘扫描，于是面板一律不显示它们——用户在 2026-10-18 报「skill 列表少了很多」。现在在磁盘结果之后追加一次 `ctx.skills.list()` 补齐（skills 服务不存在时静默跳过，不改变既有行为），这些条目标 `writable: false`。
- **侧栏按来源分组**：项目级 / 用户级 / 插件自带 / 内置（DSH 官方）/ 代码注册，各组带数量、空组不渲染。「代码注册」组下方标注「由插件在运行时注册，不可在此禁用」，且组内条目不渲染开关——此前那排开关点上去会把空路径发给 `toggleSkill`。
