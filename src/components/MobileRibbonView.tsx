import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import FloatingButton from './FloatingButton';
import BackgroundMedia from './BackgroundMedia';
import { fetchMarkdown } from '../utils/markdownUtils';
import { preloadAssets } from '../utils/preloadAssets';

interface MobileRibbonViewProps {
  ribbonData: {
    [key: string]: {
      text: string;
      path: string;
      color: string;
      media: {
        url: string;
        type: 'image' | 'video';
      };
      caseStudyUrl?: string;
    };
  };
  onProjectChange?: (index: number) => void;
  isMediaMode: boolean;
  toggleMode: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per slide

const MobileRibbonView = forwardRef<any, MobileRibbonViewProps>((props, ref) => {
  const { ribbonData, onProjectChange, isMediaMode, toggleMode } = props;
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const scrollAnimationRef = useRef<gsap.core.Tween | null>(null);
  const ribbonKeys = Object.keys(ribbonData).reverse();
  const currentRibbonId = ribbonKeys[currentIndex];
  const currentRibbonData = ribbonData[currentRibbonId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimations = useRef<gsap.core.Tween[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    getCurrentIndex: () => currentIndex,
    setIndex: (index: number) => {
      if (index >= 0 && index < ribbonKeys.length) {
        setCurrentIndex(index);
      }
    }
  }));
  
  // Handle auto-progression timer
  useEffect(() => {
    // Reset the progress bars
    resetProgressBars();
    
    // Start filling the current progress bar
    if (!isPaused) {
      startProgressAnimation(currentIndex);
    }
    
    // Set up the timer for auto-progression if not paused
    if (!isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        // Move to next story or back to beginning if at the end
        if (currentIndex < ribbonKeys.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setCurrentIndex(0);
        }
      }, STORY_DURATION);
    }
    
    return () => {
      // Clean up timer on unmount or when current index changes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, isPaused, ribbonKeys.length]);
  
  // Animation controls for progress bars
  const resetProgressBars = () => {
    // Kill any existing animations
    progressAnimations.current.forEach(anim => anim.kill());
    progressAnimations.current = [];
    
    // Reset all progress bars
    const progressBars = document.querySelectorAll('.pagination-dot-fill');
    progressBars.forEach((bar, index) => {
      const element = bar as HTMLElement;
      if (index < currentIndex) {
        // Previous slides are fully filled
        gsap.set(element, { scaleX: 1, transformOrigin: 'left' });
      } else if (index > currentIndex) {
        // Upcoming slides are empty
        gsap.set(element, { scaleX: 0, transformOrigin: 'left' });
      } else {
        // Current slide starts empty and will be animated
        gsap.set(element, { scaleX: 0, transformOrigin: 'left' });
      }
    });
  };
  
  const startProgressAnimation = (index: number) => {
    const progressBar = document.querySelector(`.pagination-dot-fill[data-index="${index}"]`);
    if (progressBar) {
      const animation = gsap.to(progressBar, {
        scaleX: 1,
        duration: STORY_DURATION / 1000,
        ease: 'linear'
      });
      
      progressAnimations.current.push(animation);
    }
  };
  
  const pauseProgressAnimation = () => {
    setIsPaused(true);
    progressAnimations.current.forEach(anim => anim.pause());
  };
  
  const resumeProgressAnimation = () => {
    setIsPaused(false);
    progressAnimations.current.forEach(anim => anim.play());
  };

  // Notify parent when current index changes
  useEffect(() => {
    if (onProjectChange) {
      onProjectChange(currentIndex);
    }
  }, [currentIndex, onProjectChange]);
  
  // Set up non-passive touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const touchStartHandler = (e: TouchEvent) => {
      // Allow interaction with toggle button
      if ((e.target as HTMLElement).closest('.video-toggle-switch-container')) {
        return;
      }
      e.preventDefault();
      setTouchStart(e.targetTouches[0].clientX);
      pauseProgressAnimation();
    };
    
    const touchMoveHandler = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.video-toggle-switch-container')) {
        return;
      }
      e.preventDefault();
      const currentX = e.targetTouches[0].clientX;
      setTouchEnd(currentX);
    };
    
    const touchEndHandler = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.video-toggle-switch-container')) {
        // If the touch ends on the toggle button, let its onChange handle it via label click simulation
        return;
      }
      e.preventDefault();
      
      if (!touchStart || !touchEnd) {
        resumeProgressAnimation();
        return;
      }
      
      const distance = touchStart - touchEnd;
      const isSwipeLeft = distance > 50;
      const isSwipeRight = distance < -50;
      
      if (isSwipeRight && currentIndex > 0) {
        // Swipe right to go to previous
        setCurrentIndex(prev => prev - 1);
      } else if (isSwipeLeft && currentIndex < ribbonKeys.length - 1) {
        // Swipe left to go to next
        setCurrentIndex(prev => prev + 1);
      } else if (Math.abs(distance) < 20) {
        handleTap(e);
      }
      
      // Reset
      setTouchStart(null);
      setTouchEnd(null);
      resumeProgressAnimation();
    };
    
    // Add event listeners with passive: false option
    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler, { passive: false });
    
    return () => {
      // Clean up
      container.removeEventListener('touchstart', touchStartHandler);
      container.removeEventListener('touchmove', touchMoveHandler);
      container.removeEventListener('touchend', touchEndHandler);
    };
  }, [currentIndex, touchStart, touchEnd, ribbonKeys.length]);
  
  // Function to handle taps for mobile (wrapped in useCallback)
  const handleTap = useCallback((e: TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Also ignore taps on toggle switch container
    if (target.closest('.floating-button') || target.closest('.video-toggle-switch-container')) {
      return; // Ignore taps on the 'View Project' or toggle button
    }

    const screenWidth = window.innerWidth;
    const tapX = ('changedTouches' in e) ? e.changedTouches[0].clientX : e.clientX;

    if (tapX > screenWidth / 2) {
      setCurrentIndex(prev => (prev < ribbonKeys.length - 1 ? prev + 1 : 0));
    } else {
      setCurrentIndex(prev => (prev > 0 ? prev - 1 : ribbonKeys.length - 1));
    }
  }, [ribbonKeys.length]);
  
  // WORKAROUND: Special handler for mobile devices that might not trigger onClick
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let lastTapTime = 0;
    
    const handleTouchStartForTap = (e: TouchEvent) => {
      // Allow interaction with toggle button
      if ((e.target as HTMLElement).closest('.video-toggle-switch-container')) {
         return;
      }
      lastTapTime = new Date().getTime();
      pauseProgressAnimation();
    };
    
    const handleTouchEndForTap = (e: TouchEvent) => {
      // Don't prevent default if the target is the toggle switch, let the browser handle label->checkbox interaction
      if (e.cancelable && !(e.target as HTMLElement).closest('.video-toggle-switch-container')) {
         e.preventDefault();
      }

      const currentTime = new Date().getTime();
      const tapTimeDiff = currentTime - lastTapTime;

      if (tapTimeDiff < 300) {
        const target = e.target as HTMLElement;
        // Check both the target and any parent elements up to 3 levels
        const isButton = target.closest('.floating-button') !== null;
        const isButtonWrapper = target.closest('.floating-button-wrapper') !== null;
        const isPagination = target.closest('.pagination-dots') !== null;
        const isToggleButton = target.closest('.video-toggle-switch-container') !== null; // Check toggle button container

        if (!isButton && !isButtonWrapper && !isPagination && !isToggleButton) { // Ignore toggle button taps
          handleTap(e);
        }
      }

      resumeProgressAnimation();
    };
    
    container.addEventListener('touchstart', handleTouchStartForTap, { passive: true });
    container.addEventListener('touchend', handleTouchEndForTap, { passive: false });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStartForTap);
      container.removeEventListener('touchend', handleTouchEndForTap);
    };
  }, [ribbonKeys.length, currentIndex, handleTap]);
  
  // For desktop clicks
  const handleClick = (e: React.MouseEvent) => {
    // Ignore clicks on toggle switch container as well
    if ((e.target as HTMLElement).closest('.floating-button') ||
        (e.target as HTMLElement).closest('.pagination-dots') ||
        (e.target as HTMLElement).closest('.video-toggle-switch-container')) {
      return;
    }

    handleTap(e);
  };
  
  // Start text animation on component mount and when ribbon changes
  useEffect(() => {
    // Only run this animation if in ribbon mode
    if (!isMediaMode && textPathRef.current) {
      // Set initial text
      textPathRef.current.textContent = currentRibbonData.text.repeat(20);
      gsap.set(textPathRef.current, { attr: { startOffset: '0%' } });
      
      // Create and start animation
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
      
      scrollAnimationRef.current = gsap.to(textPathRef.current, {
        attr: { startOffset: '-100%' },
        duration: 25,
        ease: 'linear',
        repeat: -1,
        onUpdate: function() {
          const textPath = textPathRef.current;
          if (!textPath) return;
          
          const offsetNum = parseFloat(textPath.getAttribute('startOffset') || '0');
          if (offsetNum < 0 && textPath.textContent && textPath.textContent.length < 5000) {
            textPath.textContent += currentRibbonData.text.repeat(10);
          }
        }
      });
    } else {
      // Kill animation if switching out of ribbon mode
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
        scrollAnimationRef.current = null;
      }
      if (textPathRef.current) {
         textPathRef.current.textContent = ''; // Clear text if not showing ribbon
      }
    }
    
    return () => {
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
    };
  // Rerun effect when mode changes too
  }, [currentRibbonId, currentRibbonData.text, isMediaMode]);
  
  // Helper to extract asset URLs from markdown
  const extractAssetUrls = (markdown: string): string[] => {
    const urls: string[] = [];
    const imgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(markdown))) {
      urls.push(match[1]);
    }
    const videoRegex = /\[video\]\(([^)]+)\)/g;
    while ((match = videoRegex.exec(markdown))) {
      urls.push(match[1]);
    }
    return urls;
  };

  const handleFloatingButtonClick = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLoading) return;
    const caseStudyUrl = currentRibbonData.caseStudyUrl;
    if (caseStudyUrl) {
      setIsLoading(true);
      try {
        // Animate out current view
        if (containerRef.current) {
          await gsap.to(containerRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' });
        }
        // Navigate immediately without waiting for assets to load
        navigate(caseStudyUrl);
        
        // Reset loading state after a short delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } catch (e) {
        console.error("Error during navigation transition:", e);
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`mobile-ribbon-container`}
      onClick={handleClick}
    >
      {/* Toggle Switch */}
      <label className="video-toggle-switch-container" onClick={(e) => e.stopPropagation()}>
        <span className="video-toggle-label">VIDEO</span>
        <input 
          type="checkbox" 
          checked={isMediaMode} 
          onChange={toggleMode} 
          className="video-toggle-checkbox" 
        />
        <span className="video-toggle-switch">
          <span className="video-toggle-knob"></span>
        </span>
      </label>
    
      {/* Background media for current ribbon (conditional) */}
      {isMediaMode && Object.entries(ribbonData).map(([ribbonId, data]) => (
        <BackgroundMedia
          key={`mobile-bg-${ribbonId}`}
          mediaUrl={data.media.url}
          type={data.media.type}
          isVisible={currentRibbonId === ribbonId}
          isMobile={true}
        />
      ))}
    
      <div 
        className="floating-button-wrapper"
        onClick={handleFloatingButtonClick}
        onTouchEnd={handleFloatingButtonClick}
        style={{ 
          position: 'absolute', 
          width: '100%',
          bottom: '70px',
          right: '20px',
          zIndex: 1001,
          textAlign: 'right'
        }}
      >
        <FloatingButton 
          isVisible={isMediaMode || isLoading} 
          position={{ x: 0, y: 0 }}
          activeRibbonId={currentRibbonId}
          isMobile={true}
          isLoading={isLoading}
        />
      </div>
      
      <div className="pagination-dots" onClick={(e) => e.stopPropagation()}>
        {ribbonKeys.map((key, index) => (
          <div 
            key={index}
            className="pagination-dot-container"
            onClick={() => setCurrentIndex(index)}
          >
            <div 
              className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
            >
              <div 
                className="pagination-dot-fill"
                data-index={index}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* SVG Ribbon (conditional) */}
      {!isMediaMode && (
        <svg
          viewBox="-300 -300 2040 1800"
          preserveAspectRatio="xMidYMid meet"
          className="mobile-ribbon-svg"
        >
          <g
            className="ribbon"
            style={{ cursor: 'pointer' }}
            id={`mobile-ribbon-${currentRibbonId}`}
          >
            <path
              className="ribbon-path"
              id={`mobile-path-${currentRibbonId}`}
              d={currentRibbonData.path}
              style={{ stroke: currentRibbonData.color }}
            />
            <text>
              <textPath
                ref={textPathRef}
                href={`#mobile-path-${currentRibbonId}`}
                startOffset="-50%"
                dy="-10"
              />
            </text>
          </g>
        </svg>
      )}
    </div>
  );
});

export default MobileRibbonView; 