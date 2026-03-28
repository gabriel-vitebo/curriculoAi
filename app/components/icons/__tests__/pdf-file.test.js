import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import IconsPdfFile from '../pdf-file.vue'

describe('IconsPdfFile', () => {
  it('renderiza o icone de arquivo PDF', async () => {
    const wrapper = await mountSuspended(IconsPdfFile)

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('PDF')
    expect(wrapper.html()).toMatchSnapshot()
  })
})
