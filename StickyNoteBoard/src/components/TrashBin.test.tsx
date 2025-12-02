import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrashBin } from './TrashBin';

describe('TrashBin', () => {
  it('should render trash icon', () => {
    render(<TrashBin isActive={false} />);
    
    expect(screen.getByText('🗑')).toBeInTheDocument();
  });

  it('should have inactive styling when not active', () => {
    const { container } = render(<TrashBin isActive={false} />);
    
    const trashBin = container.firstChild as HTMLElement;
    expect(trashBin.className).not.toContain('bg-pink-200');
    expect(trashBin.className).toContain('bg-white');
  });

  it('should have active styling when active', () => {
    const { container } = render(<TrashBin isActive={true} />);
    
    const trashBin = container.firstChild as HTMLElement;
    expect(trashBin.className).toContain('bg-pink-200');
    expect(trashBin.className).toContain('border-pink-400');
    expect(trashBin.className).toContain('shadow-lg');
  });

  it('should have fixed positioning', () => {
    const { container } = render(<TrashBin isActive={false} />);
    
    const trashBin = container.firstChild as HTMLElement;
    expect(trashBin.className).toContain('fixed');
    expect(trashBin.className).toContain('bottom-4');
    expect(trashBin.className).toContain('right-4');
  });

  it('should be circular', () => {
    const { container } = render(<TrashBin isActive={false} />);
    
    const trashBin = container.firstChild as HTMLElement;
    expect(trashBin.className).toContain('rounded-full');
  });
});

