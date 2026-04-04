"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { subscribeToPhotos, PhotoData } from "../lib/photoService";
import StoryJournal from "../components/StoryJournal";

const CATEGORIES = ["All", "Landscape", "Architecture", "Portrait", "Silhouette", "Automotive", "Product"];

// Helper to format shutter speed as fraction
const formatExposure = (exposure: number | undefined) => {
  if (!exposure) return null;
  if (exposure >= 1) return `${Math.round(exposure * 10) / 10}s`;
  const denominator = Math.round(1 / exposure);
  return `1/${denominator}s`;
};

export default function HomePage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<PhotoData | null>(null);
  const [storyPhoto, setStoryPhoto] = useState<PhotoData | null>(null);
  const [state, handleSubmit] = useForm("xeeplydy");

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = subscribeToPhotos((fetchedPhotos) => {
      setPhotos(fetchedPhotos);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    if (activeCategory === "All") return photos;
    return photos.filter(p => p.category === activeCategory);
  }, [photos, activeCategory]);

  const navigateLightbox = (direction: number) => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    const nextIndex = (currentIndex + direction + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === "Escape") setActivePhoto(null);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, filteredPhotos]);

  // Scroll prevention when lightbox is open
  useEffect(() => {
    if (activePhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activePhoto]);

  useEffect(() => {
    if (!heroRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let rafId = 0;
    const handleScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(Math.max((rect.top * -1) / rect.height, 0), 1);
      const shift = progress * 18;
      hero.style.setProperty("--hero-shift", `${shift}px`);
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(handleScroll);
    };

    handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleReadStory = (photo: PhotoData) => {
    setStoryPhoto(photo);
    setActivePhoto(null);
    setTimeout(() => {
      const journalSection = document.getElementById("behind-the-lens");
      if (journalSection) {
        journalSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <main>
      <Navbar mode="home" />

      {/* Hero Section */}
      <section
        id="hero"
        className="hero"
        ref={heroRef}
      >
        <div className="hero-media">
          <Image 
            src="/images/camera_hero.png" 
            alt="Aesthetic Leica-style camera" 
            fill
            priority
            quality={90}
            className="hero-img"
          />
        </div>
        <div className="hero-content">
          <h1 className="reveal">Beyond the Frame</h1>
          <p className="reveal delay-1">A Quiet Archive of Light and Weather</p>
          <div className="hero-actions">
            <a className="hero-cta reveal delay-2" href="#gallery">Browse the Archive</a>
          </div>
          <div className="hero-meta reveal delay-3">
            <div>Stillness</div>
            <div>Perspective</div>
            <div>Ethereal</div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="gallery-header">
            <div>
              <h2 className="section-title">Gallery</h2>
              <p className="section-subtitle">A collection of moments preserved in their natural state. Captured with intent, shared with humility.</p>
            </div>
            <div className="filters">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: "var(--muted)", letterSpacing: "3px", textTransform: "uppercase", fontSize: "12px" }}>
              Illuminating the archive...
            </div>
          ) : (
            <motion.div 
               layout
               className="gallery-grid"
            >
              <AnimatePresence>
                {filteredPhotos.map((photo, index) => {
                  return (
                    <motion.div 
                      key={photo.id || index} 
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: (index % 6) * 0.1,
                        ease: [0.215, 0.61, 0.355, 1] 
                      }}
                      className="gallery-item col-4"
                      onClick={() => setActivePhoto(photo)}
                    >
                      <div className="gallery-image-container">
                        <Image 
                          src={photo.src} 
                          alt={photo.alt} 
                          fill
                          sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 33vw"
                          className="gallery-img"
                        />
                      </div>
                      <div className="gallery-overlay">
                        <h3>{photo.title}</h3>
                        <p>{photo.category}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <StoryJournal photo={storyPhoto} />

      {/* About Section */}
      <section id="about" className="about">
        <div className="container about-wrap">
          <div className="about-image-wrap">
            <Image 
              src="/images/VV.jpeg" 
              alt="Vaibhav Verma portrait" 
              fill
              className="about-img"
            />
          </div>
          <div className="reveal delay-1">
            <h2 className="section-title">About Me</h2>
            <p>
              Nature creates. I simply notice and try to hold on up to the beauty it leaves behind. I am still learning,
              still wandering, and always in awe of the small moments that make a place feel alive.
            </p>
            <div className="signature">Vaibhav Verma</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="reveal">
              <h2 className="section-title">Get in Touch</h2>
              <p style={{ color: "var(--muted)", maxWidth: "450px", marginBottom: "30px" }}>
                Whether you have a question, a project in mind, or just want to say hi, I'd love to hear from you.
              </p>
              <div className="contact-list">
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--text)" }}>Email</span>
                  <br/>hello@vverma.com
                </div>
                <div>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--text)" }}>Instagram</span>
                  <br/>@vverma_archive
                </div>
              </div>
            </div>
            
            <div className="contact-card reveal delay-1">
              <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Your Name" required />
                <ValidationError prefix="Name" field="name" errors={state.errors} />
                
                <input type="email" name="email" id="email" placeholder="Your Email" required />
                <ValidationError prefix="Email" field="email" errors={state.errors} />
                
                <textarea name="message" id="message" placeholder="Your Message" required></textarea>
                <ValidationError prefix="Message" field="message" errors={state.errors} />
                
                <button type="submit" disabled={state.submitting}>
                  {state.submitting ? "Delivering..." : "Send Message"}
                </button>
                
                {state.succeeded && (
                  <div style={{ marginTop: "16px", color: "#6bffb2", fontSize: "14px" }}>
                    Message delivered successfully! I'll get back to you soon.
                  </div>
                )}
                {state.errors && (
                  <div style={{ marginTop: "16px", color: "#ff7b7b", fontSize: "14px" }}>
                    Unable to send message. Please check your data.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {activePhoto && (
        <div className="lightbox active" onClick={() => setActivePhoto(null)}>
          <button className="lightbox-close" onClick={() => setActivePhoto(null)}>&times;</button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-image-container">
              <Image 
                key={activePhoto.id}
                src={activePhoto.src} 
                alt={activePhoto.alt} 
                fill
                priority
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="lightbox-prev" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>&#10094;</span>
            <span className="lightbox-next" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>&#10095;</span>
            <div className="lightbox-caption">
              <h3>{activePhoto.title}</h3>
              <p>{activePhoto.category}</p>
              
              {activePhoto.exif && (
                <div className="lightbox-exif">
                  {activePhoto.exif.model && <span>{activePhoto.exif.model}</span>}
                  {activePhoto.exif.fNumber && <span>f/{activePhoto.exif.fNumber}</span>}
                  {activePhoto.exif.exposureTime && <span>{formatExposure(activePhoto.exif.exposureTime)}</span>}
                  {activePhoto.exif.iso && <span>ISO {activePhoto.exif.iso}</span>}
                </div>
              )}

              <button 
                className="lightbox-story-btn"
                onClick={() => handleReadStory(activePhoto)}
              >
                Read The Story
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>&copy; 2025 Vaibhav Verma Archive</p>
        <div style={{ marginTop: "10px" }}>
          <a className="footer-admin" href="/admin">Admin Console</a>
        </div>
      </footer>
    </main>
  );
}
