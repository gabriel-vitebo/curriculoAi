import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import BaseModal from '../index.vue'

describe('BaseModal', () => {
  it('renderiza o conteudo do modal', async () => {
    const wrapper = await mountSuspended(BaseModal, {
      props: {
        title: 'Analise concluida',
        description: 'Seu curriculo foi processado com sucesso.',
      },
    })

    expect(wrapper.text()).toContain('Analise concluida')
    expect(wrapper.text()).toContain('Seu curriculo foi processado com sucesso.')
    expect(wrapper.text()).toContain('OK')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
