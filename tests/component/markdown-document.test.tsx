import React from 'react'
import { render, screen } from '@testing-library/react'
import { MarkdownDocument } from '../../src/components/markdown-document'

describe('MarkdownDocument', () => {
  it('renders headings and paragraphs', () => {
    render(<MarkdownDocument markdown={`# Title

Hello world.`} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Hello world.')).toBeInTheDocument()
  })

  it('can hide the first heading', () => {
    render(<MarkdownDocument markdown={`# Title

Hello world.`} hideFirstHeading />)

    expect(screen.queryByText('Title')).not.toBeInTheDocument()
    expect(screen.getByText('Hello world.')).toBeInTheDocument()
  })
})
