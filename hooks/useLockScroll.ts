import { useEffect } from 'react';

/**
 * Locks document scrolling (html & body overflow hidden) while the component using this hook is mounted.
 * Optionally also disables touch scroll / overscroll effects on mobile.
 */
export function useLockScroll(options: { disableTouch?: boolean } = {}) {
  const { disableTouch = true } = options;
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevTouchAction = body.style.touchAction;
    const prevOverscroll = (html.style as any).overscrollBehavior;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (disableTouch) {
      body.style.touchAction = 'none';
      (html.style as any).overscrollBehavior = 'none';
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      if (disableTouch) {
        body.style.touchAction = prevTouchAction;
        (html.style as any).overscrollBehavior = prevOverscroll;
      }
    };
  }, [disableTouch]);
}
