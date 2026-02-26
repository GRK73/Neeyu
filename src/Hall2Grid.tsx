import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import './Hall2Grid.css';

interface AnimatedItemProps {
  children: React.ReactNode;
  index: number;
  onClick: (e: React.MouseEvent) => void;
}

const AnimatedItem = ({ children, index, onClick }: AnimatedItemProps) => {
  const ref = useRef(null);
  // triggerOnce 대신 프레임워크 호환 옵션 확인
  const inView = useInView(ref, { amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.3, delay: (index % 3) * 0.1 }}
      className="hall2-item"
    >
      {children}
    </motion.div>
  );
};

interface Hall2GridProps {
  allImages: string[];
  onItemClick: (data: any) => void;
}

const Hall2Grid = ({ allImages, onItemClick }: Hall2GridProps) => {
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  
  const topInView = useInView(topSentinelRef);
  const bottomInView = useInView(bottomSentinelRef);

  useEffect(() => {
    if (allImages.length > 0 && displayItems.length === 0) {
      const initial = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 60);
      setDisplayItems(initial);
      
      setTimeout(() => {
        const root = document.querySelector('.museum-root');
        if (root) {
          root.scrollTo({ top: 1500 });
        }
      }, 100);
    }
  }, [allImages, displayItems.length]);

  useEffect(() => {
    if (bottomInView && allImages.length > 0) {
      const more = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 15);
      setDisplayItems(prev => [...prev, ...more]);
    }
  }, [bottomInView, allImages]);

  useEffect(() => {
    if (topInView && displayItems.length > 0) {
      const more = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 15);
      setDisplayItems(prev => [...more, ...prev]);
      
      const root = document.querySelector('.museum-root');
      if (root) {
        root.scrollBy({ top: 500 });
      }
    }
  }, [topInView, allImages, displayItems.length]);

  return (
    <div className="hall2-grid-container">
      <div ref={topSentinelRef} className="sentinel top" />
      
      <div className="hall2-grid">
        {displayItems.map((imgName, index) => (
          <AnimatedItem 
            key={`${imgName}-${index}`} 
            index={index}
            onClick={(e: React.MouseEvent) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                onItemClick({
                    image: `/img/${imgName}`,
                    centerX: rect.left + rect.width / 2,
                    centerY: rect.top + rect.height / 2,
                    width: rect.width,
                    height: rect.height,
                    rotation: 0
                });
            }}
          >
            <div className="hall2-photo-frame">
              <img src={`/img/${imgName}`} alt={`photo-${index}`} loading="lazy" />
              <div className="hall2-rainbow-border"></div>
            </div>
          </AnimatedItem>
        ))}
      </div>
      
      <div ref={bottomSentinelRef} className="sentinel bottom" />
      
      <div className="top-gradient"></div>
      <div className="bottom-gradient"></div>
    </div>
  );
};

export default Hall2Grid;
