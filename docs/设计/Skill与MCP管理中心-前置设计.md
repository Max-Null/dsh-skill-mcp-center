# Skill & MCP 管理中心 — 前置设计

> 版本：v0.1（前置研究）
> 日期：2026-08-17
> 状态：**待实现**（设计已落盘，未动代码）
> 关联：`docs/设计/DSH插件管理中心-前置设计.md`、`docs/设计/DSH记忆插件-前置设计.md`
> 结论绑定：DeepSeek Harness pre-release（HEAD `47f943859b` @ 2026-08-13，`0.1.0-rc.5`，无 tagged release）
> 参考实现：`dsh-ssid-panels`（同作者的 SSiD 面板，本设计的「设置页 + 侧边栏 tab」分离范式来源）

---

## 一、背景与目标

DSH 的 **skill** 和 **MCP** 目前只有底层基础设施，没有管理界面：

- **skill**：官方 `ctx.skills` service 提供了 `list()` / `get()` / `snapshot()` / `register()`，但没有 GUI。社区有 `dsh-skill-manager` 等补了「浏览/导入/删除」，但「启停」普遍受限于官方无 toggle API。
- **MCP**：官方 `@deepseek-ai/dsh-mcp-client` 是纯 function plugin（一个实例接一个 MCP server，配置写在 `cordis.yml`），**没有暴露任何状态查询 service**。社区有 `dsh-mcp-manager` / `dsh-mcp-panel` 补了「增删 + 连接状态面板」。

用户核心诉求是一个**分层判断**：

> 「skill 和 MCP 的**管理**像插件中心一样放设置里；但 **MCP 状态**放右侧边栏的状态区——MCP 状态是跟随会话的运行时态，放静态设置页里很别扭。」

本设计回答一个问题：**做一个「Skill & MCP 管理中心」——静态配置（管理）进设置页、动态运行时（状态）进右侧边栏，作为独立第三方插件（同 `dsh-ssid-panels` 的范式）。**

## 二、核心原则

1. **管理 / 状态分层**：静态配置（有哪些 server、怎么连、skill 有哪些）→ 设置页；运行时状态（连接中/已连接/工具数/重连次数）→ 侧边栏，跟随会话、可见才轮询。
2. **走官方扩展点**：skill 用 `ctx.skills`；MCP 管理用 `ctx.loader` 的 entry 增删改（热生效）；MCP 状态从 `entry.fiber` + `ctx.tools` 推断。
3. **复用 SSiD 范式**：`settings.section`（设置分区）+ `dsh-better-sidebar` 的 `registerTab`（侧边栏 tab，optional peer，未装侧边栏时设置页仍可用）。
4. **只读投影 + 显式变更**：状态永远只读展示；变更只走 loader entry 操作（create/update/remove + write），不手写 cordis.yml 文本、不绕过 loader。

## 三、现状能力映射（关键结论）

| 需求 | 官方 / 社区现状 | 本插件做法 | 难度 |
|---|---|---|---|
| skill 查看（列表/详情） | ✅ `ctx.skills.list()` / `get()` / `snapshot()` | 🔁 直接消费 | 低 |
| skill 启停 | ❌ 官方无 toggle API（只有 `register()` 的 disposer） | ⚠️ v1 只做查看 + 定位文件，启停暂缓 | — |
| MCP 增删改 server | ⚠️ 社区多手写 cordis.yml；官方 `ctx.loader.create/remove/update` 可热生效 | 🔁 走 loader entry 操作（**热生效，免重启**） | 中 |
| MCP 状态（连接/工具数/重连） | ❌ 官方 `dsh-mcp-client` 无状态 service | 🆕 从 `entry.fiber.state` + `ctx.tools` 的 `mcp__<server>__*` 前缀推断 | 中 |
| 侧边栏 tab | ✅ `dsh-better-sidebar`（`registerTab`，SSiD 已用） | 🔁 复用，optional peer | 低 |

> 图例：✅ 复用 / 🔁 带走概念重写实现 / 🆕 DSH 空白需新建 / ⚠️ 暂缓。

**关键结论 1**：MCP 管理**不需要手写 cordis.yml**。`ctx.loader` 的 `create()` 会立即 `init()` + `start()` 新 entry（热连接），`update()`/`remove()` 同样热生效并持久化——这是本插件相对社区 `dsh-mcp-manager` 的增量：**增删改 MCP server 免重启**。

**关键结论 2**：MCP 状态**只能间接推断**。官方 `dsh-mcp-client` 把连接状态锁在 `startConnection` 返回的 supervisor 内部、不对外，所以「精确的连接状态/重连计数」拿不到。v1 接受一个近似：`entry.fiber.state`（fiber 级）+ 已注册的 `mcp__<server>__*` 工具数（间接反映「工具同步成功」）。

## 四、插件设计（双面插件，独立仓库）

包名：`@max-null/dsh-skill-mcp-center`，仓库 `Max-Null/dsh-skill-mcp-center`，结构同 `dsh-plugin-center`（host TS + client 双面）。

### 4.1 组件划分

| 组件 | 职责 | 挂载的扩展点 |
|---|---|---|
| SkillService（host） | 消费 `ctx.skills`，转成富摘要（含 source/provider/可定位路径） | `ctx.skills` |
| McpService（host） | 遍历 `ctx.loader.entries()` 里 `name === 'mcp-client'` 的 entry，读 `config`（serverName/transport）+ `fiber` 状态；增删改走 `ctx.loader` | `ctx.loader` |
| McpStateService（host） | 汇总每个 server 的「fiber 状态 + 已注册 `mcp__` 工具数」，供侧边栏轮询 | `ctx.loader` + `ctx.tools` |
| loopback RPC（host） | 把上述能力暴露给浏览器 | `ctx.connection.rpc.handle`（同插件中心的 loopback 通道） |
| 设置分区（client） | 「Skill & MCP」设置页，两个 tab：Skill / MCP server 管理 | `settings.section` slot |
| MCP 状态侧边栏 tab（client） | 右侧边栏「MCP」tab，`visible` 时 1s 轮询状态 | `dsh-better-sidebar` 的 `registerTab`（optional peer） |

### 4.2 数据源细节

**skill**（只读）：
- `ctx.skills.list({ cwd })` → `SkillSummary[]`（name / description / source / provider）。
- `ctx.skills.get(name, { cwd })` → 完整定义（含 content，展开查看）。
- `source` 区分 system / user / workspace / preset / runtime（对齐官方 skill 分层）。

**MCP 管理**（热生效）：
- 列出：`ctx.loader.entries()` 过滤 `entry.options.name === 'mcp-client'`，读 `entry.options.config`（`transport` + `serverName` + `command/args/url` 等）。
- 新增：`ctx.loader.create({ id, name: 'mcp-client', config })` → 立即 init/start（热连接）。
- 改：`ctx.loader.update(id, { config })`。
- 删：`ctx.loader.remove(id)`。
- 三者都通过 `EntryTree.write()` 持久化回 cordis.yml。

**MCP 状态**（间接推断，v1 近似）：
- `entry.fiber?.state` → fiber 级状态（`active` / `failed` / `loading`）。
- `ctx.tools` 里 `mcp__<serverName>__*` 前缀的工具数 → 「工具已同步」的代理指标。
- 侧边栏展示：每个 server 一行「● 已连接 / 工具数 N」，`visible` 时 1s 轮询、不可见停。

## 五、UI 草案

### 5.1 设置分区「Skill & MCP」

一级 `settings.section`（同插件中心，和 General/Models 并列），两个 tab：

- **Skill tab**：`ctx.skills.list()` 卡片列表（name + description + source badge），展开看 content，附「定位文件」按钮。启停按钮置灰（官方无 API，见 §六）。
- **MCP tab**：server 卡片列表（serverName + transport + 目标），每卡「编辑 / 删除」，顶部「添加 server」表单（stdio：command+args；streamable-http：url）。操作后提示「已热生效」。

### 5.2 右侧边栏「MCP」tab

`dsh-better-sidebar.registerTab`，`single: true`，`component({ visible })` 可见才轮询。内容：每个 server 的状态点 + 工具数 + 最后连接结果。样式全 `var(--dsw-*)`，与 SSiD 面板一致。

## 六、边界与风险

1. **skill 启停走 frontmatter（已修正，见 D6）**：官方 `skill-filesystem` 支持 SKILL.md 的 `disable-model-invocation` 字段，改 frontmatter 即启停；但 system/preset skill 只读，且运行时 provider 注册的 skill 无文件可改，仍只读。
2. **MCP 状态 feature detection（已修正，见 D5）**：官方 `mcp/status` seam 尚未 ship（master/rc.7 均无 `status.ts`），当前走 `entry.fiber.state` + `mcp__` 工具数降级；未来官方 ship 后自动切精确值。
3. **MCP 热生效的边界**：`create()` 立即连接是预期行为，但「删除正在被会话使用的 server」会让已注册工具消失，需 UI 明确提示。
4. **`dsh-better-sidebar` 是第三方依赖**：作为 optional peer，未安装时侧边栏 tab 不注册、设置页仍可用（同 SSiD 的降级策略）。

## 七、决策记录

| # | 决策 | 理由 |
|---|---|---|
| D1 | 新独立插件 `@max-null/dsh-skill-mcp-center`，不并入插件中心 | 关注点分离：插件中心管「插件」，本插件管「skill + MCP」；同 SSiD 独立 panels 的先例 |
| D2 | 管理放设置、状态放侧边栏 | 用户拍板：状态是运行时态，塞静态设置页语义错位 |
| D3 | 侧边栏依赖 `dsh-better-sidebar`（optional peer） | 复用 SSiD 已验证的 `registerTab` 范式，不自造侧边栏 |
| D4 | MCP 管理走 `ctx.loader` 增删改（热生效） | 免手写 cordis.yml、免重启，比社区 `dsh-mcp-manager` 增量 |
| D5 | MCP 状态 feature detection + 降级 | 官方 `mcp/status` seam 未 ship（竞品调研核实），优先读 `ctx.mcpStatus`（若存在）否则 fiber + `mcp__` 工具数 |
| D6 | skill 启停用 `disable-model-invocation` frontmatter | 官方 skill-filesystem 支持该字段（竞品调研核实），user/workspace 可写、system/preset 只读 |
| D7 | MCP 启停（enable/disable）区别于增删 | 卸载 entry 释放 context / 重连恢复，免重启（借鉴 lilyblessing） |

## 八、下一步

1. ✅ 按 D1-D6 落 UI 草案（`Skill与MCP管理中心-UI草案.md` + 交互 HTML）。
2. ✅ spike：验证 `ctx.loader.create` 热连接 MCP、`ctx.tools` 前缀枚举、`dsh-better-sidebar.registerTab` 的 `visible` 语义 —— 结论见 `Skill与MCP管理中心-spike记录.md`，三点全通过、无阻塞。
3. ⏭️ 实现 host + client 双面，复用插件中心的 loopback RPC + `var(--dsw-*)` 样式范式。
