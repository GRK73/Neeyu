import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import './Hall2Grid.css';

const AnimatedItem = ({ children, delay = 0, index, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.2, triggerOnce: false });
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

const Hall2Grid = ({ allImages, onItemClick }) => {
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  
  const topInView = useInView(topSentinelRef);
  const bottomInView = useInView(bottomSentinelRef);

  // 1. 초기 로드: 60장을 불러오고 중간으로 스크롤 이동
  useEffect(() => {
    if (allImages.length > 0 && displayItems.length === 0) {
      const initial = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 60);
      setDisplayItems(initial);
      
      // 약간의 지연 후 중간 지점으로 스크롤 (위로 올릴 공간 확보)
      setTimeout(() => {
        const root = document.querySelector('.museum-root');
        if (root) {
          root.scrollTo({ top: 1500 }); // 대략적인 중간 위치
        }
      }, 100);
    }
  }, [allImages]);

  // 2. 아래로 스크롤 시 추가 로딩
  useEffect(() => {
    if (bottomInView && allImages.length > 0) {
      const more = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 15);
      setDisplayItems(prev => [...prev, ...more]);
    }
  }, [bottomInView, allImages]);

  // 3. 위로 스크롤 시 상단에 추가 로딩
  useEffect(() => {
    if (topInView && displayItems.length > 0) {
      const more = [...allImages].sort(() => 0.5 - Math.random()).slice(0, 15);
      setDisplayItems(prev => [...more, ...prev]);
      
      // 사진이 추가되면서 스크롤 위치가 튀는 것을 방지 (추가된 만큼 아래로 밀어줌)
      const root = document.querySelector('.museum-root');
      if (root) {
        // 대략적인 사진 높이만큼 현재 위치 유지
        root.scrollBy({ top: 500 });
      }
    }
  }, [topInView, allImages]);

  return (
    <div className="hall2-grid-container">
      {/* 상단 무한 스크롤 트리거 */}
      <div ref={topSentinelRef} className="sentinel top" />
      
      <div className="hall2-grid">
        {displayItems.map((imgName, index) => (
          <AnimatedItem 
            key={`${imgName}-${index}`} 
            index={index}
            onClick={(e) => {
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
      
      {/* 하단 무한 스크롤 트리거 */}
      <div ref={bottomSentinelRef} className="sentinel bottom" />
      
      <div className="top-gradient"></div>
      <div className="bottom-gradient"></div>
    </div>
  );
};

export default Hall2Grid;
