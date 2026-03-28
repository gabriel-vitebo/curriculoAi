import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import IconsAppHeaderMark from '../app-header-mark.vue'

describe('IconsAppHeaderMark', () => {
  it('renderiza o icone da marca do cabecalho', async () => {
    const wrapper = await mountSuspended(IconsAppHeaderMark)

    expect(wrapper.find('svg[aria-hidden="true"]').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
