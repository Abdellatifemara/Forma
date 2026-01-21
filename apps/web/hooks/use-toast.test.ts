import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from './use-toast';

describe('useToast', () => {
  beforeEach(() => {
    // Reset toast state between tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial state with empty toasts', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description',
      });
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('Test Description');
  });

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
      });
      toastId = id;
    });

    expect(result.current.toasts.length).toBeGreaterThan(0);

    act(() => {
      result.current.dismiss(toastId);
    });

    // After dismissing, the toast should be marked for removal
    expect(result.current.toasts[0]?.open).toBe(false);
  });

  it('should add toast with different variants', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Default Toast',
      });
    });

    expect(result.current.toasts[0].variant).toBeUndefined();

    act(() => {
      result.current.toast({
        title: 'Destructive Toast',
        variant: 'destructive',
      });
    });

    // Should have the destructive toast
    const destructiveToast = result.current.toasts.find(
      (t) => t.title === 'Destructive Toast'
    );
    expect(destructiveToast?.variant).toBe('destructive');
  });

  it('should support toast with action', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = {
      label: 'Undo',
      onClick: jest.fn(),
    };

    act(() => {
      result.current.toast({
        title: 'Action Toast',
        action: mockAction,
      });
    });

    expect(result.current.toasts[0].action).toBeDefined();
    expect(result.current.toasts[0].action?.label).toBe('Undo');
  });

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });

    expect(result.current.toasts.length).toBe(3);
  });
});
