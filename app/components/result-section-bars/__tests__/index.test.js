import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ResultSectionBars from '../index.vue'

describe('ResultSectionBars', () => {
  it('renderiza as barras de avaliacao por secao', async () => {
    const wrapper = await mountSuspended(ResultSectionBars, {
      props: {
        items: [
          { label: 'Resumo', score: 8, color: '#5b8def' },
          { label: 'Experiencia', score: 9, color: '#10b981' },
          { label: 'Formacao', score: 7, color: '#f59e0b' },
        ],
      },
    })

    expect(wrapper.text()).toContain('Avaliacao por Secao')
    expect(wrapper.text()).toContain('Resumo')
    expect(wrapper.text()).toContain('Experiencia')
    expect(wrapper.text()).toContain('Formacao')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('9')
    expect(wrapper.text()).toContain('7')
    expect(wrapper.html()).toMatchSnapshot()
  })
})
