import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothScroll = () => {
    const location = useLocation();

    useEffect(() => {
        // Disable Lenis for admin routes
        if (location.pathname.startsWith('/admin')) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, [location.pathname]);

    return null;
};

export default SmoothScroll;
