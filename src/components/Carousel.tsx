import React, { useState, useRef, useEffect } from 'react';

interface CarouselProps {
  images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = images.length;
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);
  
  // Preload adjacent images whenever the current slide changes
  useEffect(() => {
    if (images.length <= 1) return;
    
    // Define indexes of images to preload
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    const nextIndex = (currentIndex + 1) % totalImages;
    
    // Create image objects to trigger browser preloading
    const preloadImages = [currentIndex, prevIndex, nextIndex].map(index => {
      const img = new Image();
      img.src = images[index];
      return img;
    });
    
    // Cleanup function
    return () => {
      // Clear references to allow garbage collection
      preloadImages.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [currentIndex, images, totalImages]);

  // Touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) { // Swiped left
      handleNext();
    } else if (touchStartX.current - touchEndX.current < -75) { // Swiped right
      handlePrev();
    }
    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="carousel-container">
      <div 
        className="carousel-wrapper" 
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => {
          // Determine if this image should be loaded
          // Only load current, prev, and next images for better performance
          const shouldLoad = 
            index === currentIndex || 
            index === (currentIndex - 1 + totalImages) % totalImages || 
            index === (currentIndex + 1) % totalImages;
            
          return (
            <div className="carousel-slide" key={index}>
              {shouldLoad ? (
                <img src={image} alt={`Slide ${index + 1}`} loading="lazy" />
              ) : (
                <div className="carousel-placeholder" style={{ width: '100%', height: '100%', background: '#f5f5f5' }}></div>
              )}
            </div>
          );
        })}
      </div>

      {totalImages > 1 && (
        <>
          <button className="carousel-button prev" onClick={handlePrev}>&#10094;</button>
          <button className="carousel-button next" onClick={handleNext}>&#10095;</button>
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`carousel-dot ${currentIndex === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel; 