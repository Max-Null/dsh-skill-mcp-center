window.__ModuleLoader__.load({
  id: "@max-null/dsh-skill-mcp-center",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var CSS = `
.smc-title { font-size: 18px; font-weight: 600; line-height: 26px; color: var(--dsw-alias-label-primary); }
.smc-sub { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary); }
.smc-tabs { display: flex; gap: 4px; margin: 16px 0 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.smc-tab { padding: 8px 14px; font-size: 14px; cursor: pointer; background: none; border: none; font-family: inherit; color: var(--dsw-alias-label-tertiary); border-bottom: 2px solid transparent; margin-bottom: -1px; }
.smc-tab:hover { color: var(--dsw-alias-label-secondary); }
.smc-tab.active { color: var(--dsw-alias-label-primary); border-bottom-color: var(--dsw-alias-state-business-primary); }

.smc-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; background: var(--dsw-alias-bg-layer-1); min-width: 0; }
.smc-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.smc-name { font-weight: 600; color: var(--dsw-alias-label-primary); }
.smc-desc { color: var(--dsw-alias-label-secondary); font-size: 13px; margin-top: 4px; }
.smc-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.smc-spacer { flex: 1; }

.smc-badge { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: 6px; font-size: 12px; line-height: 1; background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-secondary); }
.smc-badge.user { background: var(--dsw-alias-state-business-tertiary); color: var(--dsw-alias-state-business-primary); }
.smc-badge.workspace { background: var(--dsw-alias-state-success-tertiary); color: var(--dsw-alias-state-success-primary); }
.smc-badge.bundled { background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-tertiary); }
.smc-badge.runtime { background: var(--dsw-alias-state-warn-tertiary); color: var(--dsw-alias-state-warn-primary); }
.smc-badge.disabled { background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-caption); }

.smc-btn { height: 26px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary); font-size: 12px; cursor: pointer; font-family: inherit; }
.smc-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-btn.primary { border: none; background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-bg-base); }
.smc-btn.primary:hover { background: var(--dsw-alias-button-primary-hover); }
.smc-btn.danger { border-color: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-state-error-primary); background: none; }
.smc-btn.danger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-btn:disabled { opacity: 0.45; cursor: default; }

.smc-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-state-success-primary); }
.smc-dot.idle { background: var(--dsw-alias-label-caption); }
.smc-dot.failed { background: var(--dsw-alias-state-error-primary); }

.smc-toggle { position: relative; width: 34px; height: 20px; border-radius: 10px; border: none; cursor: pointer; background: var(--dsw-alias-bg-module-platform); transition: background .15s; }
.smc-toggle.on { background: var(--dsw-alias-state-success-primary); }
.smc-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-bg-base); transition: left .15s; }
.smc-toggle.on::after { left: 16px; }
.smc-toggle:disabled { opacity: 0.4; cursor: default; }

.smc-input { height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13px; outline: none; font-family: inherit; }
.smc-input:focus { border-color: var(--dsw-alias-state-business-primary); }
.smc-select { height: 28px; padding: 0 8px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); font-size: 13px; cursor: pointer; font-family: inherit; }
.smc-form { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; padding: 16px; margin-bottom: 14px; background: var(--dsw-alias-bg-layer-2); }
.smc-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.smc-label { font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.smc-error { font-size: 12px; color: var(--dsw-alias-state-error-primary); }

.smc-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); padding: 10px 18px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); font-size: 13px; box-shadow: 0 8px 32px rgba(0,0,0,.18); z-index: 200; max-width: 80vw; }
.smc-toast.ok { border-color: var(--dsw-alias-state-success-primary); }
.smc-toast.error { border-color: var(--dsw-alias-state-error-primary); }

.smc-sidebar { display: flex; flex-direction: column; gap: 2px; padding: 8px; }
.smc-srv { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; }
.smc-srv:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-srv-name { font-size: 13px; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-primary); }
.smc-srv-count { font-size: 11px; color: var(--dsw-alias-label-tertiary); }
.smc-srv-state { font-size: 11px; color: var(--dsw-alias-label-caption); padding: 0 10px 6px 26px; }
.smc-empty { padding: 24px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12.5px; }
`;
var cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-plugin", "@max-null/dsh-skill-mcp-center");
  style.textContent = CSS;
  document.head.append(style);
}
var LOCALE_NS = "@max-null/dsh-skill-mcp-center";
var t = (key) => key;
var localeRevision = 0;
var localeListeners = /* @__PURE__ */ new Set();
function useLocale() {
  const [rev, setRev] = (0, import_react.useState)(localeRevision);
  (0, import_react.useEffect)(() => {
    const l = () => {
      setRev(localeRevision);
    };
    localeListeners.add(l);
    return () => {
      localeListeners.delete(l);
    };
  }, []);
  return rev;
}
var zhDict = {
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  loadFailed: "\u52A0\u8F7D\u5931\u8D25\uFF1A{e}",
  noSkills: "\u672A\u53D1\u73B0\u4EFB\u4F55 skill\uFF08\u68C0\u67E5 ~/.dsh/skills \u4E0E\u9879\u76EE .agents/skills\uFF09",
  sourceSystem: "\u7CFB\u7EDF",
  sourceUser: "\u7528\u6237",
  sourceWorkspace: "\u5DE5\u4F5C\u533A",
  sourceRuntime: "\u8FD0\u884C\u65F6",
  sectionSub: "\u7BA1\u7406\uFF08\u9759\u6001\u914D\u7F6E\uFF09\xB7 \u8FD0\u884C\u65F6\u72B6\u6001\u5728\u53F3\u4FA7\u8FB9\u680F",
  modelDisabled: "\u6A21\u578B\u5DF2\u505C\u7528",
  toggleModelVisible: "\u5207\u6362\u6A21\u578B\u53EF\u89C1",
  skillReadonly: "system/runtime \u6280\u80FD\u53EA\u8BFB",
  enable: "\u542F\u7528",
  disable: "\u505C\u7528",
  provider: "provider \xB7 {name}",
  addServer: "\uFF0B \u6DFB\u52A0 server",
  hotApplied: "\u589E\u5220\u6539\u70ED\u751F\u6548\uFF0C\u514D\u91CD\u542F",
  edit: "\u7F16\u8F91",
  remove: "\u5220\u9664",
  disableServer: "\u505C\u7528\uFF08\u65AD\u5F00\u5E76\u91CA\u653E context\uFF09",
  enableServer: "\u542F\u7528\uFF08\u91CD\u8FDE\uFF09",
  serverNameLabel: "serverName\uFF08[A-Za-z0-9_-]{1,32}\uFF09",
  transport: "transport",
  command: "command",
  argsLabel: "args\uFF08\u7A7A\u683C\u5206\u9694\uFF09",
  cwdLabel: "cwd\uFF08\u53EF\u9009\uFF09",
  url: "url",
  cancel: "\u53D6\u6D88",
  add: "\u6DFB\u52A0",
  save: "\u4FDD\u5B58",
  serverNameInvalid: "serverName \u9700\u5339\u914D [A-Za-z0-9_-]{1,32}",
  added: "\u5DF2\u6DFB\u52A0 {name}\uFF0C\u70ED\u8FDE\u63A5",
  updated: "\u5DF2\u66F4\u65B0 {name}\uFF0C\u70ED\u751F\u6548",
  removed: "\u5DF2\u5220\u9664 {name}\uFF0C\u5DE5\u5177\u5DF2\u4E0B\u7EBF",
  enabledToast: "\u5DF2\u542F\u7528 {name}\uFF08\u70ED\u751F\u6548\uFF09",
  disabledToast: "\u5DF2\u505C\u7528 {name}\uFF08\u70ED\u751F\u6548\uFF09",
  skillToggled: "\u5DF2\u5207\u6362 {name}\uFF0C\u6A21\u578B catalog \u5373\u65F6\u751F\u6548",
  noMcpServer: "\u672A\u914D\u7F6E MCP server",
  connected: "\u5DF2\u8FDE\u63A5",
  notSynced: "\u672A\u540C\u6B65",
  failed: "failed"
};
var enDict = {
  loading: "Loading\u2026",
  loadFailed: "Failed to load: {e}",
  noSkills: "No skills found (check ~/.dsh/skills and project .agents/skills)",
  sourceSystem: "system",
  sourceUser: "user",
  sourceWorkspace: "workspace",
  sourceRuntime: "runtime",
  sectionSub: "Manage (static config) \xB7 runtime status lives in the sidebar",
  modelDisabled: "Model disabled",
  toggleModelVisible: "Toggle model visibility",
  skillReadonly: "system/runtime skills are read-only",
  enable: "Enable",
  disable: "Disable",
  provider: "provider \xB7 {name}",
  addServer: "\uFF0B Add server",
  hotApplied: "hot-applied, no restart",
  edit: "Edit",
  remove: "Remove",
  disableServer: "Disable (disconnect & free context)",
  enableServer: "Enable (reconnect)",
  serverNameLabel: "serverName ([A-Za-z0-9_-]{1,32})",
  transport: "transport",
  command: "command",
  argsLabel: "args (space-separated)",
  cwdLabel: "cwd (optional)",
  url: "url",
  cancel: "Cancel",
  add: "Add",
  save: "Save",
  serverNameInvalid: "serverName must match [A-Za-z0-9_-]{1,32}",
  added: "Added {name}, hot-connected",
  updated: "Updated {name}, hot-applied",
  removed: "Removed {name}, tools offline",
  enabledToast: "{name} enabled (hot-applied)",
  disabledToast: "{name} disabled (hot-applied)",
  skillToggled: "Toggled {name}, model catalog updates live",
  noMcpServer: "No MCP server",
  connected: "Connected",
  notSynced: "Not synced",
  failed: "failed"
};
var rpc = async () => {
  throw new Error("skill-mcp-center: rpc not wired");
};
var toastState = null;
var toastListeners = /* @__PURE__ */ new Set();
function showToast(message, kind = "ok") {
  toastState = { message, kind };
  toastListeners.forEach((l) => l());
}
function useToast() {
  const [t2, setT] = (0, import_react.useState)(toastState);
  (0, import_react.useEffect)(() => {
    const l = () => {
      setT(toastState);
    };
    toastListeners.add(l);
    return () => {
      toastListeners.delete(l);
    };
  }, []);
  (0, import_react.useEffect)(() => {
    if (t2 === null) return;
    const id = setTimeout(() => {
      toastState = null;
      toastListeners.forEach((l) => l());
    }, 3e3);
    return () => clearTimeout(id);
  }, [t2]);
  return t2;
}
var SOURCE_GROUP = {
  bundled: { label: "sourceSystem", cls: "bundled" },
  "user-dsh": { label: "sourceUser", cls: "user" },
  "user-agents": { label: "sourceUser", cls: "user" },
  "project-dsh": { label: "sourceWorkspace", cls: "workspace" },
  "project-agents": { label: "sourceWorkspace", cls: "workspace" },
  runtime: { label: "sourceRuntime", cls: "runtime" }
};
function SkillView() {
  useLocale();
  const [items, setItems] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(() => {
    void rpc("listSkills").then(
      (v) => {
        setError(null);
        setItems(v);
      },
      (e) => {
        setError(e instanceof Error ? e.message : String(e));
      }
    );
  }, []);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  if (error !== null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("loadFailed", { e: error }) });
  if (items === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("loading") });
  if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("noSkills") });
  const toggle = (s) => {
    setBusy(s.path);
    void rpc("toggleSkill", { path: s.path }).then(
      () => {
        setBusy(null);
        load();
        showToast(t("skillToggled", { name: s.name }));
      },
      (e) => {
        setBusy(null);
        showToast(e instanceof Error ? e.message : String(e), "error");
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: items.map((s) => {
    const g = SOURCE_GROUP[s.source] ?? { label: s.source, cls: "" };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-name", children: s.name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-badge ${g.cls}`, children: t(g.label) }),
        !s.modelInvocable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge disabled", children: t("modelDisabled") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: `smc-toggle${s.writable && s.modelInvocable ? " on" : ""}`,
            disabled: !s.writable || busy === s.name,
            title: s.writable ? t("toggleModelVisible") : t("skillReadonly"),
            onClick: () => {
              toggle(s);
            },
            "aria-label": s.modelInvocable ? t("disable") : t("enable")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-desc", children: s.description }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-meta", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge", children: t("provider", { name: s.provider }) }) })
    ] }, s.name);
  }) });
}
function McpView() {
  useLocale();
  const [items, setItems] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(() => {
    void rpc("listMcpServers").then(
      (v) => {
        setError(null);
        setItems(v);
      },
      (e) => {
        setError(e instanceof Error ? e.message : String(e));
      }
    );
  }, []);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  if (error !== null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("loadFailed", { e: error }) });
  if (items === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("loading") });
  const toggle = (s) => {
    void rpc("setMcpServerEnabled", { id: s.id, enabled: s.disabled }).then(
      () => {
        load();
        showToast(t(s.disabled ? "enabledToast" : "disabledToast", { name: s.serverName }));
      },
      (e) => {
        showToast(e instanceof Error ? e.message : String(e), "error");
      }
    );
  };
  const remove = (s) => {
    void rpc("removeMcpServer", { id: s.id }).then(
      () => {
        load();
        showToast(t("removed", { name: s.serverName }));
      },
      (e) => {
        showToast(e instanceof Error ? e.message : String(e), "error");
      }
    );
  };
  const dotCls = (s) => s.fiberPhase === "failed" ? " failed" : s.disabled ? " idle" : "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-row", style: { marginBottom: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn primary", onClick: () => {
        setEditing("new");
      }, children: t("addServer") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-sub", children: t("hotApplied") })
    ] }),
    editing !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServerForm, { server: editing === "new" ? null : editing, onClose: () => {
      setEditing(null);
    }, onSaved: () => {
      setEditing(null);
      load();
    } }),
    items.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-name", children: s.serverName }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge", children: s.transport }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-dot${dotCls(s)}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn", onClick: () => {
          setEditing(s);
        }, children: t("edit") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn danger", onClick: () => {
          remove(s);
        }, children: t("remove") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: `smc-toggle${!s.disabled ? " on" : ""}`,
            title: s.disabled ? t("enableServer") : t("disableServer"),
            onClick: () => {
              toggle(s);
            },
            "aria-label": s.disabled ? t("enable") : t("disable")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-desc", children: s.transport === "stdio" ? `${s.command ?? ""} ${(s.args ?? []).join(" ")}` : s.url })
    ] }, s.id))
  ] });
}
function ServerForm({ server, onClose, onSaved }) {
  useLocale();
  const [name, setName] = (0, import_react.useState)(server?.serverName ?? "");
  const [transport, setTransport] = (0, import_react.useState)(server?.transport ?? "stdio");
  const [command, setCommand] = (0, import_react.useState)(server?.command ?? "");
  const [args, setArgs] = (0, import_react.useState)((server?.args ?? []).join(" "));
  const [cwd, setCwd] = (0, import_react.useState)(server?.cwd ?? "");
  const [url, setUrl] = (0, import_react.useState)(server?.url ?? "");
  const [error, setError] = (0, import_react.useState)("");
  const save = () => {
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(name)) {
      setError(t("serverNameInvalid"));
      return;
    }
    const config = transport === "stdio" ? { serverName: name, transport, command, args: args.split(/\s+/).filter(Boolean), cwd } : { serverName: name, transport, url };
    const call = server === null ? rpc("createMcpServer", { config }) : rpc("updateMcpServer", { id: server.id, config });
    void call.then(
      () => {
        onSaved();
        showToast(server === null ? t("added", { name }) : t("updated", { name }));
      },
      (e) => {
        setError(e instanceof Error ? e.message : String(e));
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-form", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("serverNameLabel") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-input", value: name, onChange: (e) => {
        setName(e.target.value);
      }, placeholder: "filesystem" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("transport") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "smc-select", value: transport, onChange: (e) => {
        setTransport(e.target.value);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "stdio", children: "stdio" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "streamable-http", children: "streamable-http" })
      ] })
    ] }),
    transport === "stdio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("command") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-input", value: command, onChange: (e) => {
          setCommand(e.target.value);
        }, placeholder: "npx" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("argsLabel") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-input", value: args, onChange: (e) => {
          setArgs(e.target.value);
        }, placeholder: "-y @modelcontextprotocol/server-filesystem" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("cwdLabel") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-input", value: cwd, onChange: (e) => {
          setCwd(e.target.value);
        }, placeholder: "" })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-label", children: t("url") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-input", value: url, onChange: (e) => {
        setUrl(e.target.value);
      }, placeholder: "https://mcp.example.com/xxx" })
    ] }),
    error !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-error", children: error }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-row", style: { justifyContent: "flex-end", gap: 8, marginTop: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn", onClick: onClose, children: t("cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn primary", onClick: save, children: server === null ? t("add") : t("save") })
    ] })
  ] });
}
function CenterPanel() {
  useLocale();
  const [view, setView] = (0, import_react.useState)("skill");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: "none" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-title", children: "Skill & MCP" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-sub", children: t("sectionSub") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-tabs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: `smc-tab${view === "skill" ? " active" : ""}`, onClick: () => {
          setView("skill");
        }, children: "Skill" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: `smc-tab${view === "mcp" ? " active" : ""}`, onClick: () => {
          setView("mcp");
        }, children: "MCP" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: 1, minHeight: 0, overflow: "auto" }, children: view === "skill" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillView, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(McpView, {}) })
  ] });
}
function McpSidebarTab({ visible }) {
  useLocale();
  const [items, setItems] = (0, import_react.useState)([]);
  (0, import_react.useEffect)(() => {
    if (!visible) return;
    const tick = () => {
      void rpc("mcpStatus").then((v) => {
        setItems(v);
      }).catch(() => {
      });
    };
    tick();
    const timer = setInterval(tick, 1e3);
    return () => {
      clearInterval(timer);
    };
  }, [visible]);
  if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-empty", children: t("noMcpServer") });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-sidebar", children: items.map((s) => {
    const dotCls = s.fiberPhase === "failed" ? " failed" : s.connected ? "" : " idle";
    const state = s.fiberPhase === "failed" ? t("failed") : s.connected ? t("connected") : t("notSynced");
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-srv", title: `fiber ${s.fiberPhase ?? "?"} \xB7 ${s.toolCount} tools (${s.statusSource})`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-dot${dotCls}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-srv-name", children: s.serverName }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "smc-srv-count", children: [
          s.toolCount,
          " tools"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-srv-state", children: state })
    ] }, s.serverName);
  }) });
}
function Toast() {
  const toast = useToast();
  if (toast === null) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `smc-toast ${toast.kind}`, children: toast.message });
}
function SidebarSkillTab({ visible, cwd }) {
  useLocale();
  const [items, setItems] = (0, import_react.useState)([]);
  const load = (0, import_react.useCallback)(() => {
    void rpc("listSkills", { cwd }).then(
      (v) => {
        setItems(v);
      },
      () => {
        setItems([]);
      }
    );
  }, [cwd]);
  (0, import_react.useEffect)(() => {
    if (!visible) return;
    load();
  }, [visible, load]);
  if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-empty", children: t("noSkills") });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-sidebar", children: items.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-srv", title: `${s.description}
${s.path}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-dot${s.modelInvocable ? "" : " idle"}` }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-srv-name", children: s.name }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: `smc-toggle${s.modelInvocable ? " on" : ""}`,
        title: t("toggleModelVisible"),
        onClick: () => {
          void rpc("toggleSkill", { path: s.path }).then(() => {
            load();
          });
        },
        "aria-label": s.modelInvocable ? t("disable") : t("enable")
      }
    )
  ] }, s.path)) });
}
var inject = ["slots", "connection", "locale"];
function apply(ctx) {
  injectCss();
  rpc = async (endpoint, payload = {}) => {
    const result = await ctx.connection.rpc.call("/skill-mcp", endpoint, payload);
    if (result.ok) return result.value;
    throw new Error(result.error?.message ?? `skill-mcp-center: ${endpoint} failed`);
  };
  ctx.effect(() => {
    const d1 = ctx.locale.register(LOCALE_NS, "zh", zhDict);
    const d2 = ctx.locale.register(LOCALE_NS, "en", enDict);
    return () => {
      d1();
      d2();
    };
  });
  t = ctx.locale.bind(LOCALE_NS);
  ctx.effect(() => ctx.locale.subscribe(() => {
    localeRevision += 1;
    localeListeners.forEach((l) => l());
  }));
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "skill-mcp-center",
    order: 60,
    label: () => "Skill & MCP"
  }, CenterPanel));
  ctx.inject(["betterSidebar"], (sidebarCtx) => {
    const service = sidebarCtx.betterSidebar;
    if (service === void 0) return;
    sidebarCtx.effect(() => service.registerTab({
      id: "@max-null/dsh-skill-mcp-center:mcp",
      title: () => "MCP",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "2", y: "2", width: "20", height: "8", rx: "2", ry: "2" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "2", y: "14", width: "20", height: "8", rx: "2", ry: "2" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "6", y1: "6", x2: "6.01", y2: "6" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "6", y1: "18", x2: "6.01", y2: "18" })
      ] }),
      order: 70,
      single: true,
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(McpSidebarTab, { visible: props.visible })
    }));
    sidebarCtx.effect(() => service.registerTab({
      id: "@max-null/dsh-skill-mcp-center:skills",
      title: () => "Skill",
      icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13 2 3 14h7l-1 8 10-12h-7l1-8z" }) }),
      order: 71,
      single: true,
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarSkillTab, { visible: props.visible, cwd: props.scope?.cwd })
    }));
  });
  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "skill-mcp-center-toast",
    order: 90
  }, Toast));
}
    return module.exports;
  },
});

