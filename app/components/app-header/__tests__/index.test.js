import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AppHeader from '../index.vue'

describe('AppHeader', () => {
  it('renderiza a marca do projeto e o selo de navegacao', async () => {
    const wrapper = await mountSuspended(AppHeader)

    expect(wrapper.text()).toContain('CurriculoAI')
    expect(wrapper.text()).toContain('Nuxt 4 + OpenAI')
    expect(wrapper.find('a[href="/"]').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
