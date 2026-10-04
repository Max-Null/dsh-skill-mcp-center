import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { pluginSkillRoots, type SkillRootEntry } from '../src/service.ts'

/**
 * 插件自带技能的根由两条声明给出：entry 的模块说明符拼出的
 * `<node_modules>/<pkg>/skills`，以及 entry 自己声明的 `bundledSkillDir`。
 *
 * 后者必须取自 fiber 而非 options —— patch 可以拿 `!!js` 表达式算出这个
 * 路径（真实样本 `dsh-plugin-zhihu-search` 用 Loader 的 `baseUrl` 解析自己
 * 的安装位置），而 Loader 在 options 里保留的是 `{ __jsExpr }` 节点、只把
 * 求值后的副本交给 fiber。
 */
describe('pluginSkillRoots 插件技能根发现', () => {
  let nm: string

  beforeEach(async () => {
    nm = await mkdtemp(join(tmpdir(), 'smc-plugin-roots-'))
  })

  afterEach(async () => {
    await rm(nm, { recursive: true, force: true })
  })

  /** 在自身 node_modules 树下建一个带 SKILL.md 的技能目录，返回该 skills 目录。 */
  async function makeSkillDir(pkg: string): Promise<string> {
    const dir = join(nm, ...pkg.split('/'), 'skills')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'SKILL.md'), `---\nname: demo\ndescription: demo\n---\n`, 'utf8')
    return dir
  }

  /** 已加载的 entry：fiber 在场，config 是它实际使用的那份。 */
  function loaded(id: string, name: string, config?: unknown): SkillRootEntry {
    return { options: { id, name }, fiber: { config } }
  }

  /** 尚未加载的 entry：没有 fiber。 */
  function pending(id: string, name: string): SkillRootEntry {
    return { options: { id, name } }
  }

  it('entry 的模块说明符拼出的包内 skills 被收录', async () => {
    const dir = await makeSkillDir('@max-null/dsh-skills')

    expect(pluginSkillRoots([loaded('skills', '@max-null/dsh-skills')], nm)).toEqual([
      { dir, label: 'plugin:@max-null/dsh-skills' },
    ])
  })

  it('entry 声明的 bundledSkillDir 被收录，并挂在 entry id 下', async () => {
    const dir = await makeSkillDir('dsh-plugin-zhihu-search')

    // 真实形态：说明符指向官方 skill-filesystem，自带技能在别的树里，
    // 只有 bundledSkillDir 指向它。
    expect(pluginSkillRoots([
      loaded('zhihu-search-skill', '@deepseek-ai/dsh-skill-filesystem', { bundledSkillDir: dir }),
    ], nm)).toEqual([{ dir, label: 'plugin:zhihu-search-skill' }])
  })

  it('同一 entry：options 里的 !!js 节点不采信，fiber 上求值后的路径才采信', async () => {
    const dir = await makeSkillDir('dsh-plugin-zhihu-search')
    const entry = {
      options: {
        id: 'zhihu-search-skill',
        name: '@deepseek-ai/dsh-skill-filesystem',
        // Loader 在 options 里保形保留的表达式节点，不是路径。
        config: { bundledSkillDir: { __jsExpr: "require.resolve('dsh-plugin-zhihu-search/package.json')" } },
      },
      fiber: { config: { bundledSkillDir: dir } },
    }

    expect(pluginSkillRoots([entry], nm)).toEqual([{ dir, label: 'plugin:zhihu-search-skill' }])
  })

  it('fiber 上的 bundledSkillDir 不是字符串时跳过', () => {
    expect(pluginSkillRoots([
      loaded('zhihu-search-skill', '@deepseek-ai/dsh-skill-filesystem', {
        bundledSkillDir: { __jsExpr: 'unevaluated' },
      }),
    ], nm)).toEqual([])
  })

  it('两条声明命中同一目录时只收录一次', async () => {
    const dir = await makeSkillDir('dsh-skills')

    expect(pluginSkillRoots([loaded('skills', 'dsh-skills', { bundledSkillDir: dir })], nm)).toEqual([
      { dir, label: 'plugin:dsh-skills' },
    ])
  })

  it('目录不存在时不产出根', () => {
    expect(pluginSkillRoots([
      loaded('a', 'missing-pkg'),
      loaded('b', 'pkg-b', { bundledSkillDir: join(nm, 'no-such-dir') }),
    ], nm)).toEqual([])
  })

  it('相对与绝对说明符不参与包内拼路径', () => {
    expect(pluginSkillRoots([
      loaded('local', './noop.mjs'),
      loaded('abs', '/abs/path'),
    ], nm)).toEqual([])
  })

  it('定位不到自身 node_modules 时，entry 声明的目录仍被收录', async () => {
    const dir = await makeSkillDir('dsh-plugin-zhihu-search')

    expect(pluginSkillRoots([
      loaded('zhihu-search-skill', '@deepseek-ai/dsh-skill-filesystem', { bundledSkillDir: dir }),
    ], null)).toEqual([{ dir, label: 'plugin:zhihu-search-skill' }])
  })

  it('尚未加载的 entry 不产出声明根，也不抛错', () => {
    expect(pluginSkillRoots([pending('zhihu-search-skill', '@deepseek-ai/dsh-skill-filesystem')], nm)).toEqual([])
  })

  it('config 缺失或非对象时安全跳过', () => {
    expect(pluginSkillRoots([
      loaded('a', 'pkg-a'),
      loaded('b', 'pkg-b', 'not-an-object'),
      loaded('c', 'pkg-c', null),
    ], nm)).toEqual([])
  })
})
