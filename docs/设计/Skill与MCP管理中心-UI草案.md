# Skill & MCP 管理中心 — UI 草案

> 版本：v0.1（草案）
> 日期：2026-08-17
> 关联：`Skill与MCP管理中心-前置设计.md`
> 可视 demo：`Skill与MCP管理中心-UI草案.html`（浏览器打开，可切 tab / 增删 server / 切主题）

---

## 〇、取色约定（硬约束，同插件中心）

组件样式**只允许 `var(--dsw-*)` 引用 token，禁止任何字面量颜色**（hex/rgb/命名色）。token 由 `ui-theme` 的 `design-platform.css` 提供，本插件不自己定义，皮肤插件覆盖 token 时颜色自动跟随。

常用 token 速查：背景 `--dsw-alias-bg-base` / `-layer-1/2/3` / `-module-platform`；边框 `--dsw-alias-border-l1/l2/l3`；文字 `--dsw-alias-label-primary/secondary/tertiary/caption`；强调 `--dsw-alias-state-business-primary`；状态 `--dsw-alias-state-error/success/warn-primary`；交互 `--dsw-alias-interactive-bg-hover/active`。

---

## 一、布局草图（详见 HTML demo）

本插件有两个落点：**设置分区**（管理，静态）+ **右侧边栏 tab**（状态，动态跟随会话）。

### 1.1 设置分区「Skill & MCP」

复用设置面板 chrome：左侧 `settings.section` 导航 + 右侧内容列。内容列内两个 tab：

```
┌ 设置面板 ──────────────────────────────────────────┐
│ ┌导航┐ ┌内容列──────────────────────────────┐      │
│ │通用│ │ Skill & MCP                          │      │
│ │模型│ │  [Skill] [MCP]           ← 两个 tab  │      │
│ │Skill│ │ ────────────────────────────────    │      │
│ │& MCP│ │                                     │      │
│ │插件│ │  (Skill 卡片列表 / MCP server 卡片)   │      │
│ │中心│ │                                     │      │
│ └────┘ └─────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

### 1.2 Skill tab — 只读卡片

每个 skill 一张卡片：**名字 + 描述** → **source badge**（system/user/workspace/preset/runtime）→ provider → 操作（展开看 content / 定位文件）。

- 启停按钮**置灰**，hover 提示「官方 `ctx.skills` 暂无持久化启停 API」（前置设计 D6）。
- source badge 五色映射：`system` 灰、`user` 蓝、`workspace` 绿、`preset` 橙、`runtime` 紫。

### 1.3 MCP tab — server 管理（热生效）

顶部「+ 添加 server」按钮 → 展开表单；下面 server 卡片列表。

- **表单**：transport 单选（stdio / streamable-http）切换字段——stdio 显示 `command` / `args` / `cwd`；streamable-http 显示 `url` / `headers`。`serverName` 必填（校验 `[A-Za-z0-9_-]{1,32}`）。
- **卡片**：`serverName` + transport badge + 目标（command 或 url）+ fiber 状态点 + 工具数 + 编辑/删除。
- 增删改**立即生效**（`ctx.loader.create/update/remove` 热生效，前置设计 D4），操作后 toast「已热生效，免重启」。

### 1.4 右侧边栏「MCP」tab（状态，跟随会话）

`dsh-better-sidebar.registerTab` 注册，`single: true`，`component({ visible })` 可见才 1s 轮询、不可见停（同 SSiD 的 `GuardianView`）。

```
┌ 右侧边栏 · MCP tab ────────┐
│ ● filesystem     12 tools  │  ← 绿点 = 已连接 + 工具同步
│ ● github         23 tools  │
│ ○ memory         0 tools   │  ← 灰点 = 已配置但未同步
│ ✕ old-server     failed    │  ← 红点 = fiber failed
│  ──────────────────────────│
│ （空态：未配置 MCP server） │
└────────────────────────────┘
```

状态点三色：**绿**（`fiber active` 且 `mcp__` 工具数 > 0）、**灰**（已配置但无工具）、**红**（`fiber failed`）。这是间接推断（前置设计 D5），每行 hover 提示「fiber 状态 + 已注册工具数」。

---

## 二、错误码

host loopback RPC 的失败一律结构化错误码，浏览器据 code 展示、不解析 message：

| code | 含义 | UI 动作 |
|---|---|---|
| `skill-load-failed` | `ctx.skills` 读取失败 | 空态 + 重试按钮 |
| `skill-not-found` | 指定 skill 不存在 | 提示并刷新 |
| `mcp-not-found` | server entry 不在 Loader 树 | 提示并刷新 |
| `duplicate-server-name` | serverName 已存在 | 表单内联报错 |
| `mcp-create-failed` | 添加失败（连接失败 / 校验） | toast + 保留表单 |
| `mcp-update-failed` | 修改失败 | toast |
| `mcp-remove-failed` | 删除失败 | toast |
| `bad-request` | 参数校验失败 | 表单内联报错 |
| `unauthorized` | 非 loopback 调用 | 拒绝 |

---

## 三、API 字段 schema（host RPC 返回）

### 3.1 Skill

```ts
interface SkillSummary {
  name: string             // skill 名（/skill-name 的 name）
  description: string
  source: 'system' | 'user' | 'workspace' | 'preset' | 'runtime'
  provider: string         // 提供方（filesystem / runtime / …）
}
```

### 3.2 MCP server（配置态）

```ts
interface McpServer {
  id: string               // Loader entry id
  serverName: string       // mcp-client config.serverName
  transport: 'stdio' | 'streamable-http'
  command?: string         // stdio
  args?: string[]
  cwd?: string
  url?: string             // streamable-http
  fiberPhase: string | null
}
```

### 3.3 MCP 状态（运行时态）

```ts
interface McpServerStatus {
  serverName: string
  fiberPhase: string | null
  toolCount: number        // ctx.tools 里 mcp__<server>__* 前缀工具数
  connected: boolean       // fiber active && toolCount > 0（推断）
}
```

### 3.4 主要 RPC 方法

| 方法 | 入参 | 返回 |
|---|---|---|
| `listSkills()` | — | `SkillSummary[]` |
| `getSkill(name)` | `{ name }` | `SkillDefinition`（含 content） |
| `listMcpServers()` | — | `McpServer[]` |
| `createMcpServer(config)` | `{ serverName, transport, … }` | `{ ok, id }` |
| `updateMcpServer(id, config)` | `{ id, config }` | `{ ok }` |
| `removeMcpServer(id)` | `{ id }` | `{ ok }` |
| `mcpStatus()` | — | `McpServerStatus[]`（侧边栏 1s 轮询） |

---

## 四、已确认（2026-08-17）

1. Skill tab 启停按钮置灰（官方 `ctx.skills` 无持久化 toggle API）✅
2. MCP 增删改热生效（走 `ctx.loader.create/update/remove`，免重启）✅
3. 侧边栏 MCP tab 可见才轮询（1s）、不可见停，`visible` 语义同 SSiD ✅
4. 取色全 `var(--dsw-*)` 引用，兼容 skin 插件 ✅（见 §〇）
5. 状态点三色：绿（connected）/ 灰（已配置未同步）/ 红（failed）✅
6. MCP 状态为间接推断（fiber + `mcp__` 工具数），每行 hover 标注来源，不伪装精确 ✅
