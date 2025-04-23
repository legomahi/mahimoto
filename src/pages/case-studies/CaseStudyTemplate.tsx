import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import Carousel from '../../components/Carousel';
import { Buffer } from 'buffer';
import { fetchMarkdown } from '../../utils/markdownUtils';
import './CaseStudy.css';
import SplitType from 'split-type';
import gsap from 'gsap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Make Buffer available globally for gray-matter
window.Buffer = Buffer;

/**
 * Generate a poster path from a video path
 * This creates a path to a WebP poster using the video name
 */
const generatePosterPath = (videoPath: string): string => {
  // Extract the filename without extension
  const baseName = videoPath.split('/').pop()?.split('.')[0] || 'video';
  // Return a poster path that follows a consistent pattern
  return `/images/video-thumbnails/${baseName}-poster.webp`;
};

// Define the case study order for navigation
const caseStudyOrder = [
  { slug: 'designing-for-ai-at-google-translate', title: 'Designing for AI' },
  { slug: 'fish-in-your-ear', title: 'A Fish in Your Ear' },
  { slug: 'scrolling-in-money', title: 'Scrolling in Money' },
  { slug: 'talking-to-strangers', title: 'Talking to Strangers' },
  { slug: 'the-arsenal-of-startups', title: 'The Arsenal of Startups' },
  { slug: 'designing-a-festival', title: 'Designing a Festival' },
  { slug: 'illustrations', title: 'Illustrations' }
];

interface CaseStudyData {
  content: string;
  data: {
    title: string;
    sidebar_role: string;
    timeline_text: string;
    timeline_subtext?: string;
    client?: string;
    company?: string;
    team_members: string[];
    lead: string;
  };
}

const animateLines = (selector: string, delay = 0, options?: { duration?: number; stagger?: number }) => {
  // Get elements matching the selector
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

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
  
  // Initial state: hidden and positioned down
  gsap.set(`${selector} .line-inner`, { 
    yPercent: 80,
    opacity: 0,
    visibility: 'hidden' // Start hidden
  });
  
  // Animate to final state: visible, positioned correctly, and opaque
  gsap.to(`${selector} .line-inner`, {
    yPercent: 0,
    opacity: 1,
    visibility: 'visible', // Become visible during animation
    duration: options?.duration ?? 1,
    ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
    stagger: options?.stagger ?? 0.08,
    delay,
  });
};

const CaseStudyTemplate: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [caseStudyData, setCaseStudyData] = useState<CaseStudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<boolean[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const navigate = useNavigate();
  
  // Find current index in the case study order
  const currentIndex = slug ? caseStudyOrder.findIndex(cs => cs.slug === slug) : -1;
  
  // Determine previous and next case studies
  const prevCaseStudy = currentIndex > 0 
    ? caseStudyOrder[currentIndex - 1] 
    : caseStudyOrder[caseStudyOrder.length - 1]; // Loop to the last if at the beginning
    
  const nextCaseStudy = currentIndex < caseStudyOrder.length - 1 
    ? caseStudyOrder[currentIndex + 1] 
    : caseStudyOrder[0]; // Loop to the first if at the end

  useEffect(() => {
    const fetchCaseStudy = async () => {
      if (!slug) return;
      
      // Reset loaded state when loading a new case study
      setContentLoaded(false);
      setLoading(true);
      
      try {
        // Note: We're still loading from the /content/case-studies/ directory
        // even though URLs now use direct slugs
        console.log(`Fetching case study: /content/case-studies/${slug}.md`);
        
        try {
          // First try using our custom parser
          const { frontMatter, content } = await fetchMarkdown(`/content/case-studies/${slug}.md`);
          
          // Process team_members to ensure it's always an array
          let teamMembers: string[] = [];
          if (typeof frontMatter.team_members === 'string') {
            teamMembers = [frontMatter.team_members];
          } else if (Array.isArray(frontMatter.team_members)) {
            teamMembers = frontMatter.team_members;
          }
          
          setCaseStudyData({
            data: {
              title: frontMatter.title,
              sidebar_role: frontMatter.sidebar_role,
              timeline_text: frontMatter.timeline_text,
              timeline_subtext: frontMatter.timeline_subtext,
              client: frontMatter.client,
              company: frontMatter.company,
              team_members: teamMembers,
              lead: frontMatter.lead,
            },
            content
          });
        } catch (customParseErr: any) {
          console.error('Custom markdown parser failed:', customParseErr);
          console.log('Falling back to gray-matter...');
          
          // Fallback to gray-matter
          const response = await fetch(`/content/case-studies/${slug}.md`);
          
          if (!response.ok) {
            throw new Error(`Failed to load case study: ${response.status}`);
          }
          
          const rawContent = await response.text();
          console.log('Raw content received:', rawContent.substring(0, 100) + '...');
          
          try {
            const { data, content } = matter(rawContent);
            console.log('Parsed frontmatter with gray-matter:', data);
            
            // Process team_members to ensure it's always an array
            let teamMembers: string[] = [];
            if (typeof data.team_members === 'string') {
              teamMembers = [data.team_members];
            } else if (Array.isArray(data.team_members)) {
              teamMembers = data.team_members;
            }
            
            setCaseStudyData({ 
              data: {
                title: data.title || '',
                sidebar_role: data.sidebar_role || '',
                timeline_text: data.timeline_text || '',
                timeline_subtext: data.timeline_subtext,
                client: data.client,
                company: data.company,
                team_members: teamMembers,
                lead: data.lead || '',
              }, 
              content 
            });
          } catch (parseErr: any) {
            console.error('Error parsing markdown with gray-matter:', parseErr);
            throw new Error(`Failed to parse markdown: ${parseErr.message}`);
          }
        }
      } catch (err: any) {
        console.error('Error loading case study:', err);
        setError(`Failed to load case study content: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCaseStudy();
    }
  }, [slug]);

  useEffect(() => {
    // Animate on mount
    if (caseStudyData) {
      // First set content to loaded to make it visible
      setContentLoaded(true);

      // Then start animations
      animateLines('.cs-main-title');
      animateLines('.cs-intro-lead', 0.2, { duration: 0.7, stagger: 0.05 });
      document.querySelectorAll('.sidebar-header-animate').forEach((el, i) => {
        animateLines(`.sidebar-header-animate:nth-of-type(${i + 1})`, 0.3 + i * 0.07, { duration: 0.5, stagger: 0.03 });
      });
      document.querySelectorAll('.sidebar-animate').forEach((el, i) => {
        animateLines(`.sidebar-animate:nth-of-type(${i + 1})`, 0.4 + i * 0.1);
      });
    }
  }, [caseStudyData]);

  useEffect(() => {
    // Intersection Observer for fade-in sections only (no fade-out)
    const observer = new window.IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const updated = [...prev];
          entries.forEach((entry) => {
            const idx = Number((entry.target as HTMLElement).dataset.sectionIndex);
            // Only set to visible if intersecting, never back to invisible
            if (entry.isIntersecting) {
              updated[idx] = true;
            }
          });
          return updated;
        });
      },
      { threshold: 0.15 }
    );
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [caseStudyData]);

  const renderMarkdownContent = (content: string) => {
    console.log('Raw markdown content to render:', content.substring(0, 200) + '...');
    
    // Split the content by headings and custom markers to properly handle all sections
    const sections = [];
    let currentSection = { type: 'content', content: '' };
    
    // Process content line by line, looking for section markers and headings
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for custom type marker
      if (line.trim().startsWith('<!-- type:')) {
        // Save current section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        
        // Create new section with the specified type
        const typeMatch = line.match(/<!-- type: (.*) -->/);
        if (typeMatch && typeMatch[1]) {
          currentSection = { type: typeMatch[1], content: '' };
        } else {
          currentSection = { type: 'content', content: '' };
        }
      } 
      // Check for heading (new section) - IMPORTANT: Allow headers to create new sections regardless of current type
      else if (line.trim().startsWith('## ')) {
        // Save the current section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        
        // Start a new content section beginning with this heading
        currentSection = { type: 'content', content: line + '\n' };
      } 
      // Regular content line - add to current section
      else {
        currentSection.content += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    console.log('Total sections generated:', sections.length);
    sections.forEach((section, i) => {
      console.log(`Section ${i}: type=${section.type}, contentLength=${section.content.length}, first line: ${section.content.split('\n')[0]}`);
    });
    
    // Render sections based on their type
    return sections.map((section, index) => {
      console.log(`RENDER ATTEMPT: Section ${index} of type: ${section.type}, first line: ${section.content.split('\n')[0]}`);
      
      let renderedSection;
      
      switch (section.type) {
        case 'image-full-width':
          const fullWidthImgMatch = section.content.match(/!\[(.*)\]\((.*)\)/);
          if (fullWidthImgMatch) {
            const [, alt, src] = fullWidthImgMatch;
            console.log(`Rendering full-width image: ${src}`);
            renderedSection = (
              <section key={index} className="image full-width">
                <img src={src} alt={alt} loading="lazy" />
              </section>
            );
          }
          break;
          
        case 'video':
          const videoMatch = section.content.match(/\[video\]\((.*?)(?:,\s*(.*?))?\)/);
          if (videoMatch) {
            const src = videoMatch[1];
            // Extract poster image if provided, otherwise generate a placeholder path
            const posterSrc = videoMatch[2] || generatePosterPath(src);
            
            console.log(`Rendering video: ${src} with poster: ${posterSrc}`);
            renderedSection = (
              <section key={index} className="video-section">
                <div className="video-container">
                  <video 
                    src={src} 
                    controls 
                    playsInline
                    preload="metadata"
                    poster={posterSrc}
                  />
                </div>
              </section>
            );
          }
          break;
          
        case 'image-grid':
          const gridContent = section.content.trim();
          const gridImages = [];
          
          // Match all images without capturing captions
          const imageMatches = gridContent.match(/!\[.*?\]\(.*?\)/g);
          
          if (imageMatches) {
            console.log(`Found ${imageMatches.length} grid images`);
            for (let i = 0; i < imageMatches.length; i++) {
              const imgMatch = imageMatches[i].match(/!\[(.*)\]\((.*)\)/);
              
              if (imgMatch) {
                const [, alt, src] = imgMatch;
                console.log(`Grid image ${i}: ${src}`);
                gridImages.push({ src, alt });
              }
            }
            
            renderedSection = (
              <section key={index} className="image grid">
                {gridImages.map((img, i) => (
                  <div key={i} className="image-item">
                    <img src={img.src} alt={img.alt} loading="lazy" />
                  </div>
                ))}
              </section>
            );
          }
          break;
          
        case 'image-natural-size':
          const naturalImgMatch = section.content.match(/!\[(.*)\]\((.*)\)/);
          if (naturalImgMatch) {
            const [, alt, src] = naturalImgMatch;
            console.log(`Rendering natural-size image: ${src}`);
            renderedSection = (
              <section key={index} className="image natural-size">
                <div className="image-container">
                  <img src={src} alt={alt} loading="lazy" />
                </div>
              </section>
            );
          }
          break;
          
        case 'image-carousel':
          const carouselContent = section.content.trim();
          const carouselImages = [];
          
          // Match all images
          const carouselMatches = carouselContent.match(/!\[.*\]\(.*\)/g);
          
          if (carouselMatches) {
            console.log(`Found ${carouselMatches.length} carousel images`);
            for (let i = 0; i < carouselMatches.length; i++) {
              const imgMatch = carouselMatches[i].match(/!\[(.*)\]\((.*)\)/);
              if (imgMatch) {
                // Extract src from the second matched group and ignore alt text
                const [, , src] = imgMatch;
                console.log(`Carousel image ${i}: ${src}`);
                carouselImages.push(src);
              }
            }
            
            renderedSection = (
              <section key={index} className="image carousel">
                <Carousel images={carouselImages} />
              </section>
            );
          }
          break;
          
        default: // Regular content blocks
          // Extract headings if present
          const contentLines = section.content.trim().split('\n');
          let title = '';
          let subtitle = '';
          let restContent = section.content;
          
          // Look for headings
          if (contentLines.length > 0 && contentLines[0].startsWith('## ')) {
            title = contentLines[0].replace('## ', '');
            restContent = contentLines.slice(1).join('\n');
            console.log(`Found heading: "${title}"`);
          }
          
          if (contentLines.length > 1 && contentLines[1].startsWith('#### ')) {
            subtitle = contentLines[1].replace('#### ', '');
            restContent = contentLines.slice(2).join('\n');
            console.log(`Found subtitle: "${subtitle}"`);
          }
          
          renderedSection = (
            <section
              key={index}
              className={`content-block fade-section${visibleSections[index] ? ' visible' : ''}`}
              ref={el => { sectionRefs.current[index] = el; }}
              data-section-index={index}
            >
              <div>
                {title && <h2>{title}</h2>}
                {subtitle && <h4>{subtitle}</h4>}
                <ReactMarkdown
                  components={{
                    img: ({node, ...props}) => (
                      <img {...props} loading="lazy" alt={props.alt || ''} />
                    )
                  }}
                >{restContent}</ReactMarkdown>
              </div>
            </section>
          );
          break;
      }
      
      // If we couldn't render a section, create a fallback
      if (!renderedSection) {
        console.warn(`Failed to render section ${index} of type: ${section.type}`);
        renderedSection = <div key={index} className="unhandled-section">{section.content}</div>;
      } else {
        console.log(`Successfully rendered section ${index} of type: ${section.type}`);
      }
      
      return renderedSection;
    });
  };

  // Show loading indicator while the case study data is being fetched
  if (loading) {
    return (
      <div className="case-study-container">
        <Header />
        <div className="cs-content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-study-container">
        <Header />
        <div className="cs-content-area" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <h2>Error Loading Case Study</h2>
          <p>{error}</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Return to Home
          </Link>
        </div>
        <Footer/>
      </div>
    );
  }

  if (!caseStudyData) {
    return (
      <div className="case-study-container">
        <Header />
        <div className="cs-content-area" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <h2>Case Study Not Found</h2>
          <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Return to Home
          </Link>
        </div>
        <Footer/>
      </div>
    );
  }

  const { data, content } = caseStudyData;

  return (
    <div className={`case-study-container ${contentLoaded ? 'case-study-content-loaded' : ''}`}>
      <Header />

      <div className="cs-content-area">
        <h1 className="cs-main-title">{data.title}</h1>
        
        <section className="Intro">
          <div className="sidebar">
            <div className="cs-info-section">
              <h5 className="sidebar-header-animate">ROLE</h5>
              <p className="sidebar-animate">{data.sidebar_role}</p>
            </div>
            
            {data.company && (
              <div className="cs-info-section">
                <h5 className="sidebar-header-animate">COMPANY</h5>
                <p className="sidebar-animate">{data.company}</p>
              </div>
            )}
            
            {data.client && (
              <div className="cs-info-section">
                <h5 className="sidebar-header-animate">CLIENT</h5>
                <p className="sidebar-animate">{data.client}</p>
              </div>
            )}
            
            <div className="cs-info-section">
              <h5 className="sidebar-header-animate">TIMELINE</h5>
              <p className="sidebar-animate">{data.timeline_text}</p>
              {data.timeline_subtext && (
                <p className="cs-info-subtext sidebar-animate">{data.timeline_subtext}</p>
              )}
            </div>
            
            {data.team_members && data.team_members.length > 0 && (
              <div className="cs-info-section">
                <h5 className="sidebar-header-animate">UX TEAM</h5>
                <div className="team-members-grid">
                  {data.team_members.map((member, index) => {
                    // Parse name and title - assumes format "Name (Title)"
                    const match = member.match(/(.*?)\s*\((.*?)\)/);
                    const name = match ? match[1].trim() : member; // Default to full string if no match
                    const title = match ? match[2].trim() : null;
                    
                    return (
                      // Apply animation class to the container div
                      <div className="sidebar-animate team-member-container" key={index}> 
                        <span className="team-member-name">{name}</span>
                        {title && (
                          <span className="team-member-title">{title}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="lead">
            <p className="cs-intro-lead">{data.lead}</p>
          </div>
        </section>
        
        {renderMarkdownContent(content)}
        
        {/* Case Study Navigation */}
        <div className="case-study-navigation">
          <Link to={`/${prevCaseStudy.slug}`} className="prev-case-study">
            <span className="nav-label">PREVIOUS</span>
            <span className="nav-title">{prevCaseStudy.title}</span>
          </Link>
          <Link to={`/${nextCaseStudy.slug}`} className="next-case-study">
            <span className="nav-label">NEXT</span>
            <span className="nav-title">{nextCaseStudy.title}</span>
          </Link>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
};

export default CaseStudyTemplate; 