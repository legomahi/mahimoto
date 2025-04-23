import { Buffer } from 'buffer';

// Make Buffer available globally for gray-matter
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

interface FrontMatter {
  title: string;
  sidebar_role: string;
  timeline_text: string;
  timeline_subtext?: string;
  team_members: string[];
  lead: string;
  [key: string]: any;
}

interface ParsedMarkdown {
  frontMatter: FrontMatter;
  content: string;
}

/**
 * Simple frontmatter parser as a fallback if gray-matter doesn't work in the browser
 */
export const parseMarkdown = (markdown: string): ParsedMarkdown => {
  console.log('Custom parseMarkdown called with markdown length:', markdown.length);
  console.log('First 100 chars of markdown:', markdown.substring(0, 100));
  
  // Extract frontmatter section
  const frontMatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  
  if (!frontMatterMatch) {
    console.error('No frontmatter found in markdown');
    throw new Error('Invalid markdown: Missing frontmatter');
  }
  
  console.log('Frontmatter match found with length:', frontMatterMatch[0].length);
  
  const frontMatterRaw = frontMatterMatch[1];
  const contentStart = frontMatterMatch[0].length;
  // Trim any leading whitespace to ensure content starts cleanly
  const content = markdown.slice(contentStart).replace(/^\s+/, '');
  
  console.log('Content starts at position:', contentStart);
  console.log('First 100 chars of content:', content.substring(0, 100).replace(/\n/g, '\\n'));
  console.log('Raw content length:', content.length);
  
  // Parse the frontmatter
  const frontMatter: FrontMatter = {
    title: '',
    sidebar_role: '',
    timeline_text: '',
    team_members: [],
    lead: ''
  };
  
  // Extract key-value pairs from frontmatter
  const lines = frontMatterRaw.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line || line.startsWith('#')) continue;
    
    // Handle array items for team_members
    if (line.startsWith('-')) {
      // This is an array item, it should belong to the last key we processed
      const value = line.slice(1).trim().replace(/^"(.*)"$/, '$1');
      if (Array.isArray(frontMatter.team_members)) {
        frontMatter.team_members.push(value);
      }
      continue;
    }
    
    // Handle regular key-value pairs
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Strip quotes if they exist
      value = value.replace(/^"(.*)"$/, '$1');
      
      if (key === 'team_members') {
        // Initialize array for team_members
        frontMatter.team_members = [];
        
        // Check next lines for array items
        let j = i + 1;
        while (j < lines.length && lines[j].trim().startsWith('-')) {
          const memberValue = lines[j].trim().slice(1).trim().replace(/^"(.*)"$/, '$1');
          frontMatter.team_members.push(memberValue);
          j++;
        }
        
        i = j - 1; // Adjust loop counter to skip the lines we've processed
      } else {
        // Regular key-value
        frontMatter[key] = value;
      }
    }
  }
  
  return { frontMatter, content };
};

/**
 * Fetch and parse a markdown file
 */
export const fetchMarkdown = async (url: string): Promise<ParsedMarkdown> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load markdown: ${response.status}`);
    }
    
    const markdown = await response.text();
    return parseMarkdown(markdown);
  } catch (error: any) {
    console.error('Error fetching markdown:', error);
    throw new Error(`Error fetching markdown: ${error.message}`);
  }
}; 