import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteCard } from './NoteCard';
import { createMockNote, createMockLock, createMockUser } from '../test/utils/testUtils';

describe('NoteCard', () => {
  const mockOnMouseDown = vi.fn();
  const mockOnChange = vi.fn();
  const mockOnStartEdit = vi.fn();
  const mockOnStopEdit = vi.fn();
  const localUserId = 'local-user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    note: createMockNote(),
    isSelected: false,
    lock: null,
    localUserId,
    onMouseDown: mockOnMouseDown,
    onChange: mockOnChange,
    onStartEdit: mockOnStartEdit,
    onStopEdit: mockOnStopEdit,
  };

  it('should render note with title and content', () => {
    render(<NoteCard {...defaultProps} />);

    expect(screen.getByDisplayValue('Test Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('should display placeholder text when fields are empty', () => {
    const emptyNote = createMockNote({ title: '', content: '' });
    render(<NoteCard {...defaultProps} note={emptyNote} />);

    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note...')).toBeInTheDocument();
  });

  it('should apply correct color classes', () => {
    const colors = ['yellow', 'pink', 'blue', 'green'] as const;
    
    colors.forEach(color => {
      const { container, unmount } = render(
        <NoteCard {...defaultProps} note={createMockNote({ color })} />
      );
      
      const noteCard = container.firstChild as HTMLElement;
      expect(noteCard.className).toContain(
        color === 'yellow' ? 'bg-yellow-200' :
        color === 'pink' ? 'bg-pink-200' :
        color === 'blue' ? 'bg-sky-200' :
        'bg-green-200'
      );
      
      unmount();
    });
  });

  it('should show selected state with shadow', () => {
    const { container } = render(<NoteCard {...defaultProps} isSelected={true} />);
    const noteCard = container.firstChild as HTMLElement;
    
    expect(noteCard.className).toContain('shadow-[0_0_0_2px_rgba(0,0,0,0.3)]');
  });

  it('should call onChange when title is edited', () => {
    render(<NoteCard {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Note');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(mockOnChange).toHaveBeenCalledWith({ title: 'New Title' });
  });

  it('should call onChange when content is edited', () => {
    render(<NoteCard {...defaultProps} />);
    
    const contentTextarea = screen.getByDisplayValue('Test content');
    fireEvent.change(contentTextarea, { target: { value: 'New content' } });

    expect(mockOnChange).toHaveBeenCalledWith({ content: 'New content' });
  });

  it('should call onStartEdit when input is focused', () => {
    render(<NoteCard {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Note');
    fireEvent.focus(titleInput);

    expect(mockOnStartEdit).toHaveBeenCalled();
  });

  it('should call onStopEdit when input loses focus', async () => {
    render(<NoteCard {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Note');
    fireEvent.focus(titleInput);
    fireEvent.blur(titleInput);

    // Wait for setTimeout
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockOnStopEdit).toHaveBeenCalled();
    });
  });

  it('should not call onStopEdit if focus moves to another input', async () => {
    render(<NoteCard {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Note');
    const contentTextarea = screen.getByDisplayValue('Test content');
    
    fireEvent.focus(titleInput);
    fireEvent.blur(titleInput);
    fireEvent.focus(contentTextarea);

    vi.advanceTimersByTime(100);

    // Should not call onStopEdit because focus moved to another input
    expect(mockOnStopEdit).not.toHaveBeenCalled();
  });

  it('should call onMouseDown when note is clicked', () => {
    const { container } = render(<NoteCard {...defaultProps} />);
    
    const noteCard = container.querySelector('[data-note-id]') as HTMLElement;
    expect(noteCard).toBeInTheDocument();
    
    fireEvent.mouseDown(noteCard);
    expect(mockOnMouseDown).toHaveBeenCalled();
  });

  it('should prevent default and stop propagation when locked by other user', () => {
    const lock = createMockLock({ userId: 'other-user-1' });
    render(<NoteCard {...defaultProps} lock={lock} />);
    
    const noteCard = document.querySelector('[data-note-id]') as HTMLElement;
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');
    const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation');
    
    fireEvent(noteCard, mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(mockOnMouseDown).not.toHaveBeenCalled();
  });

  it('should show lock overlay when locked by other user', () => {
    const lock = createMockLock({ 
      userId: 'other-user-1',
      username: 'Other User',
    });
    render(<NoteCard {...defaultProps} lock={lock} />);

    expect(screen.getByText('Other User is editing…')).toBeInTheDocument();
  });

  it('should make inputs readOnly when locked by other user', () => {
    const lock = createMockLock({ userId: 'other-user-1' });
    render(<NoteCard {...defaultProps} lock={lock} />);
    
    const titleInput = screen.getByDisplayValue('Test Note') as HTMLInputElement;
    const contentTextarea = screen.getByDisplayValue('Test content') as HTMLTextAreaElement;

    expect(titleInput.readOnly).toBe(true);
    expect(contentTextarea.readOnly).toBe(true);
  });

  it('should allow editing when locked by local user', () => {
    const lock = createMockLock({ userId: localUserId });
    render(<NoteCard {...defaultProps} lock={lock} />);
    
    const titleInput = screen.getByDisplayValue('Test Note') as HTMLInputElement;
    expect(titleInput.readOnly).toBe(false);
  });

  it('should have correct positioning styles', () => {
    const note = createMockNote({ x: 100, y: 200, zIndex: 5 });
    const { container } = render(<NoteCard {...defaultProps} note={note} />);
    
    const noteCard = container.firstChild as HTMLElement;
    expect(noteCard.style.left).toBe('100px');
    expect(noteCard.style.top).toBe('200px');
    expect(noteCard.style.zIndex).toBe('5');
  });

  it('should auto-resize textarea when content changes', () => {
    const { container } = render(<NoteCard {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('Test content') as HTMLTextAreaElement;
    const originalHeight = textarea.style.height;
    
    // Mock scrollHeight
    Object.defineProperty(textarea, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 100,
    });

    fireEvent.change(textarea, { target: { value: 'Longer content that should expand' } });

    expect(textarea.style.height).not.toBe(originalHeight);
  });

  it('should prevent click events from propagating on inputs', () => {
    render(<NoteCard {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Test Note');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(titleInput, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});

