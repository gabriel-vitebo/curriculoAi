import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect } from 'vitest'
import AppHeader from '~/components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders the project branding and navigation label', async () => {
    const wrapper = await mountSuspended(AppHeader)

    expect(wrapper.text()).toContain('CurriculoAI')
    expect(wrapper.text()).toContain('Nuxt 4 + OpenAI')

    const homeLink = wrapper.find('a[href="/"]')
    expect(homeLink.exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
