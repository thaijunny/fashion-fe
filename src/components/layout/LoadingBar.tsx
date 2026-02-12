'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Top-of-page loading bar that shows during Next.js route transitions.
 * Intercepts link clicks and shows a progress bar animation.
 */
export default function LoadingBar() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startLoading = useCallback(() => {
        setLoading(true);
        setProgress(0);

        // Simulate progress
        let current = 0;
        intervalRef.current = setInterval(() => {
            current += Math.random() * 15;
            if (current > 90) current = 90;
            setProgress(current);
        }, 200);
    }, []);

    const stopLoading = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setProgress(100);

        timeoutRef.current = setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 300);
    }, []);

    useEffect(() => {
        // Intercept clicks on <a> tags that trigger navigation
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Skip external links, hash links, and same-page links
            if (
                href.startsWith('http') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                anchor.target === '_blank' ||
                e.ctrlKey || e.metaKey || e.shiftKey
            ) {
                return;
            }

            // Skip if navigating to the same page
            if (href === window.location.pathname) return;

            startLoading();
        };

        document.addEventListener('click', handleClick, true);

        // Use MutationObserver to detect when the page content changes (route complete)
        const observer = new MutationObserver(() => {
            if (loading) {
                stopLoading();
            }
        });

        observer.observe(document.querySelector('main') || document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            document.removeEventListener('click', handleClick, true);
            observer.disconnect();
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [loading, startLoading, stopLoading]);

    if (!loading && progress === 0) return null;

    return (
        <div className="loading-bar-container">
            <div
                className="loading-bar"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
