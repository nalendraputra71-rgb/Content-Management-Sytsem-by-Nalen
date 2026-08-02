import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

export function SimulatedStreamMarkdown({
  content,
  onComplete,
  scrollContainerRef,
}: {
  content: string;
  onComplete?: () => void;
  scrollContainerRef?: any;
}) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedContent("");
    const interval = setInterval(() => {
      const chunk = Math.max(1, Math.floor(content.length / 60));
      i += chunk + Math.floor(Math.random() * 5);
      if (i >= content.length) {
        i = content.length;
        setDisplayedContent(content.substring(0, i));
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setDisplayedContent(content.substring(0, i) + " █");
      }
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [content, scrollContainerRef]); 

  return <Markdown>{displayedContent}</Markdown>;
}
