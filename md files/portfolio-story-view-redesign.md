# Portfolio — Story View Redesign

## 1. Current Behavior (for context)
- Admin uploads a photo, adds: name, accessibility text, story (own or AI-generated).
- Clicking a photo opens a view showing name + image metadata.
- Clicking "Read Story" navigates away from the photo entirely, landing in a
  story section **below all the photos in the grid** — breaks visual/spatial
  continuity with the image just viewed.
- On mobile, the image lightbox/close ("X") button is sometimes visually cut
  off or overlapped by the image itself.
- Story generation quality/tone is inconsistent across photos (**out of scope
  for this pass** — layout fixes only, revisit separately).

## 2. Problems to Fix
1. "Read Story" breaks navigation context — story feels detached from its photo.
2. No responsive distinction — mobile reuses the same "story dumped below the
   grid" pattern, which is worse on a small screen.
3. Mobile close button gets clipped/overlapped on some images.

## 3. Desired Behavior

### Desktop
- Photo view is centered by default (current behavior).
- On "Read Story" click:
  - Image animates/shifts to occupy the **left half** of the view.
  - Story panel slides in on the **right half**, same view — no scroll-away,
    no navigation change.
  - **Short stories:** still use the side-by-side layout, but the story panel
    renders narrower (e.g. don't force it to fill the full right half — size
    the panel to content, up to a max width, rather than stretching short
    text across a wide column).
  - Clicking "Read Story" again (or a close/back control) returns the image
    to its centered state.

### Mobile
- Image opens in its normal full view (name + metadata visible, as today).
- On "Read Story" tap: **do not** navigate to a separate screen or bottom
  sheet. Instead, the story content extends the *same* image view — user
  scrolls down within that view to read the story, and scrolling back up
  returns them to the image + metadata, still inside the same modal/view
  context. No route change, no separate "page."
- Fix: ensure the close ("X") control is never overlapped or clipped by the
  image — likely needs a fixed z-index/safe-area treatment independent of
  image dimensions, rather than being positioned relative to the image itself.

## 4. Edge Cases to Handle
- Photo with no story at all → "Read Story" button shouldn't appear, or
  should be disabled (confirm which).
- Very long stories on desktop → right panel should scroll internally rather
  than growing the whole view.
- Resize/orientation change while a story is open — layout should re-evaluate
  desktop vs. mobile treatment without breaking state.

## 5. Explicitly Out of Scope (this pass)
- Standardizing story tone/structure/length across photos — deferred to a
  separate pass once layout is settled.

## 6. Open Question for Implementation
- For photos with **no story**: hide the button entirely, or show it disabled
  with a tooltip like "No story added yet"?
