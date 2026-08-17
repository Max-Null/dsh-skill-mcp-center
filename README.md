# dsh-skill-mcp-center

Skill & MCP management center for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`) — manage skills and MCP servers in Settings, with live MCP status in the sidebar.

Skill 与 MCP 管理中心：在设置里管理 skills 与 MCP 服务器，右侧边栏查看 MCP 实时状态。

## Features / 功能

- **Skill management / Skill 管理** — browse every skill by tier (system / user / workspace / runtime), toggle model invocation via the `disable-model-invocation` frontmatter (disk-backed skills only).
- **MCP management / MCP 管理** — add / edit / remove `mcp-client` servers, enable/disable without deleting config, all **hot-applied** through `ctx.loader` (no restart).
- **Live status / 实时状态** — a sidebar "MCP" tab (via `dsh-better-sidebar`) showing per-server connection state + tool count, polled while visible and following the session.
- **Skin-compatible / 皮肤兼容** — every color uses `var(--dsw-*)` tokens.

## Install / 安装

```sh
dsh plugin --profile web add github:Max-Null/dsh-skill-mcp-center
# or from npm, once published / 或通过 npm（发布后）
dsh plugin --profile web add @max-null/dsh-skill-mcp-center
```

Restart `dsh web`, then open Settings → Skill & MCP. The sidebar "MCP" tab appears only when `dsh-better-sidebar` is installed (optional peer).

## Development / 开发

```sh
pnpm install
pnpm build   # tsc (host) + esbuild (browser bundle)
```

## License / 许可

[MIT](./LICENSE)
