import React from 'react';

interface FloatingButtonProps {
  isVisible: boolean;
  position: { x: number; y: number };
  activeRibbonId?: string | null;
  isMobile?: boolean;
  isLoading?: boolean;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  isVisible, 
  position,
  isMobile = false,
  isLoading = false,
  onClick
}) => {
  // For mobile, we'll let CSS position the button
  const styles = isMobile ? {} : {
    left: `${position.x}px`,
    top: `${position.y + 50}px`
  };

  // Prevent event propagation for touch events
  const handleTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`floating-button ${isVisible ? 'visible' : ''} ${isMobile ? 'mobile' : ''}`}
      style={styles}
      onClick={onClick}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
    >
      {isLoading ? (
        <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #fff', borderTop: '3px solid #888', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      ) : (
        'View Project'
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FloatingButton; 