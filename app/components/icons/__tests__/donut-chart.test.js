import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import IconsDonutChart from '../donut-chart.vue'

describe('IconsDonutChart', () => {
  it('renderiza o grafico de rosca com os segmentos informados', async () => {
    const wrapper = await mountSuspended(IconsDonutChart, {
      props: {
        radius: 74,
        segments: [
          { label: 'Bem estruturado', color: '#b9d4a3', dash: '120 464.96', offset: 0 },
          { label: 'Aceitavel', color: '#9bbbd5', dash: '170 464.96', offset: -120 },
          { label: 'Precisa de revisao', color: '#e8c488', dash: '174.96 464.96', offset: -290 },
        ],
      },
    })

    expect(wrapper.find('svg[aria-label="Distribuicao da avaliacao"]').exists()).toBe(true)
    expect(wrapper.findAll('circle')).toHaveLength(5)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
