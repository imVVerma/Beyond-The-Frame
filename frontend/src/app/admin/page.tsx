"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import exifr from "exifr";
import { addPhoto, deletePhoto, updatePhoto, subscribeToPhotos, PhotoData } from "../../lib/photoService";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/Navbar";
import { generateStoryWithAI } from "../../lib/geminiAction";
import { Sparkles } from "lucide-react";

const CATEGORIES = ["Landscape", "Architecture", "Portrait", "Silhouette", "Automotive", "Product", "Generic"];

// Helper to format shutter speed as fraction
const formatExposure = (exposure: number | undefined) => {
  if (!exposure) return null;
  if (exposure >= 1) return `${Math.round(exposure * 10) / 10}s`;
  const denominator = Math.round(1 / exposure);
  return `1/${denominator}s`;
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Landscape");
  const [customCategory, setCustomCategory] = useState("");
  const [alt, setAlt] = useState("");
  const [story, setStory] = useState("");
  
  // Edit State
  const [editingPhoto, setEditingPhoto] = useState<PhotoData | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", customCategory: "", alt: "", story: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [exifData, setExifData] = useState<PhotoData["exif"] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const router = useRouter();

  // AUTH GUARD: Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // AUTH GUARD: Check Whitelist
  useEffect(() => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (user && adminEmail && user.email !== adminEmail) {
      alert("Unauthorized Access. This account is not listed as an administrator.");
      logout();
      router.push("/login");
    }
  }, [user, logout, router]);

  // Subscribe to photos for management
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToPhotos((fetchedPhotos) => {
      setPhotos(fetchedPhotos);
    });
    return () => unsubscribe();
  }, [user]);

  // Dynamically compute unique categories
  const uniqueCategories = Array.from(new Set([
    ...CATEGORIES, 
    ...photos.map(p => p.category)
  ])).filter(Boolean);

  if (loading || !user) {
    return (
      <div className="admin-loading" style={{ height: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <p style={{ letterSpacing: "5px", color: "var(--text)", textTransform: "uppercase", fontSize: "10px" }}>
          Validating Security...
        </p>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Extract EXIF
      try {
        const metadata = await exifr.parse(selectedFile, {
          pick: ['Make', 'Model', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'LensModel']
        });
        
        if (metadata) {
          setExifData({
            make: metadata.Make,
            model: metadata.Model,
            exposureTime: metadata.ExposureTime,
            fNumber: metadata.FNumber,
            iso: metadata.ISO,
            focalLength: metadata.FocalLength,
            lensModel: metadata.LensModel
          });
          // Auto-fill title if empty
          if (!title) {
            const fileName = selectedFile.name.split('.')[0].replace(/[-_]/g, ' ');
            setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1));
          }
        }
      } catch (err) {
        console.error("EXIF Error:", err);
        setExifData(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const finalCategory = category === "__ADD_NEW__" ? customCategory.trim() : category;
    if (category === "__ADD_NEW__" && !finalCategory) {
      alert("Please enter a new category name.");
      return;
    }

    setUploading(true);
    setMessage("Uploading photograph...");

    try {
      const result = await addPhoto(file, { 
        title, 
        category: finalCategory, 
        alt,
        story,
        exif: exifData || undefined // Pass the extracted EXIF
      });
      if (result) {
        setMessage("Success! Redirecting to portfolio...");
        setFile(null);
        setTitle("");
        setAlt("");
        setStory("");
        setCategory("Landscape");
        setCustomCategory("");
        // Redirect after a short delay so they see the success message
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setMessage("Error: Upload failed. Please check your Firebase connection.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error: Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (photo: PhotoData) => {
    setEditingPhoto(photo);
    // Determine if the photo's category is one of the known ones, otherwise default to Add New
    const isKnown = uniqueCategories.includes(photo.category);
    setEditForm({
      title: photo.title,
      category: isKnown ? photo.category : "__ADD_NEW__",
      customCategory: isKnown ? "" : photo.category,
      alt: photo.alt,
      story: photo.story || ""
    });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editingPhoto.id) return;
    
    const finalCategory = editForm.category === "__ADD_NEW__" ? editForm.customCategory.trim() : editForm.category;
    if (editForm.category === "__ADD_NEW__" && !finalCategory) {
      alert("Please enter a new category name.");
      return;
    }

    setEditSaving(true);
    const success = await updatePhoto(editingPhoto.id, {
      title: editForm.title,
      category: finalCategory,
      alt: editForm.alt,
      story: editForm.story
    });

    if (success) {
      setMessage("Photograph updated successfully.");
      setEditingPhoto(null);
      setTimeout(() => setMessage(""), 3000);
    } else {
      alert("Error: Failed to update photograph.");
    }
    setEditSaving(false);
  };

  const handleAIDraft = async () => {
    if (!file) {
      alert("Please select a file first so Gemini can analyze it.");
      return;
    }

    setAiLoading(true);
    setMessage("");

    try {
      // 1. Convert file to base64
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // 2. Call Gemini
      const draftStory = await generateStoryWithAI({ imageBase64, mimeType: file.type });
      
      if (draftStory) {
        setStory(draftStory);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.message.includes("is not configured") 
        ? "Gemini API Key missing. Please restart your 'npm run dev' to pick up changes in .env.local."
        : `Gemini Error: ${error.message}`;
      alert(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string, src: string) => {
    if (confirm("Are you sure you want to delete this photograph? This cannot be undone.")) {
      const success = await deletePhoto(id, src);
      if (success) {
        setMessage("Photograph deleted successfully.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: Failed to delete photograph.");
      }
    }
  };

  return (
    <div className="admin-page-wrapper">
      <Navbar mode="admin" />
      
      <div className="admin-page">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Upload new photographs or manage your existing gallery.</p>
        </header>

        <section className="admin-section">
          <h2 className="admin-label" style={{ fontSize: "16px", marginBottom: "20px", color: "var(--text)" }}>Add New Photo</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div>
              <label className="admin-label">Title</label>
              <input
                className="admin-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Photograph Title"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ marginBottom: category === "__ADD_NEW__" ? "10px" : "0" }}
                >
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__ADD_NEW__">+ Add New Category...</option>
                </select>
                {category === "__ADD_NEW__" && (
                  <input
                    className="admin-input"
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter Custom Category"
                    required
                  />
                )}
              </div>
              <div>
                <label className="admin-label">Select File</label>
                <input
                  className="admin-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            {exifData && (
              <div className="admin-exif-preview" style={{ 
                background: "rgba(255,255,255,0.03)", 
                padding: "20px", 
                borderRadius: "12px", 
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "20px"
              }}>
                <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px", color: "var(--accent)" }}>Technical Preview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                  <div><span style={{ color: "var(--muted)" }}>Camera:</span> {exifData.model || "Unknown"}</div>
                  <div><span style={{ color: "var(--muted)" }}>Lens:</span> {exifData.lensModel || "Unknown"}</div>
                  <div><span style={{ color: "var(--muted)" }}>Aperture:</span> f/{exifData.fNumber || "--"}</div>
                  <div><span style={{ color: "var(--muted)" }}>Exposure:</span> {formatExposure(exifData.exposureTime) || "--"}</div>
                  <div><span style={{ color: "var(--muted)" }}>ISO:</span> {exifData.iso || "--"}</div>
                  <div><span style={{ color: "var(--muted)" }}>Focal:</span> {exifData.focalLength ? `${Math.round(exifData.focalLength)}mm` : "--"}</div>
                </div>
              </div>
            )}

            <div>
              <label className="admin-label">Alt Text (Accessibility)</label>
              <input
                className="admin-input"
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Brief description for screen readers..."
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                <label className="admin-label" style={{ marginBottom: 0 }}>Behind The Lens (Story)</label>
                <button 
                  type="button" 
                  onClick={handleAIDraft} 
                  disabled={aiLoading || !file}
                  className="ai-draft-btn"
                >
                  <Sparkles size={14} style={{ marginRight: "6px" }} />
                  {aiLoading ? "Analyzing Archive..." : "Draft with Gemini"}
                </button>
              </div>
              <textarea
                className="admin-input"
                style={{ minHeight: "150px", resize: "vertical" }}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tell the story behind this photograph..."
              />
            </div>

            {message && (
              <div className={`admin-message ${message.includes("Error") ? "error" : "success"}`}>
                {message}
              </div>
            )}

            <button type="submit" className="admin-button" disabled={uploading}>
              {uploading ? "Uploading to Cloud..." : "Finalize Upload"}
            </button>
          </form>
        </section>

        <section className="admin-manage">
          <h2 className="admin-label" style={{ fontSize: "16px", color: "var(--text)" }}>Manage Gallery ({photos.length})</h2>
          {photos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px", marginTop: "20px" }}>
              No photographs in the archive yet.
            </div>
          ) : (
            <div className="admin-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="admin-card">
                  <img src={photo.src} alt={photo.alt} />
                  <div className="admin-card-content">
                    <div>
                      <h4>{photo.title}</h4>
                      <p style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>{photo.category}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleEditClick(photo)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => photo.id && handleDelete(photo.id, photo.src)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Modal Overlay */}
      {editingPhoto && (
        <div className="modal-overlay">
          <div className="edit-modal reveal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="admin-title" style={{ fontSize: "20px", margin: 0 }}>Edit Photograph</h2>
              <button onClick={() => setEditingPhoto(null)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={submitEdit} className="admin-form">
              <div>
                <label className="admin-label">Title</label>
                <input
                  className="admin-input"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  style={{ marginBottom: editForm.category === "__ADD_NEW__" ? "10px" : "0" }}
                >
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__ADD_NEW__">+ Add New Category...</option>
                </select>
                {editForm.category === "__ADD_NEW__" && (
                  <input
                    className="admin-input"
                    type="text"
                    value={editForm.customCategory}
                    onChange={(e) => setEditForm({...editForm, customCategory: e.target.value})}
                    placeholder="Enter Custom Category"
                    required
                  />
                )}
              </div>

              <div>
                <label className="admin-label">Alt Text (Accessibility)</label>
                <input
                  className="admin-input"
                  type="text"
                  value={editForm.alt}
                  onChange={(e) => setEditForm({...editForm, alt: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="admin-label">Behind The Lens (Story)</label>
                <textarea
                  className="admin-input"
                  style={{ minHeight: "150px", resize: "vertical" }}
                  value={editForm.story}
                  onChange={(e) => setEditForm({...editForm, story: e.target.value})}
                />
              </div>

              <button type="submit" className="admin-button" disabled={editSaving} style={{ width: "100%" }}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

