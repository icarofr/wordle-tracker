import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

vi.mock('solid-icons/cg', () => ({
  CgSpinner: () => <span data-testid="spinner" />,
}))

describe('button', () => {
  it('renders children', () => {
    render(() => <Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders as a button element', () => {
    render(() => <Button>Submit</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('is not disabled by default', () => {
    render(() => <Button>Go</Button>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('is disabled when the disabled prop is set', () => {
    render(() => <Button disabled>No</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading', () => {
    render(() => <Button loading>Save</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(() => <Button loading>Save</Button>)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('does not show spinner when not loading', () => {
    render(() => <Button>Save</Button>)
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn()
    render(() => <Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(() => <Button disabled onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const onClick = vi.fn()
    render(() => <Button loading onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the type attribute', () => {
    render(() => <Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('forwards additional props to the button element', () => {
    render(() => <Button data-testid="my-btn">Go</Button>)
    expect(screen.getByTestId('my-btn')).toBeInTheDocument()
  })
})
