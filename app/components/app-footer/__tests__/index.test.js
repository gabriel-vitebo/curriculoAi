import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppFooter from '../index.vue'

describe('AppFooter', () => {
  it('renderiza os links do rodape e a versao', async () => {
    const wrapper = await mountSuspended(AppFooter)
    const versionText = wrapper.find('footer > span:last-child').text()

    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('Releases')
    expect(versionText).toMatch(/^(v\d+\.\d+\.\d+|dev-[0-9a-f]+)$/)
    expect(wrapper.find('a[href="https://github.com/gabriel-vitebo/curriculoAi"]').exists()).toBe(true)
    expect(wrapper.html().replace(versionText, '__APP_VERSION__')).toMatchSnapshot()
  })
})
