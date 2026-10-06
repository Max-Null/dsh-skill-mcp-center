# Release Notes — @max-null/dsh-skill-mcp-center

## 0.6.0 (2026-10-06)

### 新增

- **删除用户级 / 项目级技能**。设置页与侧栏的技能行都多了一个「删除」按钮，只出现在
  `writable` 的技能上 —— 也就是 `~/.dsh/skills`、`~/.agents/skills`，以及当前工作区的
  `<cwd>/.agents/skills` 与 `<cwd>/.dsh/skills`。插件技能与 DSH 官方内置技能（`plugin:` /
  `bundled` / `dsh-official`）保持只读，不出现该按钮。

  点删除先弹确认，写明技能名与完整路径；确认后该技能从磁盘移除 —— 目录形态
  （`<name>/SKILL.md`）删整个目录，平铺形态（`<name>.md`）删那个文件。

  **不直接销毁**：条目被移到 `~/.dsh/.skill-trash/`，成功提示里给出具体位置，误删可手动
  移回去。

### 兼容性

- 新增一个 RPC 端点 `deleteSkill`（`{ path, cwd? }`）；现有端点与请求信封不变。
- 删除面**刻意窄于**查看面：`readSkill` 接受插件与内置根，删除只接受用户级与项目级根，
  并且要求目标**正好是某个允许根的直接子项** —— 根自身、技能内部的嵌套文件、名字相近的
  兄弟目录一律拒绝（`skill-not-found`）。
- 新增 10 条测试：7 条覆盖删除目标的解析与拒绝面，3 条做真实文件操作（整目录 / 平铺 /
  拒绝后文件原样不动）。

## 0.5.4 (2026-10-04)

### 修复

- **插件用 `bundledSkillDir` 注册的技能扫不到**。面板原先只认一种形态：拿 loader
  entry 的 `name` 当包名，去拼 `<node_modules>/<包名>/skills`。插件若把官方
  `@deepseek-ai/dsh-skill-filesystem` 挂在自己的 id 下、用 `bundledSkillDir` 指向
  自带 `skills/`（活样本 `dsh-plugin-zhihu-search`），说明符就是**另一个包名**，
  拼出的路径不存在；而它的技能往往还在**另一棵** `node_modules` 树里。

  真正的判据比「拼错了包名」更深一层：`bundledSkillDir` 在 `entry.options.config`
  里保留的是 `!!js` 表达式节点（`{ __jsExpr }`），**不是路径**——Loader 只把求值后的
  副本交给 entry 的 fiber，存下来的那份要留着让文件写回保住 `!!js` 写法。所以照
  options 去拼路径必然落空，且**不报错**（静默漏掉）。

  修法：该配置**从 fiber 读**，两条声明都探，并对同一目录去重。

### 兼容性

- 无接口变更：`listSkills()` 的出入参、端点集合与请求信封均未改，只是发现来源多了
  一条。插件技能仍是只读展示（`writable: false`），未开放开关。
- 新增 12 条测试：10 条覆盖根发现（含「options 里的表达式节点不被当路径采信」这一
  关键回归），2 条用真 cordis + 真 Loader 坐实「options 上是节点、fiber 上是求值后
  的路径」。后者会在上游改变该行为时变红。

## 0.5.3 (2026-10-02)

### 修复

- **Windows 下技能列表整体为空**。`~/.dsh/skills` 下的条目是目录 junction 或符号
  链接时，`scanSkillRoot()` 拿 `Dirent.isDirectory()` 当形态判据——而 Dirent 是
  lstat 语义，junction 报 `isDirectory() === false` / `isSymbolicLink() === true`，
  于是 `skillPathFor()` 返回 null，每个链接型技能在 `continue` 处被丢弃。技能本身
  完好可读，只是扫不到，面板上表现为列表为空。

  判据改为**分层**：Dirent 能明确作答时直接采信（真目录走 `isDirectory()`、真文件
  走 `isFile()`），只有链接与文件系统报 `DT_UNKNOWN` 的形态才跟随一次 `stat`。真
  目录因此仍是零额外系统调用。断链在 `stat` 处失败即跳过，同根其它技能不受影响。
  这不是 Windows 专用分支——junction 与 POSIX 符号链接走同一条路。

### 兼容性

- 无接口变更：`listSkills()` 的出入参、端点集合与请求信封均未改，只是扫描判据放宽。
  新增 5 条单测覆盖真目录 / `.md` 文件 / 链接指向目录 / 断链 / 非技能条目。

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
