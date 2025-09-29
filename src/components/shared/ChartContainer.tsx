import React, { useRef, useEffect, useState } from 'react';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver if available for better detection
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full min-h-[360px] ${className}`}
      style={{ width: dimensions.width || '100%', height: dimensions.height || 360 }}
    >
      {dimensions.width > 0 && dimensions.height > 0 ? children : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart...</div>
        </div>
      )}
    </div>
  );
};
