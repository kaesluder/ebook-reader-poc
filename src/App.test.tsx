import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders the FileLoader component inside the toolbar dropdown', async () => {
    render(<App />)
    await userEvent.click(screen.getByText(/menu/i))
    expect(screen.getByLabelText(/select an epub file to load/i)).toBeInTheDocument()
  })
})
