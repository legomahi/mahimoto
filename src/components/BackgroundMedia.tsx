import React, { useEffect, useState, useRef } from 'react';

interface BackgroundMediaProps {
  mediaUrl: string;
  isVisible: boolean;
  type: 'image' | 'video';
  isMobile?: boolean;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({ 
  mediaUrl, 
  isVisible, 
  type,
  isMobile = false 
}) => {
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!mediaUrl) return;
    
    setIsMediaLoaded(false); // Reset loaded state when URL changes
    
    if (type === 'image') {
      const img = new Image();
      img.onload = () => setIsMediaLoaded(true);
      img.onerror = () => console.error(`Failed to load image: ${mediaUrl}`);
      img.src = mediaUrl;
    } else {
      // For videos, readiness is handled by the canplay event listener below
      // Ensure the video source is updated if the ref exists
      if (videoRef.current) {
        videoRef.current.src = mediaUrl;
        // No need to explicitly call load() here, src change triggers it
      }
    }
  }, [mediaUrl, type]);

  // Effect to listen for video readiness
  useEffect(() => {
    const videoElement = videoRef.current;
    if (type === 'video' && videoElement) {
      const handleCanPlay = () => {
        setIsMediaLoaded(true);
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.load(); // Explicitly call load() when component mounts or type changes to video
      
      // Check if video is already ready (e.g., cached)
      if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
         handleCanPlay();
      }

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [type]); // Rerun when type changes

  // Effect to handle video pause when NOT visible
  // We rely on autoPlay + muted + playsInline for starting playback when visible
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (!isVisible) {
        videoRef.current.pause();
      } else if (isMediaLoaded) {
        // Attempt play again if component became visible after media loaded
        // This handles cases where visibility changes happen faster than loading
        videoRef.current.play().catch(error => {
          // It might still fail if interaction is required, but autoPlay should handle most cases
          console.warn('Retry video autoplay failed:', error);
        });
      }
    }
  }, [isVisible, type, isMediaLoaded]);

  if (!mediaUrl) return null;

  return (
    <div 
      // Apply 'visible' class only when the media is ready AND the component is set to be visible
      className={`background-media ${isVisible && isMediaLoaded ? 'visible' : ''} ${isVisible ? 'loading' : ''} ${isMobile ? 'mobile' : ''}`}
      style={{ backgroundColor: '#1a1a1a' }} // Always use a dark background
    >
      {type === 'image' ? (
        <img 
          src={mediaUrl} 
          alt="" 
          style={{ opacity: isMediaLoaded ? 1 : 0 }} // Fade in image when loaded
        />
      ) : (
        <video
          ref={videoRef}
          muted
          loop
          playsInline // Essential for iOS autoplay
          data-webkit-playsinline="true" // Redundant but sometimes needed
          preload="auto" // Changed to auto for faster video loading
          src={mediaUrl} // Set src directly
          style={{ opacity: isVisible && isMediaLoaded ? 0.95 : 0 }} // Fade in video when ready and visible
        />
      )}
      {/* Show placeholder loading animation when media is not yet loaded */}
      {isVisible && !isMediaLoaded && (
        <div className="media-loading-indicator" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid rgba(255,255,255,0.5)',
          borderRadius: '50%',
          animation: 'mediaSpin 1s linear infinite'
        }}>
          <style>{`
            @keyframes mediaSpin {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default BackgroundMedia; 