# Story avatar artwork

Generated with the built-in image-generation tool using `assets/couple.jpg` as the identity reference. The generated square PNG has genuine transparency and is preserved without raster edits.

Final asset: `/Users/diagnal/Documents/ChatGPT/Wedding/assets/story-avatars.png`

The website uses CSS background positioning to show the four quadrants: casual groom, casual bride, wedding groom, wedding bride. Full-body avatars move independently; the wedding layers crossfade over the casual layers as guests scroll. Wedding attire is an illustrative Kerala-style interpretation, not a claim about the couple's actual outfits.

## Final generation prompt

Use case: illustration-story. Create ONE square 2-by-2 avatar sprite sheet for a wedding website, on a genuinely transparent background. The supplied picture is the identity reference for the same South Indian couple, not an edit target. Exactly FOUR separate full-body figures, one centered inside each exact equal square quadrant, ample transparent gutters, no overlap. Top LEFT: groom Akhil, black wavy/curly hair, moustache and short beard, warm brown skin, sage green casual shirt and dark beige trousers, relaxed upright standing, turned slightly toward the right. Top RIGHT: bride Parvathy, long dark wavy hair, warm brown skin, dusty rose modest kurta and ivory trousers, relaxed upright standing, turned slightly toward the left. Bottom LEFT: SAME groom, SAME face, same body size/position and standing pose as top left, wearing Kerala wedding attire: ivory shirt and gold-bordered white mundu. Bottom RIGHT: SAME bride, SAME face and body size/position and standing pose as top right, wearing traditional ivory and gold Kerala bridal sari, gold jewelry, jasmine in hair. All figures full body including feet, at identical scale and aligned baseline WITHIN each cell; figures each fill about 80 percent of cell height and 45 percent of cell width. Elegant hand-painted watercolor avatar illustration, gently stylized but recognizably based on reference faces, natural adult proportions, refined warm stationery aesthetic, sage/dusty rose/ivory/gold. Minimal soft ground shadow directly beneath each figure only. No scene, scenery, objects, frames, borders, lettering, captions, labels, text, or watermark. Transparent alpha background essential. Output as one square sprite sheet, with the four characters confined to their individual exact quadrants.


## Face-reference refinement

Current asset: `/Users/diagnal/Documents/ChatGPT/Wedding/assets/story-avatars-v2.png`

Generated with the built-in image-generation tool. The original sprite sheet remains preserved as `assets/story-avatars.png`. Two separately supplied face photographs were used for this refinement.

### Final refinement prompt

Use case: identity-preserve. Image 1 is the edit target: a square transparent 2-by-2 watercolor avatar sprite sheet. Image 2 is the groom Akhil's clear face reference. Image 3 is the bride Parvathy's clear face reference. Refine ONLY the faces and hair of all four avatars to closely resemble these actual people, rather than the generic faces of the old sheet. Preserve the groom's broad smile, moustache, short beard, voluminous wavy black hair, face shape, eyes and warm skin tone from Image 2. Preserve the bride's rounder smiling face, eyes, eyebrows, nose, smile, dark hair and tiny bindi from Image 3. Both casual and wedding versions of each person must have consistent identity. Turn faces slightly more toward the viewer if needed to show their likeness while still looking gently inward toward each other. Keep the existing tasteful watercolor illustration style and natural adult proportions. STRICT invariants: exact same square 2x2 equal-quadrant layout, same individual character centers and full-body sizes, same baselines, same poses and hands, same outfits and accessories, same transparent gutters, all feet visible, no overlap between quadrants. Top left groom sage casual shirt and beige trousers, top right bride dusty rose kurta and ivory trousers. Bottom left groom ivory shirt and gold-bordered white mundu, bottom right bride ivory/gold Kerala bridal sari and gold jewelry with jasmine flowers. Preserve genuine transparent alpha background. No text, labels, added props, scenery, borders, watermark, or solid background. Output a single square sprite sheet ready to replace Image 1.


## Current supplied artwork

The user supplied finished casual and wedding illustrations. Active website assets are `assets/story-casual-supplied.png` and `assets/story-wedding-supplied.png`. These files are copied byte-for-byte; no generation or raster editing was performed. CSS windows separate the groom (left) and bride (right) while retaining the scroll movement and outfit transition. Previous generated artwork above is preserved as history.


### Latest 2026 replacement

The active wedding artwork is now `assets/story-wedding-2026.png`, copied unchanged from the latest user-supplied PNG (1174 × 1555, transparent). Its CSS windows preserve the new aspect ratio. The casual 2018/2022 artwork is unchanged.
