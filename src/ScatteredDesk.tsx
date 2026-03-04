import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import './ScatteredDesk.css';

interface PolaroidProps {
  imgName: string;
  onItemClick: (data: any) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  bringToFront: () => number;
}

const Polaroid = ({ imgName, onItemClick, containerRef, bringToFront }: PolaroidProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  
  // 가로(vw) 범위를 대폭 늘려 좌우로 시원하게 흩어지게 함
  const randomTopOffset = useMemo(() => Math.random() * 50 - 25, []); // -25vh ~ +25vh
  const randomLeftOffset = useMemo(() => Math.random() * 80 - 40, []); // -40vw ~ +40vw
  const randomRotation = useMemo(() => Math.random() * 60 - 30, []);

  const [zIndex, setZIndex] = useState(1);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // 부모로부터 가장 높은 z-index 값을 받아와서 적용
    const newTopZ = bringToFront();
    setZIndex(newTopZ);
    
    dragStartTime.current = Date.now();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const timeLapse = Date.now() - dragStartTime.current;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (timeLapse < 300 && distance < 10) {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        
        onItemClick({
          image: `/FanArts/${imgName}`,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: 250,
          height: 300, 
          rotation: (randomRotation * Math.PI) / 180 
        });
      }
    }
  };

  return (
    <motion.div
      ref={itemRef}
      className="polaroid-wrapper"
      style={{ 
        zIndex,
        top: `calc(50% - 150px + ${randomTopOffset}vh)`,
        left: `calc(50% - 125px + ${randomLeftOffset}vw)`,
        position: 'absolute'
      }}
      drag
      dragConstraints={containerRef}
      dragElastic={0.1}
      dragMomentum={false}
      whileDrag={{ scale: 1.1, cursor: 'grabbing', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}
      initial={{ 
        opacity: 0, 
        scale: 0.5,
        rotate: randomRotation 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.5, type: 'spring' } 
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      whileHover={{ scale: 1.05 }}
    >
      <div className="polaroid-frame">
        <img src={`/FanArts/${imgName}`} alt="Fan Art" draggable="false" />
      </div>
    </motion.div>
  );
};

interface ScatteredDeskProps {
  allFanArts: string[];
  onItemClick: (data: any) => void;
}

const ScatteredDesk = ({ allFanArts, onItemClick }: ScatteredDeskProps) => {
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 전체 사진 중 가장 높은 z-index 추적
  const topZIndexRef = useRef(10);

  const bringToFront = useCallback(() => {
    topZIndexRef.current += 1;
    return topZIndexRef.current;
  }, []);

  useEffect(() => {
    if (allFanArts.length > 0) {
      const shuffled = [...allFanArts].sort(() => 0.5 - Math.random());
      // 표시되는 개수를 15장으로 줄임
      setDisplayItems(shuffled.slice(0, 15)); 
    }
  }, [allFanArts]);

  return (
    <div className="desk-container" ref={containerRef}>
      {displayItems.map((imgName, idx) => (
        <Polaroid 
          key={`${imgName}-${idx}`} 
          imgName={imgName} 
          onItemClick={onItemClick} 
          containerRef={containerRef} 
          bringToFront={bringToFront}
        />
      ))}
    </div>
  );
};

export default ScatteredDesk;
