"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoData } from "../lib/photoService";

// Helper to format shutter speed as fraction (copied from page.tsx for consistency)
const formatExposure = (exposure: number | undefined) => {
  if (!exposure) return null;
  if (exposure >= 1) return `${Math.round(exposure * 10) / 10}s`;
  const denominator = Math.round(1 / exposure);
  return `1/${denominator}s`;
};

interface StoryJournalProps {
  photo: PhotoData | null;
}

export default function StoryJournal({ photo }: StoryJournalProps) {
  if (!photo) return null;

  const displayTitle = photo.title;
  const displayMeta = `Narrative • ${photo.category}`;
  const displaySrc = photo.src;
  const displayStory = photo.story || "No story has been drafted for this photograph yet.";

  return (
    <section id="behind-the-lens" className="journal-section">
      <div className="container">
        <AnimatePresence mode="wait">
          <motion.div 
            key={displayTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="journal-header">
              <span className="journal-meta">{displayMeta}</span>
              <h2 className="journal-title">{displayTitle}</h2>
            </div>

            <div className="journal-content">
              <div className="journal-main">
                <div className="journal-image-wrap">
                  <div className="journal-featured-image-container">
                    <Image 
                      src={displaySrc} 
                      alt={photo.alt || "Photograph narrative"} 
                      fill
                      className="journal-featured-img"
                    />
                  </div>
                  <div className="journal-caption">Technical Story &bull; {photo.category}</div>
                </div>

                <div className="journal-text">
                  {typeof displayStory === 'string' ? (
                    displayStory.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : displayStory}
                </div>
              </div>

              <aside className="journal-sidebar">
                <div className="sidebar-block">
                  <h4>The Intent</h4>
                  <p>Capturing the essence of {photo.title}. An exercise in perspective and light.</p>
                </div>
                
                {photo.exif && (
                  <>
                    <div className="sidebar-block">
                      <h4>The Gear</h4>
                      <p>{photo.exif.model || "Unknown Camera"}{photo.exif.lensModel ? ` with ${photo.exif.lensModel}` : ""}</p>
                    </div>
                    <div className="sidebar-block">
                      <h4>Settings</h4>
                      <ul className="sidebar-stats">
                        {photo.exif.iso && <li><span>ISO:</span> {photo.exif.iso}</li>}
                        {photo.exif.fNumber && <li><span>Aperture:</span> f/{photo.exif.fNumber}</li>}
                        {photo.exif.exposureTime && <li><span>Shutter:</span> {formatExposure(photo.exif.exposureTime)}</li>}
                        {photo.exif.focalLength && <li><span>Focal:</span> {Math.round(photo.exif.focalLength)}mm</li>}
                      </ul>
                    </div>
                  </>
                )}
              </aside>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
