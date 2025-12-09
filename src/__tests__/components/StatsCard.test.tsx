import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { StatsCard } from '@/components/instructor/StatsCard'

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: 42,
    icon: Users
  }

  it('renders title and value', () => {
    render(<StatsCard {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<StatsCard {...defaultProps} subtitle="Test subtitle" />)

    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('renders positive trend correctly', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 15, isPositive: true }}
      />
    )

    expect(screen.getByText('↑')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('renders negative trend correctly', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 10, isPositive: false }}
      />
    )

    expect(screen.getByText('↓')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('handles string value', () => {
    render(<StatsCard {...defaultProps} value="100%" />)

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatsCard {...defaultProps} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
