# Akhil & Parvathy — wedding invitation

A dependency-free HTML/CSS/vanilla JavaScript wedding website, a single fullscreen invitation inspired by the supplied stationery reference. Warm paper, restrained olive typography, locally bundled Cormorant Garamond and Italianno fonts, full-width photography, botanical accents and fluid transitions.

## Preview

Run `python3 -m http.server 4174` and open http://localhost:4174. `index.html` is the only invitation. Maps, calendars and family details are all on this page. The small `invite.html` file only redirects older links to the main invitation; it does not contain a second invitation.

Every section spans the full browser width and is at least one viewport tall. Desktop uses spacious split layouts; phones stack content vertically and allow longer sections to scroll naturally:
1. Invitation
2. Our story
3. Wedding details
4. The day's timeline
5. With love

The couple supplied three milestones: meeting at college in 2018, getting together after college as their corporate careers began in 2022, and saying yes to marriage in 2026.

## Add your photographs

The supplied watercolor portrait is currently reused in photo windows so the website remains complete while awaiting photographs. All image choices live in `CONFIG.IMAGES` in `js/invitation.js`. Add photos to `assets/`, then replace the relevant `null` with a relative path, for example `'assets/hero.jpg'`.

| Slot | Recommended photograph | Suggested source size |
| --- | --- | --- |
| `hero` | Portrait of you together, with faces near the center | 1200 × 1600 or larger |
| `venue` | Exterior of the temple or wedding venue | 1600 × 900 or larger |
| `closing` | Another portrait, such as a walking or sunset photograph | 1200 × 1600 or larger |

One hero photo and one closing photo are sufficient to make the collection feel personal; the venue image is optional. The website does not use the sample reference couple's photographs. Real photos automatically stop using the crop adjustments for the supplied watercolor image. Fine-tune `object-position` on the corresponding photo class in `css/styles.css` when needed. Keep descriptive image alt text in `index.html` aligned with replacements. JPEG or WebP below about 500 KB per photo is ideal.

Our Story now uses two generated avatars instead of a text timeline. The chapters follow 2018, 2022 and 2026. Scrolling keeps the story stage in view: the avatars start apart in 2018, approach each other by 2022, and change into Kerala-style wedding attire in 2026. The scroll track is 340 viewport heights in CSS percentage terms (340svh, or 3.4 screens), reduced to 320svh on phones. Year buttons can jump between stages. Scrolling backwards reverses the movement and outfit change. Edit the chapter text in `index.html` and the scroll thresholds in the final section of `js/invitation.js`.

The active avatar artwork is the supplied `assets/story-casual-supplied.png` and `assets/story-wedding-2026.png`. Both original transparent PNGs are preserved exactly; CSS windows isolate each person so they can move independently. Earlier generated sprite sheets are retained as source history only.

## Maps

Edit `CONFIG` in `js/invitation.js`:
- `MAPS.temple`, `MAPS.auditorium`, `MAPS.reception`: currently Google Maps searches using the supplied venue names. Replace with verified place links if desired.


Calendar downloads are generated locally. Wedding: 22 November 2026, 07:45–08:05 IST (02:15–02:35 UTC). Reception: 17:30 IST (12:00 UTC), with no invented end time. The auditorium follows the ceremony; no unsupported exact start time is shown.

## Motion and accessibility

Sections reveal with staggered opacity/vertical transitions, subtle photo scaling and a single interruptible 1.45-second eased scroll. On phones only, the invitation waits around 8.5 seconds, advances to Our Story, then stops automatic navigation so guests can control the avatar story by scrolling. Desktop and tablet layouts do not auto-scroll. Mouse/touch/keyboard input, manual scrolling, resizing across the mobile breakpoint or switching tabs stops autoplay for the visit. Manual scrolling stays native; no scroll hijacking or heavy canvas library is used.

Reduced-motion mode disables autoplay and transitions. Story avatars switch directly between chapter positions and outfits instead of sliding or fading. The year buttons remain available. The HTML invitation is readable without JavaScript; interactive tools require JavaScript. External links use safe new-tab handling.

## Build and deploy

Run `python3 scripts/build.py` to copy public files to `dist/`. No package installation or framework build is needed.
- **Netlify:** upload `dist/`, or use build command `python3 scripts/build.py` and publish directory `dist`.
- **Vercel:** select Other, build command `python3 scripts/build.py`, output directory `dist`.
- **GitHub Pages:** put the contents of `dist/` at the root of the `gh-pages` branch and select that branch under Settings → Pages. Paths are relative and work under repository subpaths.

Before using a different host, change `og:image` in `index.html` to the absolute public URL of `assets/save-the-date.jpg`. The original Save the Date social card is preserved. WhatsApp preview crawlers need a public URL. A private Sites review link is owner-only, not a link for guests.

`assets/fonts/` includes the self-hosted fonts and their SIL Open Font License files. No runtime requests to Google Fonts are required. All layout and responsive styling lives in `css/styles.css`.

## Export a WhatsApp-ready MP4

1. Start the local server and open `http://localhost:4174/?export=1`. This hides the outside navigation and footer.
2. Set a 360 × 640 portrait browser viewport (3× capture scale gives 1080 × 1920). Use a normal-motion setting.
3. Record from reload. The cover advances to Our Story; slowly scroll through its three avatar chapters, then the wedding details, timeline and closing section, pausing so each can be read. At small viewport heights, a full section may require a short scroll.
4. Trim loading frames. Export H.264 MP4, 1080 × 1920, 30 fps, AAC for audio if used, and fast-start enabled.
5. Optional FFmpeg command: `ffmpeg -i recording.mov -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xf2ece3,setsar=1" -r 30 -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -movflags +faststart wedding-invitation.mp4`.
6. Share the public invitation URL in the video's WhatsApp caption. Video buttons are not tappable.

No MP4 is included. The original `assets/invitation.jpg` is retained in the source assets, preserving the supplied QR code and all original artwork.

### Memories from Google Drive — GitHub Pages

In `js/invitation.js`, paste your Google Drive browser API key into:

```js
MEMORIES: {
  API_KEY: '', // paste your restricted key here
  DRIVE_FOLDER_URL: 'https://drive.google.com/drive/folders/1zW14fybVorXE-Bq8KNrZCPvHCgvftYWb'
}
```

Enable Google Drive API for its Google Cloud project. Restrict this key to
Google Drive API and the website referrer `https://akhilmohanr.github.io/*`.
The key is visible in browser code, so use a dedicated restricted browser key,
not OAuth secrets or service-account credentials. Keep the folder and photos
shared as Anyone with the link / Viewer.

The gallery fetches the current folder through Drive API v3 on every page load,
following pagination and excluding deleted files and non-images. A shimmer is
shown while the list and image files load. Empty folders and failed requests
show a message with a link to the album. Existing card styling and viewer remain.
No Python backend, generated photo list, iframe, or sync command is required.
The old server, sync script, and generated photo inventory have been removed.

Test on your permitted GitHub Pages origin. For local HTTP previews, explicitly
allow that localhost origin in your key restrictions; a website-restricted key
normally will not work from a directly opened file:// page. A blank key leaves
the gallery unavailable until configured. Google caching can delay newly added
photos. Only images directly within the folder are included.
