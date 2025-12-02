import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { NOTE_COLORS } from '../types';

describe('Toolbar', () => {
  const mockOnColorChange = vi.fn();
  const mockOnResetView = vi.fn();
  const mockOnEnterAddMode = vi.fn();

  const defaultProps = {
    activeColor: 'yellow' as const,
    onColorChange: mockOnColorChange,
    zoomPercent: 100,
    onResetView: mockOnResetView,
    onEnterAddMode: mockOnEnterAddMode,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all toolbar elements', () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByText('Sticky Canvas')).toBeInTheDocument();
    expect(screen.getByText('Add Note')).toBeInTheDocument();
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
    expect(screen.getByText('Reset View')).toBeInTheDocument();
  });

  it('should render all color swatches', () => {
    render(<Toolbar {...defaultProps} />);

    NOTE_COLORS.forEach(color => {
      const buttons = screen.getAllByRole('button');
      const colorButton = buttons.find(btn => 
        btn.className.includes(
          color === 'yellow' ? 'bg-yellow-200' :
          color === 'pink' ? 'bg-pink-200' :
          color === 'blue' ? 'bg-sky-200' :
          'bg-green-200'
        )
      );
      expect(colorButton).toBeInTheDocument();
    });
  });

  it('should highlight active color with ring', () => {
    const { rerender } = render(<Toolbar {...defaultProps} activeColor="yellow" />);
    
    const buttons = screen.getAllByRole('button');
    const yellowButton = buttons.find(btn => btn.className.includes('bg-yellow-200'));
    expect(yellowButton?.className).toContain('ring-2 ring-black');

    rerender(<Toolbar {...defaultProps} activeColor="pink" />);
    
    const newButtons = screen.getAllByRole('button');
    const pinkButton = newButtons.find(btn => btn.className.includes('bg-pink-200'));
    expect(pinkButton?.className).toContain('ring-2 ring-black');
  });

  it('should call onColorChange when color button is clicked', () => {
    render(<Toolbar {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const pinkButton = buttons.find(btn => btn.className.includes('bg-pink-200'));
    
    if (pinkButton) {
      fireEvent.click(pinkButton);
      expect(mockOnColorChange).toHaveBeenCalledWith('pink');
    }
  });

  it('should call onEnterAddMode when Add Note button is clicked', () => {
    render(<Toolbar {...defaultProps} />);

    const addNoteButton = screen.getByText('Add Note');
    fireEvent.click(addNoteButton);

    expect(mockOnEnterAddMode).toHaveBeenCalled();
  });

  it('should call onResetView when Reset View button is clicked', () => {
    render(<Toolbar {...defaultProps} />);

    const resetViewButton = screen.getByText('Reset View');
    fireEvent.click(resetViewButton);

    expect(mockOnResetView).toHaveBeenCalled();
  });

  it('should display correct zoom percentage', () => {
    const { rerender } = render(<Toolbar {...defaultProps} zoomPercent={125} />);
    
    expect(screen.getByText('Zoom: 125%')).toBeInTheDocument();

    rerender(<Toolbar {...defaultProps} zoomPercent={50} />);
    
    expect(screen.getByText('Zoom: 50%')).toBeInTheDocument();
  });

  it('should have fixed positioning styles', () => {
    const { container } = render(<Toolbar {...defaultProps} />);
    
    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar.style.position).toBe('fixed');
    expect(toolbar.style.top).toBe('0px');
    expect(toolbar.style.left).toBe('0px');
  });

  it('should have isolation styles to prevent transform inheritance', () => {
    const { container } = render(<Toolbar {...defaultProps} />);
    
    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar.style.isolation).toBe('isolate');
    expect(toolbar.style.contain).toBe('layout style paint');
  });
});

