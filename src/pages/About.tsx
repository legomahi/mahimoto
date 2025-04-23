import React, { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import gsap from 'gsap';
import SplitType from 'split-type';
import './About.css';

const About: React.FC = () => {
  const textPathRef = useRef<SVGTextPathElement>(null);
  const scrollAnimationRef = useRef<gsap.core.Tween | null>(null);
  
  // Animation for lines (same as case studies)
  const animateLines = (selector: string, delay = 0, options?: { duration?: number; stagger?: number }) => {
    // Split lines and wrap each line's text in a span for animation
    const split = new SplitType(selector, { types: 'lines' });
    document.querySelectorAll(`${selector} .line`).forEach(line => {
      if (!line.querySelector('.line-inner')) {
        const span = document.createElement('span');
        span.className = 'line-inner';
        span.innerHTML = line.innerHTML;
        line.innerHTML = '';
        line.appendChild(span);
      }
    });
    
    // Instead of moving from 100% below, we'll start slightly higher (80%) and fade in
    // This gives the descenders room to breathe
    gsap.set(`${selector} .line-inner`, { 
      yPercent: 80, // Start from 80% down instead of 100%
      opacity: 0 
    });
    
    gsap.to(`${selector} .line-inner`, {
      yPercent: 0,
      opacity: 1,
      duration: options?.duration ?? 1,
      ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
      stagger: options?.stagger ?? 0.08,
      delay,
    });
  };
  
  useEffect(() => {
    // Animate title on mount
    animateLines('.about-title');
    
    // Animate section titles with a slight delay
    document.querySelectorAll('.about-section h2').forEach((el, i) => {
      animateLines(`.about-section:nth-of-type(${i + 1}) h2`, 0.3 + i * 0.07, { duration: 0.5, stagger: 0.03 });
    });
  }, []);
  
  useEffect(() => {
    if (textPathRef.current) {
      // Set initial text with repetition
      const ribbonText = 'HI FRIEND • ';
      textPathRef.current.textContent = ribbonText.repeat(20);
      gsap.set(textPathRef.current, { attr: { startOffset: '0%' } });
      
      // Create scrolling animation
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
      
      scrollAnimationRef.current = gsap.to(textPathRef.current, {
        attr: { startOffset: '-100%' },
        duration: 45,
        ease: 'linear',
        repeat: -1,
        onUpdate: function() {
          const textPath = textPathRef.current;
          if (!textPath) return;
          
          const offsetNum = parseFloat(textPath.getAttribute('startOffset') || '0');
          if (offsetNum < 0 && textPath.textContent && textPath.textContent.length < 5000) {
            textPath.textContent += ribbonText.repeat(10);
          }
        }
      });
    }
    
    // Cleanup animation on unmount
    return () => {
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
      }
    };
  }, []);

  return (
    <div className="about-container">
      {/* Background Ribbon */}
      <div className="background-ribbon">
        <svg
          viewBox="-300 -300 2040 1800"
          preserveAspectRatio="xMidYMid meet"
          className="ribbon-svg"
        >
          <g className="ribbon">
            <path
              className="ribbon-path"
              id="about-ribbon-path"
              d="M490 -7L511 165C515 199 533 229 559 248C616 289 625 377 577 430L470 549C430 594 429 665 468 712L801 1110"
              style={{ stroke: '#f9c846' }}
            />
            <text>
              <textPath
                ref={textPathRef}
                href="#about-ribbon-path"
                startOffset="-50%"
                dy="-10"
              />
            </text>
          </g>
        </svg>
      </div>

      <Header />
      
      <div className="about-content">
        <h1 className="about-title">Design leader with deep experience in AI & product growth.</h1>
        
        <div className="about-main">
          <div className="about-text">
            <p>For the past decade, I've been leading UX for Google Translate — helping it grow to over 2 billion users and guiding it through major shifts in AI, from neural machine translation to large language models. I've built and led multi-disciplinary design teams, and partnered closely with AI researchers to turn cutting-edge technology into trusted, everyday tools for people around the world.</p>
            <div className="about-image">
                <div className="image-placeholder">
                <img src="/images/me.webp" alt="Pendar Yousefi" />
                </div>
            </div>
          </div>
          <div className="about-sections">
            <div className="about-section">
                <h2>LOCATION</h2>
                <p>California</p>
            </div>
            
            <div className="about-section-columns">
                <div className="about-section">
                <h2>SPECIALIZED IN</h2>
                <ul>
                    <li>0→1 product incubation</li>
                    <li>Multimodal experiences</li>
                    <li>Scaling products & teams</li>
                    <li>AI-first UX strategy</li>
                    <li>LLM prototyping</li>
                    <li>Coaching & mentorship</li>
                </ul>
                </div>
                
                <div className="about-section">
                <h2>OPEN TO</h2>
                <ul>
                    <li>Fractional CDO roles</li>
                    <li>Strategic UX consulting</li>
                    <li>Early-stage product advising</li>
                    <li>Design team mentorship</li>
                    <li>Workshops and Design sprints</li>
                    <li>Advisory roles</li>
                </ul>
                </div>
            </div>
            
            <div className="about-section">
                <h2>BEYOND WORK</h2>
                <p>Outside of work, I'm an illustrator, printmaker, and author of <a href="https://www.instagram.com/shahsoflegend">children's books</a> inspired by Persian storytelling. I vibe-coded the current version of this website using Cursor. Say hello: pendar@gmail.com.</p>
            </div>
            </div>
        </div>
        
       
      </div>
      
      <Footer />
    </div>
  );
};

export default About; 