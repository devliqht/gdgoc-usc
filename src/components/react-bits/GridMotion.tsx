import { useEffect, useRef, type FC, useState } from 'react';
import { gsap } from 'gsap';

interface GridMotionProps {
  items?: string[];
  gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({
  items = [],
  gradientColor = 'black',
}) => {
  const [isDark, setIsDark] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseXRef = useRef<number>(window.innerWidth / 2);
  const autoScrollRef = useRef<number>(0);

  const totalItems = 28;
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`
  );
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e: MouseEvent): void => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = (): void => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      // Auto-scroll animation
      autoScrollRef.current += 0.5;
      const autoScrollX =
        Math.sin(autoScrollRef.current * 0.01) * window.innerWidth * 0.3;

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;

          // Combine mouse movement with auto-scroll
          const mouseInfluence =
            (mouseXRef.current / window.innerWidth) * maxMoveAmount -
            maxMoveAmount / 2;
          const autoScrollInfluence = autoScrollX * 0.3;
          const moveAmount = (mouseInfluence + autoScrollInfluence) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration:
              baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      removeAnimationLoop();
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={gridRef} className='h-full w-full overflow-hidden'>
      <section
        className='w-full h-screen overflow-hidden relative flex items-center justify-center'
        style={{
          background: `radial-gradient(circle, ${isDark ? 'black' : 'white'} 0%, transparent 100%)`,
        }}
      >
        <div className='absolute inset-0 pointer-events-none z-[4] bg-[length:250px]'></div>
        <div className='gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center z-[2]'>
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className='grid gap-4 grid-cols-7'
              style={{ willChange: 'transform, filter' }}
              ref={el => {
                if (el) rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className='relative'>
                    <div className='relative w-full h-full overflow-hidden rounded-[10px] bg-white dark:bg-[#111] flex items-center justify-center text-black dark:text-white text-[1.5rem]'>
                      {typeof content === 'string' &&
                      (content.startsWith('http') ||
                        content.startsWith('/')) ? (
                        <div
                          className='w-full h-full bg-cover bg-center absolute top-0 left-0'
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className='p-4 text-center z-[1]'>{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className='relative w-full h-full top-0 left-0 pointer-events-none'></div>
      </section>
    </div>
  );
};

export default GridMotion;
