import { useState, useEffect, useCallback } from 'react';
import CircularGallery from './CircularGallery';
import Hall2Grid from './Hall2Grid';
import DomeGallery from './DomeGallery';
import ScatteredDesk from './ScatteredDesk';
import './App.css';

function App() {
  const [images, setImages] = useState<string[]>([]);
  const [fanarts, setFanarts] = useState<string[]>([]);
  const [galleryItems, setGalleryItems] = useState<{ image: string; text: string }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 고유 갱신 키
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentHall, setCurrentHall] = useState('제 1 전시관');
  const [selectedItem, setSelectedItem] = useState<{ 
    image: string, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number, 
    rotation: number, 
    arrivalWidth: number,
    arrivalHeight: number,
    naturalWidth: number, 
    naturalHeight: number
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    fetch('/images.json')
      .then((res) => res.json())
      .then((data: string[]) => {
        setImages(data);
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setGalleryItems(shuffled.slice(0, 15).map((name) => ({
          image: `/img/${name}`,
          text: ""
        })));
      });

    fetch('/fanarts.json')
      .then((res) => res.json())
      .then((data: string[]) => {
        setFanarts(data);
      })
      .catch((err) => console.error("FanArts 로드 실패:", err));
  }, []);

  const refreshGallery = () => {
    if (images.length === 0 && fanarts.length === 0) return;
    if (isRefreshing) return;
    
    // 1. 페이드 아웃 시작
    setIsRefreshing(true);

    // 2. 완전히 사라진 후(500ms) 데이터 교체
    setTimeout(() => {
      if (currentHall !== 'Fan Arts' && images.length > 0) {
        const shuffled = [...images].sort(() => 0.5 - Math.random());
        setGalleryItems(shuffled.slice(0, 15).map((name) => ({
          image: `/img/${name}`,
          text: ""
        })));
      }
      
      if (currentHall === 'Fan Arts' && fanarts.length > 0) {
        setFanarts(prev => [...prev].sort(() => 0.5 - Math.random()));
      }

      // 데이터가 완전히 교체된 후 컴포넌트를 단 한 번만 다시 마운트
      setRefreshKey(prev => prev + 1);

      // 3. 내용 교체 후 다시 페이드 인
      setTimeout(() => {
        setIsRefreshing(false);
      }, 50);
    }, 500); 
  };

  const changeHall = (hallName: string) => {
    if (hallName === currentHall || isRefreshing) return;
    
    setIsRefreshing(true);
    setIsMenuOpen(false);

    setTimeout(() => {
      setCurrentHall(hallName);
      window.scrollTo(0, 0);
      
      const shuffled = [...images].sort(() => 0.5 - Math.random());
      setGalleryItems(shuffled.slice(0, 15).map((name) => ({
        image: `/img/${name}`,
        text: ""
      })));

      setRefreshKey(prev => prev + 1);
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 50);
    }, 500);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleItemClick = useCallback((data: any) => {
    const img = new Image();
    img.src = data.image;
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const maxWidth = window.innerWidth * 0.85;
      const maxHeight = window.innerHeight * 0.85;
      const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
      
      const finalW = naturalWidth * ratio;
      const finalH = naturalHeight * ratio;

      const targetScale = Math.min(maxWidth / data.width, maxHeight / data.height);
      const arrivalW = data.width * targetScale;
      const arrivalH = data.height * targetScale;

      setSelectedItem({ 
        ...data, 
        arrivalWidth: arrivalW,
        arrivalHeight: arrivalH,
        naturalWidth: finalW, 
        naturalHeight: finalH
      });
      
      setIsAnimating(false);
      setIsExpanded(false);
      setIsClosing(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setTimeout(() => {
            setIsExpanded(true);
          }, 450);
        });
      });
    };
  }, []);

  const handleCloseModal = () => {
    if (!isAnimating || isClosing) return;
    
    setIsClosing(true);
    setIsExpanded(false);
    
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setSelectedItem(null);
        setIsClosing(false);
      }, 450);
    }, 400);
  };

  return (
    <div className="museum-root">
      <div className="bg-glow"></div>
      
      <header className="museum-header">
        <div className="header-content">
          <div className="title-group">
            <h1 className="museum-title">NEEYU ARCHIVE</h1>
            <p className="current-hall-label">{currentHall}</p>
          </div>
          
          <div className="header-controls">
            <button className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          
          <nav className={`museum-nav ${isMenuOpen ? 'show' : ''}`}>
            <div className="nav-close" onClick={toggleMenu}>CLOSE ×</div>
            <ul>
              <li><a href="#" onClick={() => changeHall('제 1 전시관')}>제 1 전시관</a></li>
              <li><a href="#" onClick={() => changeHall('제 2 전시관')}>제 2 전시관</a></li>
              <li><a href="#" onClick={() => changeHall('제 3 전시관')}>제 3 전시관</a></li>
              <li><a href="#" onClick={() => changeHall('Fan Arts')}>Fan Arts</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={`main-content ${isRefreshing ? 'fade-out' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
        <section className="circular-section">
          <div className="circular-container">
            {currentHall === '제 1 전시관' ? (
              galleryItems.length > 0 && (
                <CircularGallery 
                  items={galleryItems} 
                  bend={1.5} 
                  textColor="#ffffff" 
                  borderRadius={0.05} 
                  scrollEase={0.05} 
                  onItemClick={handleItemClick}
                />
              )
            ) : currentHall === '제 2 전시관' ? (
              <Hall2Grid allImages={images} onItemClick={handleItemClick} />
            ) : currentHall === '제 3 전시관' ? (
              <DomeGallery 
                key={`dome-${refreshKey}`} // 고유 키 사용
                images={images} 
                fit={2.5}
                maxVerticalRotationDeg={0}
                segments={34}
                dragDampening={2}
                grayscale={false}
              />
            ) : (
              <ScatteredDesk 
                key={`fanarts-${refreshKey}`} // 고유 키 사용
                allFanArts={fanarts} 
                onItemClick={handleItemClick} 
              />
            )}
          </div>
        </section>
      </main>

      {(currentHall === '제 1 전시관' || currentHall === '제 3 전시관' || currentHall === 'Fan Arts') && (
        <button 
          className={`refresh-button fixed-bottom ${isRefreshing ? 'loading' : ''}`} 
          onClick={refreshGallery}
          disabled={isRefreshing}
        >
          ↻
        </button>
      )}

      {selectedItem && (
        <>
          <div 
            className={`overlay-backdrop ${isAnimating ? 'show' : ''}`}
            onClick={handleCloseModal}
          />
          <div 
            className={`flying-image ${isAnimating ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}
            style={{
              width: isExpanded ? `${selectedItem.naturalWidth}px` : (isAnimating ? `${selectedItem.arrivalWidth}px` : `${selectedItem.width}px`),
              height: isExpanded ? `${selectedItem.naturalHeight}px` : (isAnimating ? `${selectedItem.arrivalHeight}px` : `${selectedItem.height}px`),
              top: isAnimating ? '50%' : `${selectedItem.centerY}px`,
              left: isAnimating ? '50%' : `${selectedItem.centerX}px`,
              transform: `translate(-50%, -50%) rotate(${isAnimating ? 0 : selectedItem.rotation}rad)`
            }}
            onClick={handleCloseModal}
          >
            <div className="flying-inner">
              <img src={selectedItem.image} alt="Enlarged" />
              <div className="flying-rainbow-border"></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
