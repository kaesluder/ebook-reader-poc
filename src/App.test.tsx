import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the FileLoader component', () => {
    render(<App />)
    expect(screen.getByLabelText(/select an epub file to load/i)).toBeInTheDocument()
  })
})
