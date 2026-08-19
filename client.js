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

.smc-card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; margin-bottom: 10px; background: var(--dsw-alias-bg-layer-1); min-width: 0; overflow: hidden; }
.smc-card-pad { padding: 14px 16px; }
.smc-card:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-card-head { display: flex; align-items: center; }
.smc-card-title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 12px 8px 12px 16px; background: none; border: none; cursor: pointer; text-align: left; font-family: inherit; }
.smc-card-title:hover .smc-card-name { color: var(--dsw-alias-state-business-primary); }
.smc-card-name { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.smc-card-desc { font-size: 12px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.smc-chevron { flex: none; width: 8px; height: 8px; border-right: 1.5px solid var(--dsw-alias-label-caption); border-bottom: 1.5px solid var(--dsw-alias-label-caption); transform: rotate(45deg); transition: transform .15s; margin: 0 14px 0 4px; }
.smc-chevron.open { transform: rotate(-135deg); }
.smc-card .smc-detail { margin: 0; padding: 10px 16px 14px; border-top: 1px solid var(--dsw-alias-border-l1); }
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

.smc-sidebar { display: flex; flex-direction: column; gap: 0; padding: 8px; height: 100%; box-sizing: border-box; }
.smc-sidebar-head { flex: none; display: flex; flex-direction: column; gap: 6px; padding-bottom: 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); margin-bottom: 6px; }
.smc-sidebar-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.smc-search-sidebar { height: 28px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13px; outline: none; width: 100%; font-family: inherit; box-sizing: border-box; }
.smc-search-sidebar:focus { border-color: var(--dsw-alias-state-business-primary); }
.smc-search-sidebar::placeholder { color: var(--dsw-alias-label-caption); }
.smc-srv { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; }
.smc-srv:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-srv-name { font-size: 13px; font-weight: 500; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-primary); }
.smc-srv-desc { font-size: 11px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 10px 4px 26px; flex: none; }
.smc-srv-state { font-size: 11px; color: var(--dsw-alias-label-caption); padding: 0 10px 6px 26px; }
.smc-empty { padding: 24px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12.5px; }
.smc-ns-bar { display: flex; gap: 4px; margin-bottom: 8px; }
.smc-ns-btn { flex: 1; height: 26px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: none; color: var(--dsw-alias-label-secondary); font-size: 12px; cursor: pointer; font-family: inherit; }
.smc-ns-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.smc-ns-btn.active { color: var(--dsw-alias-state-business-primary); border-color: var(--dsw-alias-state-business-primary); }
.smc-md { margin: 6px 0 2px; padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-base); font-size: 11px; line-height: 1.6; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; word-break: break-all; max-height: 240px; overflow-y: auto; font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; }
.smc-md-err { margin: 6px 0 2px; font-size: 11px; color: var(--dsw-alias-state-error-primary); }
.smc-detail .smc-md { margin-top: 8px; }
.smc-search { position: sticky; top: 0; z-index: 1; height: 30px; padding: 0 12px; border-radius: 18px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13px; outline: none; width: 240px; font-family: inherit; }
.smc-search:focus { border-color: var(--dsw-alias-state-business-primary); }
.smc-search::placeholder { color: var(--dsw-alias-label-caption); }
.smc-toolbar { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 6px 2px; background: var(--dsw-alias-bg-layer-2); }
.smc-toolbar .smc-search { position: static; width: 100%; flex: 1; margin: 0; }
.smc-toolbar-count { flex: none; font-size: 12px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; }
.smc-group { display: flex; align-items: baseline; gap: 8px; margin: 14px 0 8px; font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-secondary); }
.smc-group .smc-count { font-size: 11px; font-weight: 400; color: var(--dsw-alias-label-caption); }
.smc-detail { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--dsw-alias-border-l1); font-size: 12px; color: var(--dsw-alias-label-secondary); word-break: break-all; }
.smc-detail-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
/* DSH 0.1.x \u8BBE\u7F6E\u5BFC\u822A\u65E0 icon \u5951\u7EA6\uFF08external section \u4E00\u5F8B\u9ED8\u8BA4\u9F7F\u8F6E\uFF09\u3002settings-nav-icon
   \u6807\u8BB0\u672C\u63D2\u4EF6\u884C\u540E\uFF1A\u9690\u85CF\u58F3\u6E32\u67D3\u7684\u9F7F\u8F6E SVG\uFF0C\u7528 Lucide wrench \u7684 currentColor mask \u66FF\u6362\uFF0C
   \u8DDF\u968F\u539F\u751F\u5BFC\u822A hover/active \u989C\u8272\u4E14\u4E0D\u6539\u53D8\u58F3\u7684 16px \u56FE\u6807\u8282\u594F\u3002 */
[data-dsh-skill-mcp-center-settings-nav] > svg:first-child { display: none; }
[data-dsh-skill-mcp-center-settings-nav]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z'/%3E%3C/svg%3E") center / contain no-repeat;
}
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
var SETTINGS_NAV_MARKER = "data-dsh-skill-mcp-center-settings-nav";
function registerSettingsNavIcon(label) {
  let disposed = false;
  const sync = () => {
    if (disposed) return;
    const currentLabel = label().trim();
    const buttons = document.querySelectorAll('[role="dialog"] nav button');
    for (const button of buttons) {
      const matches = currentLabel.length > 0 && button.textContent?.trim() === currentLabel;
      if (matches) button.setAttribute(SETTINGS_NAV_MARKER, "");
      else button.removeAttribute(SETTINGS_NAV_MARKER);
    }
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => {
    disposed = true;
    observer.disconnect();
    document.querySelectorAll(`[${SETTINGS_NAV_MARKER}]`).forEach((element) => {
      element.removeAttribute(SETTINGS_NAV_MARKER);
    });
  };
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
  failed: "failed",
  searchSkills: "\u641C\u7D22 skill\uFF08\u540D\u79F0 / \u63CF\u8FF0\uFF09\u2026",
  groupGlobal: "\u5168\u5C40",
  groupWorkspace: "\u5DE5\u4F5C\u533A",
  groupBundled: "\u5185\u7F6E\uFF08DSH \u5B98\u65B9\uFF09",
  readOnlyBadge: "\u5185\u7F6E\u53EA\u8BFB",
  noMatch: "\u6CA1\u6709\u5339\u914D\u7684 skill",
  detailPath: "\u8DEF\u5F84",
  detailProvider: "provider",
  clickForDetail: "\u70B9\u51FB\u67E5\u770B\u8BE6\u60C5",
  allNamespaces: "\u5168\u90E8",
  nsGlobal: "\u5168\u5C40",
  nsWorkspace: "\u5DE5\u4F5C\u533A",
  noWorkspace: "\u672A\u9009\u62E9\u5DE5\u4F5C\u533A",
  viewMd: "\u67E5\u770B SKILL.md",
  hideMd: "\u6536\u8D77",
  mdLoadFailed: "\u8BFB\u53D6\u5931\u8D25\uFF1A{e}"
};
var enDict = {
  loading: "Loading\u2026",
  loadFailed: "Failed to load: {e}",
  noSkills: "No skills found (check ~/.dsh/skills and project .agents/skills)",
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
  failed: "failed",
  searchSkills: "Search skills (name / description)\u2026",
  groupGlobal: "Global",
  groupWorkspace: "Workspace",
  groupBundled: "Built-in (DSH official)",
  readOnlyBadge: "built-in read-only",
  noMatch: "No matching skills",
  detailPath: "path",
  detailProvider: "provider",
  clickForDetail: "click for details",
  allNamespaces: "All",
  nsGlobal: "Global",
  nsWorkspace: "Workspace",
  noWorkspace: "No workspace selected",
  viewMd: "View SKILL.md",
  hideMd: "Hide",
  mdLoadFailed: "Failed to read: {e}"
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
var SKILL_GROUPS = [
  { key: "global", labelKey: "groupGlobal", sources: ["user-dsh", "user-agents"] },
  { key: "workspace", labelKey: "groupWorkspace", sources: ["project-dsh", "project-agents"] },
  { key: "bundled", labelKey: "groupBundled", sources: ["bundled"] }
];
function groupOf(source) {
  const idx = SKILL_GROUPS.findIndex((g) => g.sources.includes(source));
  return idx === -1 ? SKILL_GROUPS.length : idx;
}
function SkillView() {
  useLocale();
  const [items, setItems] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(null);
  const [query, setQuery] = (0, import_react.useState)("");
  const [expanded, setExpanded] = (0, import_react.useState)(null);
  const [mdPath, setMdPath] = (0, import_react.useState)(null);
  const [mdText, setMdText] = (0, import_react.useState)(null);
  const [mdError, setMdError] = (0, import_react.useState)(null);
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
  const openMd = (s) => {
    if (mdPath === s.path) {
      setMdPath(null);
      setMdText(null);
      setMdError(null);
      return;
    }
    setMdPath(s.path);
    setMdText(null);
    setMdError(null);
    void rpc("readSkill", { path: s.path }).then(
      (v) => {
        setMdText(v);
      },
      (e) => {
        setMdError(e instanceof Error ? e.message : String(e));
      }
    );
  };
  const q = query.trim().toLowerCase();
  const visible = items.filter((s) => q === "" || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  const buckets = SKILL_GROUPS.map(() => []);
  const other = [];
  for (const s of visible) {
    const g = groupOf(s.source);
    if (g < SKILL_GROUPS.length) buckets[g].push(s);
    else other.push(s);
  }
  const renderCard = (s) => {
    const open = expanded === s.path;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-card-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "smc-card-title",
            "aria-expanded": open,
            title: t("clickForDetail"),
            onClick: () => {
              setExpanded(open ? null : s.path);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-card-name", children: s.name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-card-desc", children: s.description })
            ]
          }
        ),
        s.writable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: `smc-toggle${s.modelInvocable ? " on" : ""}`,
            disabled: busy === s.path,
            title: t("toggleModelVisible"),
            onClick: () => {
              toggle(s);
            },
            "aria-label": s.modelInvocable ? t("disable") : t("enable")
          }
        ) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-chevron${open ? " open" : ""}` })
      ] }),
      open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-detail", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-detail-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "smc-badge", children: [
            t("detailProvider"),
            " \xB7 ",
            s.provider
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge", children: s.source }),
          !s.modelInvocable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge disabled", children: t("modelDisabled") }),
          !s.writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-badge disabled", children: t("readOnlyBadge") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "smc-btn", onClick: () => {
            openMd(s);
          }, children: mdPath === s.path ? t("hideMd") : t("viewMd") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-detail-row", children: [
          t("detailPath"),
          "\uFF1A",
          s.path
        ] }),
        mdPath === s.path && (mdError !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md-err", children: t("mdLoadFailed", { e: mdError }) }) : mdText === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md", children: t("loading") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md", children: mdText }))
      ] })
    ] }, s.path);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "smc-search", placeholder: t("searchSkills"), value: query, onChange: (e) => {
        setQuery(e.target.value);
      } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-toolbar-count", children: visible.length })
    ] }),
    visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "smc-sub", children: t("noMatch") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      SKILL_GROUPS.map((g, i) => buckets[i].length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-group", children: [
          t(g.labelKey),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-count", children: buckets[i].length })
        ] }),
        buckets[i].map(renderCard)
      ] }, g.key) : null),
      other.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-group", children: [
          other[0]?.source ?? "",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-count", children: other.length })
        ] }),
        other.map(renderCard)
      ] }, "other") : null
    ] })
  ] });
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
    items.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-card smc-card-pad", children: [
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
function skillInNamespace(s, ns) {
  if (ns === "all") return true;
  if (ns === "global") return s.source === "user-dsh" || s.source === "user-agents";
  return s.source === "project-dsh" || s.source === "project-agents";
}
function SidebarSkillTab({ visible, cwd }) {
  useLocale();
  const [items, setItems] = (0, import_react.useState)([]);
  const [ns, setNs] = (0, import_react.useState)("all");
  const [query, setQuery] = (0, import_react.useState)("");
  const [mdPath, setMdPath] = (0, import_react.useState)(null);
  const [mdText, setMdText] = (0, import_react.useState)(null);
  const [mdError, setMdError] = (0, import_react.useState)(null);
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
  const openMd = (path) => {
    if (mdPath === path) {
      setMdPath(null);
      setMdText(null);
      setMdError(null);
      return;
    }
    setMdPath(path);
    setMdText(null);
    setMdError(null);
    void rpc("readSkill", { path, cwd }).then(
      (v) => {
        setMdText(v);
      },
      (e) => {
        setMdError(e instanceof Error ? e.message : String(e));
      }
    );
  };
  const q = query.trim().toLowerCase();
  const visibleItems = items.filter((s) => skillInNamespace(s, ns) && (q === "" || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)));
  const noWorkspace = ns === "workspace" && (cwd === void 0 || cwd === "");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-sidebar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-sidebar-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          className: "smc-search-sidebar",
          placeholder: t("searchSkills"),
          value: query,
          onChange: (e) => {
            setQuery(e.target.value);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-ns-bar", style: { marginBottom: 0 }, children: ["all", "global", "workspace"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: `smc-ns-btn${ns === k ? " active" : ""}`,
          onClick: () => {
            setNs(k);
            setMdPath(null);
            setMdText(null);
            setMdError(null);
          },
          children: t(k === "all" ? "allNamespaces" : k === "global" ? "nsGlobal" : "nsWorkspace")
        },
        k
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-sidebar-list", children: noWorkspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-empty", children: t("noWorkspace") }) : visibleItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-empty", children: q !== "" ? t("noMatch") : t("noSkills") }) : visibleItems.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "smc-srv", title: `${s.description}
${s.path}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `smc-dot${s.modelInvocable ? "" : " idle"}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-srv-name", children: s.name }),
        !s.modelInvocable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-srv-count", children: t("modelDisabled") }),
        !s.writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "smc-srv-count", children: t("readOnlyBadge") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: "smc-btn",
            style: { height: 20, padding: "0 6px", fontSize: 11 },
            onClick: () => {
              openMd(s.path);
            },
            "aria-label": mdPath === s.path ? t("hideMd") : t("viewMd"),
            children: mdPath === s.path ? t("hideMd") : "MD"
          }
        ),
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
      ] }),
      s.description !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-srv-desc", children: s.description }),
      mdPath === s.path && (mdError !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md-err", children: t("mdLoadFailed", { e: mdError }) }) : mdText === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md", children: t("loading") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "smc-md", children: mdText }))
    ] }, s.path)) })
  ] });
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
  ctx.effect(() => registerSettingsNavIcon(() => "Skill & MCP"));
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

