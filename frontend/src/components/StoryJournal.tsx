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
  // If no photo is selected, we show a "Featured Editorial" (the Origin Story)
  const displayTitle = photo ? photo.title : "The Stillness of Watching";
  const displayMeta = photo ? `Narrative • ${photo.category}` : "Chapter 01 • Narrative";
  const displaySrc = photo ? photo.src : "/images/featured_story_landscape_ethereal.png";
  const displayStory = photo?.story || (
    <>
      <p>
        People often ask how long I wait for a single frame. The truth is, I don't wait for the frame—I wait for the feeling. 
        In the high-altitude silence of the mountains, the world doesn't move in seconds; it moves in shadows.
      </p>
      
      <blockquote className="journal-quote">
        "Photography is not the act of taking; it is the act of receiving what the light chooses to give."
      </blockquote>

      <p>
        There is a specific type of beauty that only exists in the transition between stillness and motion, hidden behind 
        the rush of the everyday. I often sit for hours, watching the grey turn to silver, then finally, to the light I was meant to see.
      </p>
    </>
  );

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
              {!photo && (
                <p className="journal-intro">
                  An exploration of patience, light, and the moments that occur when we stop looking for the shot and start listening to the landscape.
                </p>
              )}
            </div>

            <div className="journal-content">
              <div className="journal-main">
                <div className="journal-image-wrap">
                  <div className="journal-featured-image-container">
                    <Image 
                      src={displaySrc} 
                      alt={photo?.alt || "Featured story landscape"} 
                      fill
                      className="journal-featured-img"
                    />
                  </div>
                  {photo && <div className="journal-caption">Technical Story &bull; {photo.category}</div>}
                  {!photo && (
                    <div className="journal-caption">
                      Captured at Blue Hour, 4,200m elevation.
                    </div>
                  )}
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
                  <p>
                    {photo ? `Capturing the essence of ${photo.title}. An exercise in perspective and light.` : "To capture the weight of the air, not just the height of the peaks. Stillness as a physical presence."}
                  </p>
                </div>
                
                {photo?.exif && (
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

                {!photo && (
                  <>
                    <div className="sidebar-block">
                      <h4>The Gear</h4>
                      <p>Leica M11, 35mm Summilux. Tripod-mounted. Long exposure to smooth the moving mist.</p>
                    </div>
                    <div className="sidebar-block">
                      <h4>Settings</h4>
                      <ul className="sidebar-stats">
                        <li><span>ISO:</span> 64</li>
                        <li><span>Aperture:</span> f/8.0</li>
                        <li><span>Shutter:</span> 30.0s</li>
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
