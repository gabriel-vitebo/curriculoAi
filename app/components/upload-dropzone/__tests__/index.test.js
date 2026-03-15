import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import UploadDropzone from '../index.vue'

describe('UploadDropzone', () => {
  it('renderiza a area de envio de PDF', async () => {
    const wrapper = await mountSuspended(UploadDropzone)

    expect(wrapper.text()).toContain('Arraste ou selecione seu arquivo PDF.')
    expect(wrapper.text()).toContain('Na proxima etapa vamos extrair o texto do curriculo e enviar para analise.')
    expect(wrapper.find('input[type="file"][accept="application/pdf"]').exists()).toBe(true)
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.html()).toMatchSnapshot()
  })
})
