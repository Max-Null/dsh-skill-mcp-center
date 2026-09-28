# Release Notes — @max-null/dsh-skill-mcp-center

## 0.5.2 (2026-09-29)

### 变更

- 放宽 `@deepseek-ai/dsh-*` 的版本范围：`peerDependencies` 与 `devDependencies` 中的
  `dsh-client-connection`、`dsh-host-apiproxy`、`dsh-skill`、`dsh-tools` 由 `^0.1.1-rc.1`
  改为 `>=0.1.1-rc.1 <0.3.0` —— 保留下限、只放宽上界，旧内核（0.1.7-rc.2）仍然满足。

### 为什么

- 内核侧逐个检查插件 `peerDependencies` 里的每个 `@deepseek-ai/*` 声明，判据是标准 semver：
  `semver.satisfies(runtimeVersion, requirement, { includePrerelease: true })`。
- `^0.1.1-rc.1` 展开为 `>=0.1.1-rc.1 <0.2.0-0`，对 `0.2.0-rc.1` 判 **false**；判定失败的插件
  会被**静默跳过**——不进 fiber graph，也不出现在「did not activate」列表里，用户侧的表现
  是「插件装了却毫无反应」，没有任何日志可查。
- `>=0.1.1-rc.1 <0.3.0` 在 semver 7.7.4 下对 `0.1.7-rc.2` 与 `0.2.0-rc.1` 均判 true（已实测）。

### 兼容性

- 无运行时行为变更：端点集合、请求体、响应信封与代码路径均未改，只是依赖声明放宽。
- 面板端与宿主端仍需同版本（传输策略见 0.5.1）。

## 0.5.1 (2026-09-17)

### 修复

- 修正 web 环境下设置面板的「加载失败：transport failure for /skill-mcp/listSkills: HTTP 405」。
  根因在宿主侧：`ctx.connection.rpc.handle()` 注册逻辑通道时会访问 `client-connection`
  未声明的 `webServer` 注入，cordis 属性代理抛错后注册静默失败（DSH 源码形态特有；
  打包内核形态不受影响）。上游报告：deepseek-ai/deepseek-harness discussions #6880。

### 变更

- 传输层改为双路径自适应：
  - 宿主提供 `connection.fetch.register` → 注册 `POST /api/skill-mcp` 精确路由
    （只写 Connection 自己的路由表，不触碰 `owner.webServer`）；
  - 宿主只提供逻辑通道注册表（老打包内核）→ 自动回退 `/skill-mcp`；
  - 浏览器侧先试新路由，**收到 404 才回退**（新路由未注册时 `/api/*` 是 404，根路径才是 405）。
- `connection` 服务改用 `ctx.inject(['connection'], cb)` 获取：它在插件 apply 时尚未就绪，
  且 `ctx.plugin(P)` 不等待依赖。

### 兼容性

- 无 API 变更：端点集合、请求体、响应信封（RpcResult）与 peer 依赖均未变。
- 面板端与宿主端需同版本升级（浏览器侧的传输策略随之切换）。

### 测试

- 新增 `tests/rpc-transport.test.ts`（8 条）：传输层选择、服务晚到时不抢先注册、
  路由派发、JSON 解析失败与引擎异常收敛为 `internal` 信封。
- 全量 18 条通过；`npm run typecheck` 无错。

### 验证

- web（源码形态）实测：`POST /api/skill-mcp` → 200，面板恢复，控制台 0 errors。
