/**
 * `SkillMcpRpc` — the host half of the browser's private RPC entry point.
 *
 * Transport (2026-09-17). Two host shapes are supported because the two
 * compositions this plugin runs under differ:
 *
 * - **Newer hosts (0.1.5 line, e.g. the web source build)** expose
 *   `connection.fetch.register(...)`. This route is used there because
 *   `connection.rpc.handle('/skill-mcp', …)` ends at `owner.webServer.register()`
 *   inside Connection (`client-connection/src/rpc-host.ts:179`) and the owning
 *   fiber declares no `webServer` injection, so it throws
 *   `cannot get property "webServer" without inject`; every channel registered
 *   that way fails and the browser sees `HTTP 405` from the static fallback.
 *   `fetch.register` only writes Connection's own route map, so one exact route
 *   under the shared `/api` channel serves the same endpoints.
 *
 * - **Older hosts (e.g. the packaged SSiD kernel)** expose only the logical
 *   channel registry, where `rpc.handle` works, so it stays as the fallback.
 *
 * `connection` is resolved with `ctx.inject` rather than a declared dependency:
 * it activates after this plugin, and `ctx.plugin()` does not wait for
 * dependencies.
 */
import { Service, type Context } from '@deepseek-ai/cordis';
/** Exact Fetch route serving this plugin's endpoints under the shared channel. */
export declare const ROUTE = "/api/skill-mcp";
/** Logical channel used on hosts without exact Fetch-route registration. */
export declare const LEGACY_CHANNEL = "/skill-mcp";
/** Body the browser half posts to {@link ROUTE}. */
export interface SkillMcpRequest {
    /** Endpoint name, e.g. `listSkills`. */
    readonly endpoint: string;
    /** Endpoint arguments. */
    readonly payload?: unknown;
}
export declare class SkillMcpRpc extends Service {
    static inject: string[];
    /**
     * @param ctx - plugin context carrying the skill/MCP engine.
     */
    constructor(ctx: Context);
}
export default SkillMcpRpc;
