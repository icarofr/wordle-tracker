import type { Resource } from 'solid-js'
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ResourceBoundary } from './ResourceBoundary'

function mockResource<T>(state: 'loading' | 'error' | 'success', data?: T, error?: Error): Resource<T> {
  const fn = (() => data) as Resource<T>
  Object.defineProperty(fn, 'loading', { get: () => state === 'loading' })
  Object.defineProperty(fn, 'error', { get: () => state === 'error' ? (error ?? new Error('Test error')) : undefined })
  return fn
}

describe('resourceBoundary', () => {
  it('shows default loading fallback when resource is loading', () => {
    const resource = mockResource<string>('loading')
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span>{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows custom loading fallback when provided', () => {
    const resource = mockResource<string>('loading')
    render(() => (
      <ResourceBoundary data={resource} loadingFallback={<span>Custom loading...</span>}>
        {data => <span>{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('shows default error fallback when resource has error', () => {
    const resource = mockResource<string>('error', undefined, new Error('Something went wrong'))
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span>{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
  })

  it('shows custom error fallback when provided', () => {
    const resource = mockResource<string>('error', undefined, new Error('fetch failed'))
    render(() => (
      <ResourceBoundary
        data={resource}
        errorFallback={err => (
          <span>
            Custom error:
            {err.message}
          </span>
        )}
      >
        {data => <span>{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByText(/Custom error/)).toBeInTheDocument()
    expect(screen.getByText(/fetch failed/)).toBeInTheDocument()
  })

  it('renders children with data when resource succeeds', () => {
    const resource = mockResource<string>('success', 'Hello World')
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span data-testid="content">{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByTestId('content')).toHaveTextContent('Hello World')
  })

  it('renders children with object data when resource succeeds', () => {
    const resource = mockResource<{ name: string }>('success', { name: 'Alice' })
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span data-testid="name">{data.name}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByTestId('name')).toHaveTextContent('Alice')
  })

  it('does not show children when loading', () => {
    const resource = mockResource<string>('loading')
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span data-testid="content">{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('does not show children when error', () => {
    const resource = mockResource<string>('error')
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span data-testid="content">{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('wraps non-Error error values in an Error object', () => {
    const resource = mockResource<string>('error', undefined, new Error('raw string error'))
    render(() => (
      <ResourceBoundary data={resource}>
        {data => <span>{data}</span>}
      </ResourceBoundary>
    ))
    expect(screen.getByText(/raw string error/)).toBeInTheDocument()
  })
})
