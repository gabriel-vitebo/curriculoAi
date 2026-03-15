import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ResultDonutChart from '../index.vue'

describe('ResultDonutChart', () => {
  it('renderiza a distribuicao da avaliacao', async () => {
    const wrapper = await mountSuspended(ResultDonutChart, {
      props: {
        sections: [
          { label: 'Conteudo', value: 45, color: '#5b8def' },
          { label: 'Clareza', value: 30, color: '#f59e0b' },
          { label: 'Formato', value: 25, color: '#10b981' },
        ],
      },
    })

    expect(wrapper.text()).toContain('45% Conteudo')
    expect(wrapper.text()).toContain('30% Clareza')
    expect(wrapper.text()).toContain('25% Formato')
    expect(wrapper.find('svg[aria-label="Distribuicao da avaliacao"]').exists()).toBe(true)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
