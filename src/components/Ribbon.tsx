import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

interface RibbonProps {
  id: string;
  pathData: string;
  color: string;
  text: string;
  caseStudyUrl?: string;
  onHover: (isHovered: boolean) => void;
  isDimmed: boolean;
  updateButtonPosition: (x: number, y: number) => void;
  position: { x: number; y: number };
  onClick?: () => void;
}

const Ribbon: React.FC<RibbonProps> = ({
  id,
  pathData,
  color,
  text,
  caseStudyUrl,
  onHover,
  isDimmed,
  updateButtonPosition,
  position,
  onClick
}) => {
  const navigate = useNavigate();
  const textPathRef = useRef<SVGTextPathElement>(null);
  const ribbonRef = useRef<SVGGElement>(null);
  const scrollAnimationRef = useRef<GSAPAnimation | null>(null);
  const initialOffset = 0;

  useEffect(() => {
    if (ribbonRef.current) {
      gsap.set(ribbonRef.current, {
        x: position.x,
        y: position.y,
        rotation: -30,
        transformOrigin: "center center"
      });
    }
  }, [position.x, position.y]);

  const createScrollAnimation = () => {
    if (scrollAnimationRef.current) {
      scrollAnimationRef.current.kill();
    }

    scrollAnimationRef.current = gsap.to(textPathRef.current, {
      attr: { startOffset: '-100%' },
      duration: 25,
      ease: 'linear',
      paused: true,
      onUpdate: function() {
        const textPath = textPathRef.current;
        if (!textPath) return;
        
        const offsetNum = parseFloat(textPath.getAttribute('startOffset') || '0');
        if (offsetNum < 0 && textPath.textContent && textPath.textContent.length < 5000) {
          textPath.textContent += text.repeat(10);
        }
      }
    });

    return scrollAnimationRef.current;
  };

  useEffect(() => {
    if (textPathRef.current) {
      textPathRef.current.textContent = text.repeat(20);
      gsap.set(textPathRef.current, { attr: { startOffset: `${-initialOffset}%` } });
    }
  }, [text]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!textPathRef.current || !ribbonRef.current) return;

    textPathRef.current.textContent = text.repeat(20);
    gsap.set(textPathRef.current, { attr: { startOffset: -initialOffset + '%' } });

    const scrollAnimation = createScrollAnimation();
    scrollAnimation.play();

    gsap.to(ribbonRef.current, {
      scale: 1.05,
      duration: 0.1,
      ease: "power2.out",
      transformOrigin: "center center"
    });

    updateButtonPosition(e.clientX, e.clientY);
    onHover(true);
  };

  const handleMouseLeave = () => {
    if (!textPathRef.current || !ribbonRef.current) return;

    if (scrollAnimationRef.current) {
      scrollAnimationRef.current.kill();
    }

    const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');

    gsap.fromTo(textPathRef.current,
      { attr: { startOffset: currentOffset + '%' } },
      {
        attr: { startOffset: -initialOffset + '%' },
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        onComplete: () => {
          if (textPathRef.current) {
            textPathRef.current.textContent = text.repeat(20);
          }
        }
      }
    );

    gsap.to(ribbonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.inOut",
      transformOrigin: "center center"
    });

    onHover(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateButtonPosition(e.clientX, e.clientY);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (caseStudyUrl) {
      navigate(caseStudyUrl);
    }
  };

  return (
    <g
      ref={ribbonRef}
      className={`ribbon ${isDimmed ? 'dimmed' : ''}`}
      id={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <path
        className="ribbon-path"
        id={`path${id.replace('ribbon', '')}`}
        d={pathData}
        style={{ stroke: color }}
      />
      <text>
        <textPath
          ref={textPathRef}
          href={`#path${id.replace('ribbon', '')}`}
          startOffset="-50%"
          dy="-10"
        />
      </text>
    </g>
  );
};

export default Ribbon; 