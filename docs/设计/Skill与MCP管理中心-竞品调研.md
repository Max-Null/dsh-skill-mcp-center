# Skill & MCP 管理中心 — 竞品调研

> 日期：2026-08-17
> 关联：`Skill与MCP管理中心-前置设计.md`、`Skill与MCP管理中心-spike记录.md`
> 结论：竞品已把两个「官方无 API」的难点各给出一个可行解，本设计据此**修正 D5 / D6 并新增「启停」维度**。

---

## 一、竞品清单与定位

| 竞品 | star | 定位 | 对本设计的价值 |
|---|---|---|---|
| [PerryLink/dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | 8 | MCP 控制台（`/mcp` 命令 + 设置 tab + CRUD + tool trial + 健康诊断） | ⭐ 架构参考 + 安全写 + feature detection |
| [lilyblessing/dsh-mcp-skill-panel](https://github.com/lilyblessing/dsh-mcp-skill-panel) | 1 | MCP + Skill 综合启停面板（+ 可选 AI 中间层） | ⭐ skill/MCP 启停的技术解 |
| [Js2Hou/dsh-mcp-manager](https://github.com/Js2Hou/dsh-mcp-manager) | 5 | MCP 可视化管理（增删 + 启停 + 实时连接状态） | MCP 管理 UI 参考 |
| [AKS1st/dsh-skill-manager](https://github.com/AKS1st/dsh-skill-manager) | 1 | Skill 管理页（分组 + 文件树 + zip 导入导出） | skill 分组 + 文件操作 |
| [YTxue/dsh-skill-manager-ytxue](https://github.com/YTxue/dsh-skill-manager-ytxue) | 7 | skill 启停 + DSH-spec 检查 + 自动修复 | skill 启停 + 校验 |

## 二、关键技术解（两个「官方无 API」难点的答案）

### 2.1 MCP 状态 —— PerryLink 的 feature detection

PerryLink 声称读官方 `mcp/status` seam（event + `ctx.mcpStatus` service），但其 `src/upstream.ts` 实际是**提前声明 + 运行时 feature detection + 优雅降级**：

- 声明 merge 进 `@deepseek-ai/cordis`：`mcp/status` event + `ctx.mcpStatus` query service（type-level）。
- **实测核实**：当前 GitHub master 与 npm `0.1.0-rc.7` 的 `dsh-mcp-client` **都还没有** `status.ts` —— 官方尚未 ship 这个 seam。
- 所以 PerryLink 当前实际走 **derived 降级**（`statusSource: 'derived'`），和我 spike 的「间接推断」一致；它只是为官方未来 ship 后自动切换留了接口。

**借鉴**：本设计也做 feature detection——优先读 `ctx.mcpStatus`（若存在），否则回退到 `entry.fiber.state` + `ctx.tools.schemas()` 的 `mcp__` 前缀推断。这修正 D5 的表述：不是「永远间接」，而是「feature detect + 降级」。

### 2.2 skill 启停 —— `disable-model-invocation` frontmatter

官方 `skill-filesystem` 支持 SKILL.md 的 frontmatter 字段 `disable-model-invocation`（`src/index.ts:996-999`）：

```
disable-model-invocation: true   →  modelInvocable: false（模型 catalog 失效）
```

lilyblessing 的 skill 启停就是**往 SKILL.md frontmatter 注入/移除这个字段**。这**推翻了 D6「skill 启停暂缓」**——启停有官方支持的落点，只是官方没做 GUI。

**借鉴**：user / workspace skill 改 frontmatter 实现启停（模型层面），system / preset 只读（不可写）。

### 2.3 MCP 启停（enable/disable，区别于增删）

lilyblessing 把「启停」和「增删」分开：停用 = loader entry 卸载（断开连接 + 注销全部 `mcp__*` 工具，schema token 即时释放），启用 = 重连 + 恢复工具，**均免重启**。这是增删之外的第三维。

## 三、功能层面可借鉴点

| 借鉴点 | 来源 | 说明 |
|---|---|---|
| **tool trial console** | PerryLink | 选 server → `mcp__*` 工具 → JSON args → 走 `ctx.tools.execute()` 官方 pipeline（权限 + approval 生效），面板展示结果、不进模型 context |
| **健康诊断** | PerryLink | ENOENT/ECONNREFUSED/timeout/401/403/404/DNS/rate-limit 分类 + self-heal 建议（`/mcp <srv> health`） |
| **安全写** | PerryLink | cordis.yml 写回是 approval-gated + 自动时间戳备份；表单预览 patch 片段 |
| **停用态回填** | lilyblessing | 停用的 MCP 卡片仍显示 last-good 工具数/token 快照，决策是否启用有依据 |
| **事件驱动失效** | lilyblessing | 监听 `tools/change` / `skills/change` 事件刷新，避免轮询 |
| **skill 分组** | AKS1st | system / user / workspace / preset 分层，system+preset 只读 |
| **zip 导入导出 + 文件树编辑** | AKS1st | 导入 zip 装 skill、导出、展开文件树在线编辑、两步删除确认 |
| **乐观更新** | lilyblessing | 开关点击即翻转（乐观更新 + 服务端确认） |

## 四、设计修正（据此更新前置设计）

| 决策 | 原结论 | 修正 |
|---|---|---|
| D5 | MCP 状态「间接推断」 | **feature detection + 降级**：优先 `ctx.mcpStatus`（未来官方 seam），否则 fiber + `mcp__` 工具数 |
| D6 | skill 启停「暂缓」 | **可做**：user/workspace skill 改 `disable-model-invocation` frontmatter；system/preset 只读 |
| （新增） | 无 | **MCP 启停维度**：增删之外加 enable/disable（卸载 entry 释放 context / 重连恢复），免重启 |
| （新增） | 无 | 借鉴 tool trial、健康诊断、安全写（备份）、停用态回填、事件驱动失效 |

## 五、定位结论

本插件不做「又一个 CRUD 面板」，而是取竞品已验证的技术解 + 本设计的分层范式（管理放设置、状态放侧边栏），差异化为：

1. **MCP 启停**（enable/disable，区别于增删）—— 释放 context 的核心价值。
2. **skill 启停**（`disable-model-invocation` frontmatter）—— 竞品已验证，官方无 GUI。
3. **状态放侧边栏**（跟随会话）—— 本设计独有，竞品都把状态塞设置页。
4. **安全写**（approval + 备份）—— 借鉴 PerryLink，写 cordis.yml 不裸写。
