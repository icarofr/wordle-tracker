import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { DashboardSubmitCard } from './DashboardSubmitCard'

vi.mock('solid-icons/cg', () => ({
  CgSpinner: () => <span data-testid="spinner" />,
}))

vi.mock('solid-icons/hi', () => ({
  HiSolidAdjustmentsVertical: () => <span data-testid="icon" />,
}))

describe('dashboardSubmitCard', () => {
  const baseProps = {
    isPending: false,
    value: '',
    onInput: vi.fn(),
    onSubmit: vi.fn(),
  }

  it('renders the form', () => {
    const { container } = render(() => <DashboardSubmitCard {...baseProps} />)
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('renders the textarea', () => {
    render(() => <DashboardSubmitCard {...baseProps} />)
    expect(screen.getByPlaceholderText(/Paste your Wordle/)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(() => <DashboardSubmitCard {...baseProps} />)
    expect(screen.getByRole('button', { name: /Submit Wordle/i })).toBeInTheDocument()
  })

  it('disables submit button when value is empty', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="" />)
    expect(screen.getByRole('button', { name: /Submit Wordle/i })).toBeDisabled()
  })

  it('disables submit button when value is only whitespace', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="   " />)
    expect(screen.getByRole('button', { name: /Submit Wordle/i })).toBeDisabled()
  })

  it('enables submit button when value has content', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="Wordle 123 4/6" />)
    expect(screen.getByRole('button', { name: /Submit Wordle/i })).not.toBeDisabled()
  })

  it('disables submit button when isPending', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="Wordle 123 4/6" isPending />)
    expect(screen.getByRole('button', { name: /Submit Wordle/i })).toBeDisabled()
  })

  it('shows spinner when isPending', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="Wordle 123 4/6" isPending />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn()
    render(() => (
      <DashboardSubmitCard
        {...baseProps}
        value="Wordle 123 4/6"
        onSubmit={onSubmit}
      />
    ))
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onInput when user types in textarea', () => {
    const onInput = vi.fn()
    render(() => <DashboardSubmitCard {...baseProps} onInput={onInput} />)
    const textarea = screen.getByPlaceholderText(/Paste your Wordle/)
    fireEvent.input(textarea, { target: { value: 'Wordle 123 4/6' } })
    expect(onInput).toHaveBeenCalledTimes(1)
    expect(onInput).toHaveBeenCalledWith('Wordle 123 4/6')
  })

  it('displays the card title', () => {
    render(() => <DashboardSubmitCard {...baseProps} />)
    expect(screen.getByText('Submit Your Wordle')).toBeInTheDocument()
  })

  it('displays the card subtitle', () => {
    render(() => <DashboardSubmitCard {...baseProps} />)
    expect(screen.getByText(/Paste today's share text/)).toBeInTheDocument()
  })

  it('reflects the current value in the textarea', () => {
    render(() => <DashboardSubmitCard {...baseProps} value="Wordle 500 3/6" />)
    const textarea = screen.getByPlaceholderText(/Paste your Wordle/)
    expect((textarea as HTMLTextAreaElement).value).toBe('Wordle 500 3/6')
  })
})
