import { describe, expect, it } from 'vitest'
import { setDisableModelInvocation, parseSkillFrontmatter } from '../src/frontmatter.ts'

describe('setDisableModelInvocation(文本级 frontmatter 编辑)', () => {
  it('无 frontmatter → 创建并前置', () => {
    const out = setDisableModelInvocation('# Skill\nbody', true)
    expect(out).toBe('---\ndisable-model-invocation: true\n---\n\n# Skill\nbody')
  })

  it('已有 key → 原位替换值', () => {
    const text = '---\nname: demo\ndisable-model-invocation: false\ndescription: x\n---\nbody'
    const out = setDisableModelInvocation(text, true)
    expect(out).toContain('disable-model-invocation: true')
    expect(out).toContain('name: demo')
    expect(out).toContain('description: x')
    // 其他 key 与顺序保留
    expect(out.indexOf('name') < out.indexOf('disable-model-invocation')).toBe(true)
  })

  it('frontmatter 存在但无该 key → 追加到 body 末尾', () => {
    const out = setDisableModelInvocation('---\nname: demo\n---\nbody', true)
    expect(out).toBe('---\nname: demo\ndisable-model-invocation: true\n---\nbody')
  })

  it('CRLF 行尾保留(Windows 文件不产生孤立 LF)', () => {
    const text = '---\r\nname: demo\r\ndisable-model-invocation: false\r\n---\r\nbody'
    const out = setDisableModelInvocation(text, true)
    // 去掉所有 CRLF 后不应残留孤立 LF(混合行尾会污染 git diff)
    expect(out.replace(/\r\n/g, '')).not.toContain('\n')
    expect(out).toContain('disable-model-invocation: true')
  })

  it('缩进 key 保留缩进', () => {
    const text = '---\nname: demo\n  disable-model-invocation: false\n---\n'
    const out = setDisableModelInvocation(text, true)
    expect(out).toContain('  disable-model-invocation: true')
  })
})

describe('parseSkillFrontmatter', () => {
  it('正常解析(name/description/modelInvocable)', () => {
    const text = '---\nname: demo\ndescription: 说明\n---\nbody'
    expect(parseSkillFrontmatter(text)).toEqual({ name: 'demo', description: '说明', modelInvocable: true })
  })

  it('disable-model-invocation: true → modelInvocable=false', () => {
    const text = '---\nname: demo\ndisable-model-invocation: true\n---\n'
    expect(parseSkillFrontmatter(text)?.modelInvocable).toBe(false)
  })

  it('无 frontmatter → null', () => {
    expect(parseSkillFrontmatter('# only body')).toBeNull()
  })

  it('缺 name → null', () => {
    expect(parseSkillFrontmatter('---\ndescription: x\n---\n')).toBeNull()
  })

  it('坏 YAML → null(不抛)', () => {
    expect(parseSkillFrontmatter('---\nname: [unclosed\n---\n')).toBeNull()
  })
})
