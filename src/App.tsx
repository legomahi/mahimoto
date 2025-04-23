import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Ribbon from './components/Ribbon';
import FloatingButton from './components/FloatingButton';
import BackgroundMedia from './components/BackgroundMedia';
import MobileRibbonView from './components/MobileRibbonView';
import { fetchMarkdown } from './utils/markdownUtils';
import { preloadAssets } from './utils/preloadAssets';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './App.css';

const ribbonData: Record<string, {
  text: string;
  path: string;
  color: string;
  media: { url: string; type: 'video' };
  caseStudyUrl: string;
}> = {
  ribbon7: {
    text: 'ILLUSTRATIONS • 2025 • PERSONAL • ',
    path: 'm621,40l-124,105c-60,51-67,143-14,203l70,79c63,71,40,183-45,223l-385,180c-83,39-108,146-50,218h0',
    color: '#848484',
    media: {
      url: '/videos/compressed/shahs.mp4', // Note: Using tirgan video temporarily
      type: 'video' as const
    },
    caseStudyUrl: '/illustrations'
  },
  ribbon6: {
    text: 'DESIGNING A FESTIVAL • 2006 • TIRGAN • ',
    path: 'M746 3L576 176C519 233 534 337 604 371L639 389C706 422 724 517 674 577C650 606 641 647 649 685L743 1105',
    color: '#6933be',
    media: {
      url: '/videos/compressed/tirgan.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/designing-a-festival'
  },
  ribbon5: {
    text: 'THE ARSENAL OF STARTUPS  • 2013 • LITMUS •  ',
    path: 'M490 -7L511 165C515 199 533 229 559 248C616 289 625 377 577 430L470 549C430 594 429 665 468 712L801 1110',
    color: '#f46e96',
    media: {
      url: '/videos/compressed/scope.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/the-arsenal-of-startups'
  },
  ribbon4: {
    text: 'TALKING TO STRANGERS • 2016 • GOOGLE TRANSLATE • ',
    path: 'M54 18L158 232C192 303 254 352 325 367L706 448C780 463 842 516 876 589C927 701 1042 758 1152 726L1440 643',
    color: '#222222',
    media: {
      url: '/videos/compressed/superbowl.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/talking-to-strangers'
  },
  ribbon3: {
    text: 'SCROLLING IN MONEY • 2017 • GOOGLE ADS • ',
    path: 'M712 26L644 272C633 315 605 351 569 370L522 396C428 447 412 587 491 662C512 681 536 694 562 698L873 755C968 772 1022 886 980 983L934 1088',
    color: '#8e5b4a',
    media: {
      url: '/videos/compressed/compass.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/scrolling-in-money'
  },
  ribbon2: {
    text: 'A FISH IN YOUR EAR • 2018 • GOOGLE TRANSLATE • ',
    path: 'M164 252 L 476 395 C516 413 540 458 534 504 C 525 579 590 639 655 617 L 786 572 C 846 551 908 601 907 671 L 904 1102',
    color: '#f9c846',
    media: {
      url: '/videos/compressed/fish-in-your-ear.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/fish-in-your-ear'
  },
  ribbon1: {
    text: 'DESIGNING FOR AI • 2025 • GOOGLE TRANSLATE • ',
    path: 'M 660 7 L 641 307 C 633 438 684 566 777 647 L 795 664 C 915 769 962 945 913 1105',
    color: '#ea614b',
    media: {
      url: '/videos/compressed/parnassus2.mp4',
      type: 'video' as const
    },
    caseStudyUrl: '/designing-for-ai-at-google-translate'
  }
};

function App() {
  const [hoveredRibbon, setHoveredRibbon] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [ribbonPositions, setRibbonPositions] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [mobileCurrentProject, setMobileCurrentProject] = useState(1);
  const mobileViewRef = useRef<any>(null);
  const [isMediaMode, setIsMediaMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const appRef = useRef<HTMLDivElement>(null);

  // Get ribbon keys for easier lookup
  const ribbonKeys = Object.keys(ribbonData);

  useEffect(() => {
    const savedMode = localStorage.getItem('mobileViewMode');
    if (savedMode) {
      setIsMediaMode(savedMode === 'media');
    }
  }, []);

  useEffect(() => {
    distributeRibbons();
    window.addEventListener('resize', distributeRibbons);
    return () => window.removeEventListener('resize', distributeRibbons);
  }, []);

  const distributeRibbons = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const regions = [
      { x: -0.4, y: -0.4 },
      { x: 0.4, y: -0.4 },
      { x: -0.4, y: 0.4 },
      { x: 0.4, y: 0.4 },
      { x: 0, y: -0.3 },
      { x: 0, y: 0.3 },
      { x: 0, y: 0 }
    ];

    const shuffledRegions = [...regions].sort(() => Math.random() - 0.5);
    const newPositions: { [key: string]: { x: number, y: number } } = {};

    Object.keys(ribbonData).forEach((ribbonId, index) => {
      if (index >= shuffledRegions.length) return;
      
      const region = shuffledRegions[index];
      const baseX = viewportWidth * region.x;
      const baseY = viewportHeight * region.y;
      
      const randomX = baseX + (Math.random() - 0.5) * viewportWidth * 0.4;
      const randomY = baseY + (Math.random() - 0.5) * viewportHeight * 0.3;
      
      newPositions[ribbonId] = { x: randomX, y: randomY };
    });

    setRibbonPositions(newPositions);
  };

  const handleRibbonHover = (ribbonId: string, isHovered: boolean) => {
    setHoveredRibbon(isHovered ? ribbonId : null);
  };

  const updateButtonPosition = (x: number, y: number) => {
    setButtonPosition({ x, y });
  };

  const handleMobileProjectChange = (index: number) => {
    setMobileCurrentProject(index + 1);
  };
  
  const toggleMobileMode = () => {
    setIsMediaMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('mobileViewMode', newMode ? 'media' : 'ribbon');
      return newMode;
    });
  };

  // Helper to extract asset URLs from markdown
  const extractAssetUrls = (markdown: string): string[] => {
    const urls: string[] = [];
    // Images: ![alt](url)
    const imgRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(markdown))) {
      urls.push(match[1]);
    }
    // Videos: [video](url)
    const videoRegex = /\[video\]\(([^)]+)\)/g;
    while ((match = videoRegex.exec(markdown))) {
      urls.push(match[1]);
    }
    return urls;
  };

  // Handler for desktop floating button and ribbon click
  const handleViewProject = async (caseStudyUrl: string | undefined) => {
    if (!caseStudyUrl || isLoading) return;
    setIsLoading(true);
    try {
      // Animate out current view
      if (appRef.current) {
        await gsap.to(appRef.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' });
      }
      // Navigate immediately without waiting for assets to load
      navigate(caseStudyUrl);
      
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (e) {
      // Handle error
      console.error("Error during navigation transition:", e);
      setIsLoading(false);
    }
  };

  return (
    <div ref={appRef} className={`App ${!isMediaMode ? 'ribbon-mode' : ''}`}>
      {Object.entries(ribbonData).map(([ribbonId, data], index) => {
        // Determine the active ribbon ID based on the mobile index (0-based)
        const activeMobileRibbonId = ribbonKeys[mobileCurrentProject - 1];
        
        // Check if the current screen width might be considered mobile
        // You might want a more robust check, e.g., using a resize listener or context
        const isLikelyMobile = window.innerWidth <= 768; 
        
        // Determine visibility based on desktop hover OR mobile media mode + active project
        const visible = hoveredRibbon === ribbonId || (isLikelyMobile && isMediaMode && activeMobileRibbonId === ribbonId);
        
        return (
          <BackgroundMedia
            key={`bg-${ribbonId}`}
            mediaUrl={data.media.url}
            type={data.media.type}
            isVisible={visible} // Use the calculated visibility
            isMobile={isLikelyMobile && isMediaMode} // Pass mobile context if needed by BackgroundMedia styling/logic
          />
        );
      })}
      <Header />
      <FloatingButton
        isVisible={hoveredRibbon !== null || isLoading}
        position={buttonPosition}
        activeRibbonId={hoveredRibbon}
        isLoading={isLoading}
        onClick={() => {
          if (hoveredRibbon) {
            const data = ribbonData[hoveredRibbon];
            if (data && data.caseStudyUrl) {
              handleViewProject(data.caseStudyUrl);
            }
          }
        }}
      />
      <div className="svg-container">
        <svg
          viewBox="-300 -300 2040 1800"
          preserveAspectRatio="xMidYMid meet"
        >
          {Object.entries(ribbonData).map(([ribbonId, data]) => (
            <Ribbon
              key={ribbonId}
              id={ribbonId}
              pathData={data.path}
              color={data.color}
              text={data.text}
              caseStudyUrl={data.caseStudyUrl}
              onHover={(isHovered) => handleRibbonHover(ribbonId, isHovered)}
              isDimmed={(hoveredRibbon !== null && hoveredRibbon !== ribbonId) || (isLoading && hoveredRibbon !== ribbonId)}
              updateButtonPosition={updateButtonPosition}
              position={ribbonPositions[ribbonId] || { x: 0, y: 0 }}
              onClick={() => handleViewProject(data.caseStudyUrl)}
            />
          ))}
        </svg>
      </div>
      
      <MobileRibbonView 
        ribbonData={ribbonData} 
        onProjectChange={handleMobileProjectChange}
        ref={mobileViewRef}
        isMediaMode={isMediaMode}
        toggleMode={toggleMobileMode}
      />
      
      <Footer 
        currentProject={mobileCurrentProject} 
        totalProjects={Object.keys(ribbonData).length} 
      />
    </div>
  );
}

export default App;
