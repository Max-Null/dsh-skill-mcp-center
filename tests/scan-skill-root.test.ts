import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { scanSkillRoot } from '../src/service.ts'

/**
 * Windows directory junctions need an absolute target; POSIX reaches the same
 * link semantics — a Dirent that is neither a directory nor a file — through a
 * directory symlink.
 */
const DIRECTORY_LINK_TYPE = process.platform === 'win32' ? 'junction' : 'dir'

/** One valid SKILL.md whose frontmatter names the skill. */
function skillMd(name: string): string {
  return `---\nname: ${name}\ndescription: ${name} under test\n---\n\n# ${name}\n`
}

describe('scanSkillRoot 条目形态', () => {
  let root: string
  let outside: string
  /** Links created under `root`, removed before the trees that hold them. */
  let links: string[]

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'smc-scan-root-'))
    outside = await mkdtemp(join(tmpdir(), 'smc-scan-outside-'))
    links = []
  })

  afterEach(async () => {
    // Unlink first: a recursive remove must never be asked to walk a link.
    for (const link of links) await rm(link, { force: true })
    await rm(root, { recursive: true, force: true })
    await rm(outside, { recursive: true, force: true })
  })

  /** Publish one skill directory outside the scanned root. */
  async function outsideSkill(name: string): Promise<string> {
    const dir = join(outside, name)
    await mkdir(dir)
    await writeFile(join(dir, 'SKILL.md'), skillMd(name), 'utf8')
    return dir
  }

  it('真目录、平铺 .md、指向目录的链接：三种形态同根共存时都被收录', async () => {
    await mkdir(join(root, 'real-dir'))
    await writeFile(join(root, 'real-dir', 'SKILL.md'), skillMd('real-dir'), 'utf8')
    await writeFile(join(root, 'flat.md'), skillMd('flat'), 'utf8')
    const link = join(root, 'linked-skill')
    await symlink(await outsideSkill('linked-skill'), link, DIRECTORY_LINK_TYPE)
    links.push(link)

    const skills = await scanSkillRoot(root, 'user-dsh')

    expect(skills.map(skill => skill.name).sort()).toEqual(['flat', 'linked-skill', 'real-dir'])
  })

  it('链接型技能保留 root 下的入口路径与扫描来源', async () => {
    const link = join(root, 'linked-skill')
    await symlink(await outsideSkill('linked-skill'), link, DIRECTORY_LINK_TYPE)
    links.push(link)

    const [skill] = await scanSkillRoot(root, 'user-dsh')

    expect(skill).toMatchObject({
      name: 'linked-skill',
      source: 'user-dsh',
      provider: 'filesystem',
      writable: true,
      path: join(link, 'SKILL.md'),
    })
  })

  it('断链跳过自身，同根其它技能照常收录', async () => {
    await mkdir(join(root, 'real-dir'))
    await writeFile(join(root, 'real-dir', 'SKILL.md'), skillMd('real-dir'), 'utf8')
    const link = join(root, 'doomed')
    await symlink(await outsideSkill('doomed'), link, DIRECTORY_LINK_TYPE)
    links.push(link)
    // Removing the target leaves the link in place, pointing at nothing.
    await rm(join(outside, 'doomed'), { recursive: true, force: true })

    const skills = await scanSkillRoot(root, 'user-dsh')

    expect(skills.map(skill => skill.name)).toEqual(['real-dir'])
  })

  it('既非目录也非 .md 的条目、无 SKILL.md 的目录、frontmatter 无效的文件都不产出技能', async () => {
    await writeFile(join(root, 'notes.txt'), 'not a skill', 'utf8')
    await mkdir(join(root, 'empty-dir'))
    await writeFile(join(root, 'nameless.md'), '---\ndescription: no name\n---\n', 'utf8')

    expect(await scanSkillRoot(root, 'user-dsh')).toEqual([])
  })

  it('根不存在时返回空数组而非抛错', async () => {
    expect(await scanSkillRoot(join(root, 'missing'), 'user-dsh')).toEqual([])
  })
})
