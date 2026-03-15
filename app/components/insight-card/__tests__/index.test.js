import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import InsightCard from '../index.vue'

describe('InsightCard', () => {
  it('renderiza o titulo e a lista de insights', async () => {
    const wrapper = await mountSuspended(InsightCard, {
      props: {
        title: 'Pontos fortes',
        items: ['Resumo objetivo', 'Experiencia relevante', 'Boas palavras-chave'],
      },
    })

    expect(wrapper.text()).toContain('Pontos fortes')
    expect(wrapper.text()).toContain('Resumo objetivo')
    expect(wrapper.text()).toContain('Experiencia relevante')
    expect(wrapper.text()).toContain('Boas palavras-chave')
    expect(wrapper.html()).toMatchSnapshot()
  })
})
