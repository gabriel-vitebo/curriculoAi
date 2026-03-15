import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppFooter from '../index.vue'

describe('AppFooter', () => {
  it('renderiza os links do rodape e a versao', async () => {
    const wrapper = await mountSuspended(AppFooter)

    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('Releases')
    expect(wrapper.text()).toContain('Versao 1.0')
    expect(wrapper.find('a[href="https://github.com/gabriel-vitebo/curriculoAi"]').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
