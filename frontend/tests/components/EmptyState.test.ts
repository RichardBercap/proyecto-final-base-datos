import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import EmptyState from '@/components/common/EmptyState.vue'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(EmptyState, {
      props: {
        title: 'Sin datos',
        description: 'No hay registros disponibles.'
      }
    })

    expect(screen.getByText('Sin datos')).toBeInTheDocument()
    expect(screen.getByText('No hay registros disponibles.')).toBeInTheDocument()
  })
})
