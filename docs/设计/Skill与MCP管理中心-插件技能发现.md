# Skill 与 MCP 管理中心 · 插件技能发现（issue #1 交接）

> 交接文档 · 2026-10-04 落盘。来源：GitHub issue [Max-Null/dsh-skill-mcp-center#1](https://github.com/Max-Null/dsh-skill-mcp-center/issues/1)（**OPEN，有意保留**，其余 8 条同日归档）。
>
> **本文自包含**：读完即可开工，不必回溯原会话。事实依据来自 2026-10-02 的机械取证（当时未实现改动），文末标注了哪些是转述、哪些待确认。
>
> **2026-10-04 结案**：方案 A 已实施。下面的推导记录保留（它解释了当初为什么这么选），当前状态见下节。

## 状态（2026-10-04 结案）

**判据一已修**，并查实了本文原先没有的**第三层原因**。

原文描述是「拿 `entry.options.name` 拼路径会落空」。实际情况更彻底：**即使说明符恰好就是包名，也照样扫不到** —— `bundledSkillDir` 在 `entry.options.config` 里保留的是 `!!js` 表达式节点（`{ __jsExpr: '...' }`），**不是路径**。Loader 只把求值后的副本交给 entry 的 fiber：它在 `internal/config` 瀑布上 `interpolate`，在 `internal/update` 上回写原始节点以保持文件里的 `!!js` 形态（`vendor/loader/src/index.ts`；`packages/boot/app-boot/tests/user-patches.spec.ts:198-199` 对此有直接断言）。

所以真正的判据不是「拼错了包名」，而是「读错了字段」。

实现落在 `src/service.ts` 的 `pluginSkillRoots()`：两条声明都探 —— 说明符拼出的 `<node_modules>/<pkg>/skills`，以及 fiber 上求值后的 `bundledSkillDir` —— 并对同一目录去重。

### 三个待决问题

| # | 问题 | 结论 |
|---|---|---|
| 1 | 面板要覆盖「当前 profile 实际加载的」还是「所有可发现的」 | **实现天然落在前者**。`bundledSkillDir` 由插件自己的 patch 算出，指向它真正加载的那一份；两条声明都以**已加载的 entry**为准，没有「扫所有已知树」这一步 |
| 2 | 跨树找到的技能，开关要不要能改它 | **仍开放**。插件技能一律 `writable: false`（只读展示），本次未动 |
| 3 | `bundledSkillDir` 是官方约定还是第三方自定义 | **官方**。`packages/skill/skill-filesystem/src/index.ts:73` 定义配置项、:261 按 rank 600 注册为 `bundled` 源；`docs/subsystems/skills.md:75` 与同包 `README.md:75` 均列为公开配置，另有 `DSH_BUNDLED_SKILL_DIR` 环境变量默认值 |

### 验证到什么程度

**机制**由真 cordis + 真 Loader 的集成测试覆盖（`tests/bundled-skill-dir-loader.test.ts`：options 上是节点、fiber 上是求值后的路径、`pluginSkillRoots` 对真 Entry 输出正确）。

**端到端**在隔离 dev 实例里做了 A/B 对照（2026-10-04）。样本与 `dsh-plugin-zhihu-search` 同构：`dsh-plugin/cordis.patch.yml` 里用 `!!js` 借 Loader 的 `baseUrl` 解析自身包位置，插一条官方 `@deepseek-ai/dsh-skill-filesystem`（`bundledSkillDir` 指向自带 `skills/`），另插一条只负责报告 config 的 echo 插件。

第二条 entry 是必需的：它把「bundle 已挂载但旧代码扫不到」与「bundle 压根没挂载」分开 —— 少了它，A 组的「扫不到」有两种读法，结论正好相反。

| | 插件代码 | 样本 | echo 探针 | 技能数 | 面板里的样本技能 |
|---|---|---|---|---|---|
| A | 0.5.3（旧） | 已挂载 | 打印 `typeof=string` + 绝对路径 | 29 | 无 |
| B | 本次改动 | 已挂载 | 同上 | 30 | `bundled-probe`，源 `plugin:bundled-probe-skill` |

同一环境、同一样本，唯一变量是插件代码；两次探针输出一致，说明差异来自代码而非环境。两条 entry 指向同一目录而技能只出现一次，去重同时得到验证。

**未做**：装版端到端。真实的 `dsh-plugin-zhihu-search` 只在装版 profile（`~/.dsh/profiles/ssid/node_modules`）里，装版仍跑 0.5.3 —— 已核对其 `dist/service.js` 不含本次改动。


## 一句话

面板的「插件技能」需要覆盖两种形态 —— 拿 loader entry 的 `name` 去**自己那棵** `node_modules` 里拼 `<name>/skills`，以及 entry 通过 `bundledSkillDir` 声明的根。下面的推导记录针对的是**第二种当初扫不到**的判据。

## 报障原文（2026-08-21）

> 现在好像只能识别本地项目和全局技能，插件安装的识别不了

## 现状：这条请求有一半已经落地

1. **「插件包内自带技能」这个形态 0.5.0 起已收录** —— `pluginSkillDirs()` 会探 `<node_modules>/<包名>/skills`。报障时（8-21）还没有这段逻辑，所以「插件安装的识别不了」在当时完全成立。
2. **但仍有一类扫不到** —— 活样本是本机的 `dsh-plugin-zhihu-search`。

## 根因：两个判据都会漏

### 判据一：`entry.options.name` 不是包名

`dsh-plugin-zhihu-search` 的 `dsh-plugin/cordis.patch.yml` 是这样注册的：

```yaml
id: zhihu-search-skill
name: '@deepseek-ai/dsh-skill-filesystem'
config:
  bundledSkillDir: <指向自己的 skills/>
```

它的技能躺在 `node_modules/dsh-plugin-zhihu-search/skills/`，但 loader entry 的 `name` 是 `@deepseek-ai/dsh-skill-filesystem` —— 拿它拼出来的路径不存在，`existsSync` 直接落空。

取证方式：该插件的 `cordis.yml` 里检索 `name: 'dsh-plugin-zhihu-search'`，**0 命中**。

### 判据二：只探「自己那棵」node_modules

`ownNodeModules()` 解析的是**本插件实体所在**的那棵树。本机实测（2026-10-02）：

| 树 | 包数 | 带 `skills/` 的 |
|---|---|---|
| SSiD 随包插件集 `<resources>/ssid-plugins/node_modules` | 615 | 2（dsh-plugin-center、dsh-skills） |
| profile `~/.dsh/profiles/ssid/node_modules`（`dsh plugin add` 的落点） | 620 | 3（多出 `dsh-plugin-zhihu-search`） |

扫不到的那个正好在**另一棵树**里。

### 附带事实：当初为什么绕开官方 registry

`ctx.skills.list()` 省略 `scope` 时只读全局层，而 web-app 与 SSiD profile 都把全局层的 `skill-filesystem` 设成 `disabled: true`（`cordis.yml` 里的 `- id: skill-filesystem / disabled: true`），技能发现归 agent preset。所以本插件只能直接读盘 —— 这不是绕远路，是当前唯一可行路径。

## 代码位置（`src/service.ts`）

| 位置 | 作用 |
|---|---|
| `pluginSkillDirs()` :243 | **两处判据都在这一个方法里**（`entry.options.name` 拼接 + `ownNodeModules()` 单树） |
| `listSkills()` :260 | 调用点 :269 |
| `scanSkillRoot()` :186 | 扫描与过滤。0.5.3 起判据分层：Dirent 能明确作答就采信，链接与 `DT_UNKNOWN` 才跟随一次 `stat` |

## 方案评估

### A（小 —— 建议先做）

`pluginSkillDirs()` 额外读每个 entry 的 `config.bundledSkillDir`，一并探测。

- 约十来行，改动面局限在一个方法
- **只解决判据一**
- 判据二（跨树）需要另议：扫所有已知树，还是只认当前 profile 实际加载的那棵 —— 取决于下面「待决问题 1」

### B（大）

改从 `ctx.skills.list()` 取清单，不再自己扫盘。

- **但**：`SkillCandidate.locator` 是 provider 私有句柄，而面板的「开关 / 查看」依赖**真实路径**
- 且 preset 作用域仍读不到
- 要先解决「可写性从哪来」这个前置问题 —— 否则清单能列出来却管不动

## 待决问题（开工前先定）

1. **产品意图**：插件技能面板要覆盖「当前 profile 实际加载的」还是「所有可发现的」？**这决定判据二怎么修**，也决定方案 A 改完之后够不够。
2. **可写性**：跨树找到的技能，面板上的开关要不要能改它？若要，改的应该是**实际生效的那一份**，而不是搜到的那一份。
3. **`bundledSkillDir` 的定性尚未确认**：它是第三方插件的自定义约定，还是 DSH 官方约定？把扫描判据建立在一个非官方字段上之前，值得先确认 DSH 侧有没有对应概念。（**这一条是转述 + 待确认，写文档时未复核。**）

## 相关

- issue：[#1](https://github.com/Max-Null/dsh-skill-mcp-center/issues/1)
- 同批已修并发布的：issue #3（Windows junction 下技能列表为空，0.5.3 已发 npm）
- 本工作区有两条相关记忆（`dsh-skill-mcp-center` 子目录里起会话可直接 `memory_search` 到）：
  - 技能发现的两棵树与 `bundledSkillDir` 取证
  - 「面板写回会抹掉手配字段」——`ctx.loader.update()` 的 config 是整体替换、不深合并
