import collections.abc
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]

    # Color Palette
    COLOR_DARK_BG = RGBColor(0x1B, 0x1A, 0x24)      # Midnight Heritage Plum/Navy
    COLOR_LIGHT_BG = RGBColor(0xFD, 0xFB, 0xF7)     # Warm Ivory Silk
    COLOR_CARD_BG = RGBColor(0xFF, 0xFF, 0xFF)      # Crisp White
    COLOR_CARD_BORDER = RGBColor(0xE2, 0xD7, 0xC8)  # Subtle Sand Border
    COLOR_PRIMARY = RGBColor(0x8B, 0x1E, 0x2A)      # Heritage Maroon
    COLOR_GOLD = RGBColor(0xC4, 0x97, 0x2F)         # Antique Vedic Gold
    COLOR_GOLD_LIGHT = RGBColor(0xF6, 0xEE, 0xD9)   # Gold Tint
    COLOR_TEXT_DARK = RGBColor(0x22, 0x22, 0x26)    # Charcoal
    COLOR_TEXT_MUTED = RGBColor(0x5E, 0x5E, 0x66)   # Slate Gray
    COLOR_TEXT_LIGHT = RGBColor(0xF5, 0xF5, 0xF7)   # Near White
    COLOR_ACCENT_TEAL = RGBColor(0x1E, 0x6B, 0x68)  # Peacock Green/Teal

    def add_header(slide, title_text, category_text="CHAUṢAṢṬHI KALĀS • 64 ART FORMS & OCCUPATIONAL SKILLS", is_dark=False):
        # Category Tracker
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_GOLD if is_dark else COLOR_PRIMARY

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_LIGHT if is_dark else COLOR_DARK_BG

        # Underline accent
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.55), Inches(2.0), Inches(0.04))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_GOLD
        line.line.color.rgb = COLOR_GOLD

    def set_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # ==========================================================
    # SLIDE 1: Title Slide (Dark Theme)
    # ==========================================================
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s1, COLOR_DARK_BG)

    # Decorative Border Frame
    border = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.5), Inches(12.333), Inches(6.5))
    border.fill.background()
    border.line.color.rgb = COLOR_GOLD
    border.line.width = Pt(1.5)

    # Inner Pill Tag
    tag = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.66), Inches(1.4), Inches(4.0), Inches(0.45))
    tag.fill.solid()
    tag.fill.fore_color.rgb = COLOR_PRIMARY
    tag.line.color.rgb = COLOR_GOLD
    tf_tag = tag.text_frame
    tf_tag.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_tag.paragraphs[0]
    p.text = "ANCIENT WISDOM FOR MODERN MINDS"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_TEXT_LIGHT

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(10.9), Inches(1.8))
    tf = t_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "The 64 Kalās (Chauṣaṣṭhi Kalā)"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_GOLD

    p2 = tf.add_paragraph()
    p2.text = "Classical Indian Art Forms, Crafts & Occupational Sciences"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.size = Pt(20)
    p2.font.color.rgb = COLOR_TEXT_LIGHT

    # Divider line
    div = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.16), Inches(4.3), Inches(3.0), Inches(0.04))
    div.fill.solid()
    div.fill.fore_color.rgb = COLOR_GOLD
    div.line.color.rgb = COLOR_GOLD

    # Sub-bullets / Info
    info_box = s1.shapes.add_textbox(Inches(2.0), Inches(4.6), Inches(9.333), Inches(1.8))
    tf_info = info_box.text_frame
    tf_info.word_wrap = True
    
    pi = tf_info.paragraphs[0]
    pi.text = "A 20-Minute Journey into Holistic Polymathy, Aesthetic Genius & Vocational Mastery"
    pi.alignment = PP_ALIGN.CENTER
    pi.font.size = Pt(14)
    pi.font.color.rgb = RGBColor(0xCB, 0xCB, 0xD4)

    pi2 = tf_info.add_paragraph()
    pi2.text = "From Sandīpani Āśrama & Kāmasūtra to 21st Century Multidisciplinary Education"
    pi2.alignment = PP_ALIGN.CENTER
    pi2.font.size = Pt(13)
    pi2.font.italic = True
    pi2.font.color.rgb = COLOR_GOLD

    add_notes(s1, 
        "TIMING: 0:00 - 1:30 (1.5 mins)\n"
        "HOOK: Welcome everyone. When we think of education today, we often think of hyper-specialization—engineering, finance, code, medicine. But thousands of years ago, Indian civilization conceived the pinnacle of human development not as a narrow specialist, but as a complete polymath through the framework of the '64 Kalas'.\n"
        "OBJECTIVE: Over the next 20 minutes, we will deconstruct what these 64 arts are, how they balanced fine arts, hard engineering, botany, cryptography, and daily living, and why this ancient blueprint is directly relevant to our modern quest for creative intelligence."
    )

    # ==========================================================
    # SLIDE 2: What is a 'Kala'? Philosophical Framework
    # ==========================================================
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s2, COLOR_LIGHT_BG)
    add_header(s2, "Understanding 'Kalā': Beyond Just 'Art'")

    cards_data = [
        ("Etymological Root", "From the root 'Kal' (कन् / कलयति)", 
         "• Signifies to count, create, know, harmonize, or manifest.\n• A Kalā is any human activity that blends cognitive intellect (Buddhi), manual technique (Kriya), and aesthetic delight (Rasa).\n• Not mere theoretical knowledge (Jnana), but practical mastery executed with elegance.",
         COLOR_PRIMARY),
        ("The Quadruple Life Goals", "Purushartha Alignment",
         "• Dharma (Righteous Living): Ethical crafts & environmental harmony.\n• Artha (Vocational Prosperity): Highly marketable tradecrafts & engineering.\n• Kama (Aesthetic Fulfillment): Love, music, theater, design & refined sensory living.\n• Moksha (Inner Liberation): Flow states & contemplation through pure creativity.",
         COLOR_ACCENT_TEAL),
        ("The Holistic Human Ideal", "Nāgaraka & Sarva-Gunin",
         "• Rejects the artificial split between 'Art' and 'Science/Technology'.\n• Cultivates whole-brain neuroplasticity: left-brain analytical logic fused with right-brain aesthetic discernment.\n• An accomplished citizen was expected to be conversant in both metallurgy and poetry.",
         COLOR_GOLD)
    ]

    lefts = [0.8, 4.8, 8.8]
    for i, (head, subhead, body, acc) in enumerate(cards_data):
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(lefts[i]), Inches(1.9), Inches(3.73), Inches(4.8))
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_CARD_BORDER
        card.line.width = Pt(1)

        # Top strip
        strip = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(lefts[i]), Inches(1.9), Inches(3.73), Inches(0.12))
        strip.fill.solid()
        strip.fill.fore_color.rgb = acc
        strip.line.fill.background()

        tb = s2.shapes.add_textbox(Inches(lefts[i] + 0.25), Inches(2.2), Inches(3.23), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = head
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY

        p2 = tf.add_paragraph()
        p2.text = subhead
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.text = "\n" + body
        p3.font.size = Pt(12)
        p3.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s2,
        "TIMING: 1:30 - 3:00 (1.5 mins)\n"
        "KEY MESSAGE: In Western classical thought, art (fine arts) was historically separated from craft or technical trades (technē). In India, 'Kala' completely unites them.\n"
        "TALKING POINTS: Highlight that 'Kala' comes from 'kalayati'—to give measure, shape, or manifestation to thought. Notice how the Kalas directly feed the four Purusharthas: they provide livelihood (Artha), aesthetic and romantic bliss (Kama), societal balance (Dharma), and spiritual absorption (Moksha). Emphasize the concept of the 'Nagaraka'—the cultured urban citizen."
    )

    # ==========================================================
    # SLIDE 3: Literary Sources & The Legend of Krishna
    # ==========================================================
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s3, COLOR_LIGHT_BG)
    add_header(s3, "Historical & Textual Foundations")

    # Left Column: Krishna's Sandipani Ashram Story
    k_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    k_card.fill.solid()
    k_card.fill.fore_color.rgb = COLOR_GOLD_LIGHT
    k_card.line.color.rgb = COLOR_GOLD
    k_card.line.width = Pt(1)

    ktb = s3.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    ktf = ktb.text_frame
    ktf.word_wrap = True

    kp1 = ktf.paragraphs[0]
    kp1.text = "The Sandīpani Āśrama Benchmark"
    kp1.font.size = Pt(18)
    kp1.font.bold = True
    kp1.font.color.rgb = COLOR_PRIMARY

    kp2 = ktf.add_paragraph()
    kp2.text = "Bhāgavata Purāṇa (10.45.35–36) & Harivaṁśa"
    kp2.font.size = Pt(11)
    kp2.font.bold = True
    kp2.font.color.rgb = COLOR_GOLD

    kp3 = ktf.add_paragraph()
    kp3.text = (
        "\n• Sri Krishna and Balarama studied at Guru Sandipani's hermitage in Ujjayini.\n"
        "• According to the epic narrative, Krishna mastered all 64 Kalās in just 64 days (aho-rātra) — mastering one complete art form and trade skill each day and night.\n"
        "• Symbolism: Not merely a supernatural feat, but a cultural curriculum showcasing that even a prince and divine hero must acquire complete vocational and aesthetic competence before entering public life."
    )
    kp3.font.size = Pt(12)
    kp3.font.color.rgb = COLOR_TEXT_DARK

    # Right Column: Textual Lineages
    right_sources = [
        ("Vātsyāyana’s Kāmasūtra (3rd C. CE)", "Most definitive codification of the 64 Bahya (practical) Kalās essential for social sophistication and interpersonal harmony."),
        ("Śukranīti (Ancient Statecraft & Polity)", "Categorizes arts into 64 primary Kalas and hundreds of auxiliary branches directly required for kingdom administration, military readiness, and economic self-reliance."),
        ("Jaina & Buddhist Cannons (Lalitavistara & Kalpasūtra)", "Enumerate the 64 / 72 arts taught to Prince Siddhartha Gautama and Tirthankara Rishabhanatha, demonstrating pan-Indian cultural consensus across Vedic, Buddhist, and Jain traditions.")
    ]

    r_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    r_card.fill.solid()
    r_card.fill.fore_color.rgb = COLOR_CARD_BG
    r_card.line.color.rgb = COLOR_CARD_BORDER
    r_card.line.width = Pt(1)

    rtb = s3.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    rtf = rtb.text_frame
    rtf.word_wrap = True

    rp1 = rtf.paragraphs[0]
    rp1.text = "Canonical Literature & Traditions"
    rp1.font.size = Pt(18)
    rp1.font.bold = True
    rp1.font.color.rgb = COLOR_PRIMARY

    for title, desc in right_sources:
        pt = rtf.add_paragraph()
        pt.text = "\n" + title
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = COLOR_ACCENT_TEAL

        pd = rtf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(11)
        pd.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s3,
        "TIMING: 3:00 - 4:45 (1.75 mins)\n"
        "STORYTELLING MOMENT: Tell the story of Krishna at Sandipani Ashram. Krishna is revered as the ultimate Purna-Avatara (complete manifestation) partly because he mastered all 64 Kalas. He wasn't just a philosopher on the battlefield of Kurukshetra; he was a master flute player (Venu-vadana), wrestler (Malla-yuddha), diplomat, charioteer, and scholar.\n"
        "TEXTUAL REACH: Mention that this wasn't isolated to one sect: Kamasutra codifies it for urban society, Sukraniti for governance/economy, and Buddhist/Jain literature shows Siddhartha Gautama and Mahavira's traditions honoring the same multidisciplinary arts."
    )

    # ==========================================================
    # SLIDE 4: Taxonomy & System Architecture (7 Domains)
    # ==========================================================
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s4, COLOR_LIGHT_BG)
    add_header(s4, "The Architecture of the 64 Kalās: 7 Integrated Domains")

    # 7 Domain Badges arranged in an intuitive grid
    domains = [
        ("1. Performing Arts & Music", "Gīta, Vādya, Nṛtya, Nāṭya", "Vocal music, instrumentation, classical dance, dramatic stagecraft.", COLOR_PRIMARY),
        ("2. Visual Arts & Aesthetics", "Ālekhya, Dhālikā, Puṣpa-bhedikā", "Painting, floor art (Rangoli/Alpana), floral arrangements, clay sculpting.", COLOR_GOLD),
        ("3. Crafts, Engineering & Sciences", "Takṣaṇa, Dhātuvāda, Maṇi-rāga", "Carpentry, architecture, metallurgy, gemology, mining & alchemy.", COLOR_ACCENT_TEAL),
        ("4. Cognitive, Linguistic & Literary", "Prahelikā, Kāvya-samasyā, Mlecchita", "Riddles, extempore poetry completion, memory feats, cryptography & secret ciphers.", COLOR_PRIMARY),
        ("5. Botany, Ecology & Culinary", "Vṛkṣāyurveda, Āsava, Citra-śāka", "Plant pathology, soil science, fermentation, culinary gastronomy, beverage blending.", COLOR_ACCENT_TEAL),
        ("6. Fashion, Personal Care & Styling", "Vastra-gopana, Sugandha, Bhūṣaṇa", "Costume design, bespoke perfumery, jewelry styling, drapery and personal grooming.", COLOR_GOLD),
        ("7. Games, Strategy & Physical Culture", "Dyūta, Caturanga, Vyāyāmikī, Bāla", "Ancient chess, tactical gaming, physical athletics, martial agility & children’s games.", COLOR_PRIMARY)
    ]

    # Display as top 4 cards and bottom 3 cards
    for idx, (d_name, d_sanskrit, d_desc, d_col) in enumerate(domains[:4]):
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 2.98), Inches(1.85), Inches(2.8), Inches(2.4))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD_BG
        c.line.color.rgb = d_col
        c.line.width = Pt(1.5)

        tb = s4.shapes.add_textbox(Inches(0.9 + idx * 2.98), Inches(1.95), Inches(2.6), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = d_name
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = d_col

        p2 = tf.add_paragraph()
        p2.text = d_sanskrit
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.text = "\n" + d_desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = COLOR_TEXT_DARK

    for idx, (d_name, d_sanskrit, d_desc, d_col) in enumerate(domains[4:]):
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 3.98), Inches(4.45), Inches(3.8), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD_BG
        c.line.color.rgb = d_col
        c.line.width = Pt(1.5)

        tb = s4.shapes.add_textbox(Inches(0.95 + idx * 3.98), Inches(4.55), Inches(3.5), Inches(2.15))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = d_name
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = d_col

        p2 = tf.add_paragraph()
        p2.text = d_sanskrit
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.text = "\n" + d_desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s4,
        "TIMING: 4:45 - 6:30 (1.75 mins)\n"
        "BIG PICTURE SLIDE: Walk the audience through the 7 domains. Emphasize how balanced this taxonomy is:\n"
        "- Domains 1 & 2 feed sensory and emotional intelligence.\n"
        "- Domain 3 represents hardcore industrial manufacturing, construction, and economic production.\n"
        "- Domain 4 represents neuro-linguistics, memory champions, and state security ciphers.\n"
        "- Domain 5 represents biological sciences and food technology.\n"
        "- Domain 6 represents design thinking and personal presentation.\n"
        "- Domain 7 represents strategic mental models and physical resilience.\n"
        "Notice that no single person is just a 'techie' or an 'artist'; they embody the full spectrum."
    )

    # ==========================================================
    # SLIDE 5: Domain 1 - Performing Arts & Music
    # ==========================================================
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s5, COLOR_LIGHT_BG)
    add_header(s5, "Domain 1: Performing Arts, Music & Expressive Sound")

    items_d1 = [
        ("Gītam (गीतम्)", "The Science of Vocal Music", "Mastery of Shruti (microtones), Svara (pitch), Raga (melodic structure), and Bhava (emotional resonance). Voice culture was seen as the primary vehicle of spiritual and emotional communication."),
        ("Vādyam (वाद्यम्)", "Instrumental Acoustic Mastery", "Expertise across the 4 classical instrument families: Tata (stringed: veena), Avanaddha (percussion: mridangam), Sushira (wind: flute), and Ghana (idiophones: cymbals)."),
        ("Nṛtyam (नृत्यम्)", "Expressive & Rhythmic Dance", "Coordination of Tala (meter), Angika Abhinaya (body gestures), Mudras (hand codices), and Rasa-utpatti (generating aesthetic ecstasy in the spectator)."),
        ("Nāṭyākhyāyikā (नाट्यम्)", "Theatrical Dramaturgy", "Writing, staging, and acting in dramatic plays, embodying diverse characters, and conveying nuanced social narratives as later codified in Bharata's Natyashastra.")
    ]

    for idx, (title, sub, body) in enumerate(items_d1):
        x = 0.8 + (idx % 2) * 5.95
        y = 1.9 + (idx // 2) * 2.5
        box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_PRIMARY
        box.line.width = Pt(1.2)

        tb = s5.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title + " — " + sub
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY

        p2 = tf.add_paragraph()
        p2.text = "\n" + body
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s5,
        "TIMING: 6:30 - 8:00 (1.5 mins)\n"
        "KEY CONCEPTS: These are the top four fundamental arts listed in the Kamasutra. Together, Gita, Vadya, and Nritya formed 'Sangeeta'.\n"
        "TALKING POINTS: Explain that vocal and instrumental training was not considered a luxury for entertainers, but a baseline practice for mental focus, breath regulation (Pranayama overlap), and auditory precision. The Natya tradition integrated all visual arts, poetry, and movement into a total experiential theater."
    )

    # ==========================================================
    # SLIDE 6: Domain 2 - Visual Arts & Design
    # ==========================================================
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s6, COLOR_LIGHT_BG)
    add_header(s6, "Domain 2: Visual Arts, Space Design & Aesthetics")

    items_d2 = [
        ("Ālekhyam (आलेख्यम्)", "Painting & Iconography", "The Six Limbs of Painting (Shadanga): Rupabheda (perception of form), Pramana (proportion), Bhava (emotion), Lavanya (grace), Sadrishya (similitude), and Varnikabhanga (color mixing)."),
        ("Viśeṣakacchedyam & Rangoli", "Floor & Ritual Geometry", "Tandula-kusuma-bali-vikara: Spatial floor installations using natural colored powders, grains, and blossoms. Mathematical fractals and sacred geometry in threshold aesthetics."),
        ("Puṣpāstaraṇam & Mālā-grathana", "Floral Architecture", "Creating living floral carpets, scented couches, and complex garland-weaving using color harmony, fragrance balance, and structural knotting for seasonal festivities."),
        ("Mṛttikā-karma & Citra-yoga", "Clay Sculpting & Illusions", "Modeling 3D figurines, casting terracotta, and creating optical perspective illusions and tactile surfaces in residential courtyards.")
    ]

    for idx, (title, sub, body) in enumerate(items_d2):
        x = 0.8 + (idx % 2) * 5.95
        y = 1.9 + (idx // 2) * 2.5
        box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_GOLD
        box.line.width = Pt(1.2)

        tb = s6.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title + " — " + sub
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_GOLD

        p2 = tf.add_paragraph()
        p2.text = "\n" + body
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s6,
        "TIMING: 8:00 - 9:30 (1.5 mins)\n"
        "KEY CONCEPTS: Visual culture in ancient India was both permanent (murals like Ajanta, temple carvings) and ephemeral (daily kolam/rangoli, floral beds).\n"
        "TALKING POINTS: Highlight the 'Shadanga' (6 limbs of Indian painting) which predate Renaissance perspective theories by centuries. Point out how daily practices like Rangoli combined advanced symmetry, sacred geometry, and biodegradable environmental materials."
    )

    # ==========================================================
    # SLIDE 7: Domain 3 - Crafts, Engineering & Material Sciences
    # ==========================================================
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s7, COLOR_LIGHT_BG)
    add_header(s7, "Domain 3: Crafts, Engineering & Material Sciences")

    items_d3 = [
        ("Dhātuvāda (धातुवादः)", "Metallurgy & Chemical Extraction", "Smelting, purifying, and compounding noble & base metals. Production of Wootz steel (crucible steel), rust-resistant irons, and brass alloys."),
        ("Maṇi-rāga-jñānam (मणिरत्नज्ञानम्)", "Gemology & Lapidary Science", "Assaying gem purity, identification of flaws, cutting, faceting, and enhancing colors of diamonds, rubies, pearls, and emeralds."),
        ("Takṣaṇam & Vāstu-vidyā", "Carpentry & Architecture", "Precision joinery without nails, civil engineering, layout of acoustic amphitheaters, climate-responsive dwellings, and town planning."),
        ("Rūpya-ratna-parīkṣā", "Numismatics & Assay Testing", "Evaluating precious metal currencies, detecting counterfeits through specific gravity and touchstone (Kasauti) verification.")
    ]

    for idx, (title, sub, body) in enumerate(items_d3):
        x = 0.8 + (idx % 2) * 5.95
        y = 1.9 + (idx // 2) * 2.5
        box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_ACCENT_TEAL
        box.line.width = Pt(1.2)

        tb = s7.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title + " — " + sub
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_ACCENT_TEAL

        p2 = tf.add_paragraph()
        p2.text = "\n" + body
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s7,
        "TIMING: 9:30 - 11:00 (1.5 mins)\n"
        "BREAKING STEREOTYPES: This is where audiences are most surprised! The 64 Kalas are NOT just music and dance. Over 20 of them are hard technological and economic sciences.\n"
        "TALKING POINTS: Explain Dhatuvada—India's legendary metallurgy that produced the Delhi Iron Pillar and Damascus blades (Wootz steel). Gemology was crucial because India was the world's primary source of diamonds until the 18th century. Emphasize that evaluating currency and architecture were standard civic competencies."
    )

    # ==========================================================
    # SLIDE 8: Domain 4 - Literary, Cognitive & Cryptographic Arts
    # ==========================================================
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s8, COLOR_LIGHT_BG)
    add_header(s8, "Domain 4: Linguistic, Cryptographic & Cognitive Arts")

    items_d4 = [
        ("Prahelikā (प्रहेलिका)", "Intellectual Enigmas & Riddles", "Decoding layered double-entendres (Shlesha), poetic puzzles, and mathematical riddles to sharpen razor-quick lateral thinking and deductive logic."),
        ("Mlecchita-vikalpāḥ (म्लेच्छितविकल्पाः)", "Ciphers, Steganography & Cryptography", "Writing in secret alphabets, syllabic substitution codes, and encrypted ciphers. Essential for royal diplomacy, state espionage (Kautilya's Arthashastra), and confidential romance."),
        ("Kāvya-samasyā-pūraṇam", "Impromptu Metrical Synthesis", "Completing an extempore poem given only a difficult closing meter line or contradictory riddle, adhering to strict prosodic rhythms under timed pressure."),
        ("Dhāraṇa-mātṛkā & Akṣara-muṣṭikā", "Mnemonic Systems & Sign Language", "High-speed mental memory palaces, silent communication via finger-joint codices, and reading lip/facial subtleties during negotiations.")
    ]

    for idx, (title, sub, body) in enumerate(items_d4):
        x = 0.8 + (idx % 2) * 5.95
        y = 1.9 + (idx // 2) * 2.5
        box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_PRIMARY
        box.line.width = Pt(1.2)

        tb = s8.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title + " — " + sub
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_PRIMARY

        p2 = tf.add_paragraph()
        p2.text = "\n" + body
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s8,
        "TIMING: 11:00 - 12:30 (1.5 mins)\n"
        "ENGAGING INTELLECTUAL DEPTH: Highlight Mlecchita-vikalpa—it is literally ancient cryptography! The Kamasutra lists 2 explicit cipher systems (Gudhalephya and Kautilya's ciphers) where letters are substituted or shuffled.\n"
        "TALKING POINTS: Mention 'Samasya-purana'—this was the ancient Indian intellectual parlor sport. A poet gives you the final line: 'The lotus bloomed at midnight under the blazing sun'—and you have 60 seconds to compose the preceding three lines in perfect meter to make philosophical and poetic sense of that paradox."
    )

    # ==========================================================
    # SLIDE 9: Domain 5 - Botany, Ecology & Culinary Sciences
    # ==========================================================
    s9 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s9, COLOR_LIGHT_BG)
    add_header(s9, "Domain 5: Botany, Ecological Sciences & Gastronomy")

    items_d5 = [
        ("Vṛkṣāyurveda-yoga (वृक्षायुर्वेदः)", "Arboriculture & Plant Pathology", "Science of diagnosing plant diseases, seed germination techniques, soil classification, tree-grafting, and ecological micro-gardening for sustainable estates."),
        ("Pāna-kāsava-rasāyana", "Brewing, Fermentation & Elixirs", "Crafting medicinal tinctures, herbal cordials, fermented asavas, cooling summer sherbets (Pānaka), and botanical digestive tonics."),
        ("Citra-śāka-pūpa-bhakṣya-vikāra", "Culinary Gastronomy & Baking", "Gourmet culinary preparation: mastering the 6 tastes (Shad-rasa), balanced spicing, culinary chemistry, baking breads (pūpa), and sweet confectioneries."),
        ("Udaka-vādyam & Udaka-ghāta", "Hydraulic Arts & Water Aerodynamics", "Water music (playing acoustic bowls filled with calibrated water levels - Jalatarang ancestor) and designing pressure-operated fountain jets in water gardens.")
    ]

    for idx, (title, sub, body) in enumerate(items_d5):
        x = 0.8 + (idx % 2) * 5.95
        y = 1.9 + (idx // 2) * 2.5
        box = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(5.75), Inches(2.3))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_CARD_BG
        box.line.color.rgb = COLOR_ACCENT_TEAL
        box.line.width = Pt(1.2)

        tb = s9.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title + " — " + sub
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_ACCENT_TEAL

        p2 = tf.add_paragraph()
        p2.text = "\n" + body
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s9,
        "TIMING: 12:30 - 14:00 (1.5 mins)\n"
        "SUSTAINABILITY & GASTRONOMY: Emphasize Vrikshayurveda—an entire branch of science dedicated to the healthcare of trees and crops! It prescribed herbal decoctions (like Kunapajala) to enrich soil centuries before modern organic farming.\n"
        "GASTRONOMY: Food was not merely fuel; it was Ayurvedic culinary medicine calibrated to seasons (Ritucharya) and bodily constitutions (Doshas). And Udaka-vadya is the origin of the world's oldest hydro-percussion instrument, the Jalatarang."
    )

    # ==========================================================
    # SLIDE 10: Domains 6 & 7 - Styling, Strategy & Physical Culture
    # ==========================================================
    s10 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s10, COLOR_LIGHT_BG)
    add_header(s10, "Domains 6 & 7: Styling, Tactical Strategy & Physical Arts")

    # Left Column: Styling & Fashion
    col1 = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    col1.fill.solid()
    col1.fill.fore_color.rgb = COLOR_CARD_BG
    col1.line.color.rgb = COLOR_GOLD
    col1.line.width = Pt(1.5)

    c1_tb = s10.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(5.1), Inches(4.5))
    c1_tf = c1_tb.text_frame
    c1_tf.word_wrap = True
    p = c1_tf.paragraphs[0]
    p.text = "Lifestyle, Grooming & Fashion"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = COLOR_GOLD

    fashion_points = [
        ("Sugandha-yukti (गंधयुक्तिः)", "Science of perfumery, natural distillation of essential oils, blending incenses (attar), and scent layering."),
        ("Vastra-gopana (वस्त्रगोपनम्)", "Textile styling, camouflage dressing, elegant pleating and draping of unstitched silks (dhotis/saris)."),
        ("Bhūṣaṇa-yojana & Keśa-mārjana", "Orchestrating jewelry pieces with outfits, intricate hair styling, and personal grooming hygiene.")
    ]
    for h, b in fashion_points:
        ph = c1_tf.add_paragraph()
        ph.text = "\n" + h
        ph.font.size = Pt(12)
        ph.font.bold = True
        ph.font.color.rgb = COLOR_PRIMARY
        pb = c1_tf.add_paragraph()
        pb.text = b
        pb.font.size = Pt(11)
        pb.font.color.rgb = COLOR_TEXT_DARK

    # Right Column: Strategy, Mind Sports & Athletics
    col2 = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    col2.fill.solid()
    col2.fill.fore_color.rgb = COLOR_CARD_BG
    col2.line.color.rgb = COLOR_PRIMARY
    col2.line.width = Pt(1.5)

    c2_tb = s10.shapes.add_textbox(Inches(7.05), Inches(2.05), Inches(5.2), Inches(4.5))
    c2_tf = c2_tb.text_frame
    c2_tf.word_wrap = True
    p2 = c2_tf.paragraphs[0]
    p2.text = "Strategy, Mind Sports & Athletics"
    p2.font.size = Pt(17)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_PRIMARY

    sports_points = [
        ("Dyūta-viśeṣa & Caturaṅga", "Mastery of dice games and Chaturanga (ancestor of modern chess) — teaching war strategy, risk management & probability."),
        ("Vyāyāmikī & Malla-yuddha", "Gymnastics, calisthenics, grappling, wrestling, and martial arts for physical stamina, balance and battlefield reflex."),
        ("Bāla-krīḍanaka & Vaitālikī", "Child pedagogy through game design, storytelling, and panegyric poetry to inspire civic valor.")
    ]
    for h, b in sports_points:
        ph = c2_tf.add_paragraph()
        ph.text = "\n" + h
        ph.font.size = Pt(12)
        ph.font.bold = True
        ph.font.color.rgb = COLOR_ACCENT_TEAL
        pb = c2_tf.add_paragraph()
        pb.text = b
        pb.font.size = Pt(11)
        pb.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s10,
        "TIMING: 14:00 - 15:30 (1.5 mins)\n"
        "LIFESTYLE & RESILIENCE: Note that ancient Indians placed immense value on sensory refinement (Sugandha-yukti) and personal grooming, balanced equally with physical grit.\n"
        "CHESS & STRATEGY: Mention Chaturanga—invented in India with the 4 military divisions (infantry, cavalry, elephants, chariots). Playing tactical games wasn't mere idle time; it was training in probabilistic reasoning and mental resilience."
    )

    # ==========================================================
    # SLIDE 11: The Polymath Archetype - Ancient vs Modern
    # ==========================================================
    s11 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s11, COLOR_LIGHT_BG)
    add_header(s11, "The Polymath Paradigm: Ancient vs. Modern Education")

    # Comparison Table / Dual Cards
    comp1 = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.9), Inches(5.6), Inches(4.8))
    comp1.fill.solid()
    comp1.fill.fore_color.rgb = COLOR_CARD_BG
    comp1.line.color.rgb = RGBColor(0xCC, 0x55, 0x55)
    comp1.line.width = Pt(1.5)

    c1_tb = s11.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    c1_tf = c1_tb.text_frame
    c1_tf.word_wrap = True
    p1 = c1_tf.paragraphs[0]
    p1.text = "Modern Industrial Education"
    p1.font.size = Pt(18)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(0xAA, 0x22, 0x22)

    mod_points = [
        "Hyper-Specialization: Isolates sciences, humanities, and arts into rigid disconnected silos.",
        "Abstract & Exam-Driven: Heavy memorization of theory with minimal tactile, physical, or creative craft engagement.",
        "Sensory & Aesthetic Neglect: Neglects acoustic refinement, emotional self-regulation, and bodily grace.",
        "Vulnerability to Disruption: Narrow technical skillsets are rapidly automated or obsoleted by AI."
    ]
    for pt in mod_points:
        p = c1_tf.add_paragraph()
        p.text = "\n• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT_DARK

    comp2 = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.9), Inches(5.7), Inches(4.8))
    comp2.fill.solid()
    comp2.fill.fore_color.rgb = COLOR_GOLD_LIGHT
    comp2.line.color.rgb = COLOR_ACCENT_TEAL
    comp2.line.width = Pt(1.5)

    c2_tb = s11.shapes.add_textbox(Inches(7.1), Inches(2.1), Inches(5.1), Inches(4.4))
    c2_tf = c2_tb.text_frame
    c2_tf.word_wrap = True
    p2 = c2_tf.paragraphs[0]
    p2.text = "The 64 Kalā Polymath System"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_ACCENT_TEAL

    poly_points = [
        "Integrated Whole-Brain Genius: Fuses analytical mechanics with intuitive aesthetics and ethical purpose.",
        "Embodied Learning (Kriyā-Pradhāna): Hands-on carpentry, cooking, chemistry, and theater along with philosophy.",
        "Sensory & Emotional Fluency: High emotional quotient (EQ) through mastery of Rasa, music, and social dynamics.",
        "Enduring Adaptability: Cross-pollinates insights across engineering, design, and rhetoric—immune to obsolescence."
    ]
    for pt in poly_points:
        p = c2_tf.add_paragraph()
        p.text = "\n• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s11,
        "TIMING: 15:30 - 17:00 (1.5 mins)\n"
        "THE CRITICAL COMPARISON: Contrast our 19th-century Prussian factory model of education with the 64 Kalas model.\n"
        "TALKING POINTS: In our rush to build functional workers, we created people who might know quantum mechanics or Python programming, but cannot cook a wholesome meal, appreciate classical rhythm, recognize a tree disease, or compose a thoughtful letter. The 64 Kalas produced Renaissance minds centuries before Leonardo da Vinci."
    )

    # ==========================================================
    # SLIDE 12: 21st Century Relevance - NEP, STEAM & AI Era
    # ==========================================================
    s12 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s12, COLOR_LIGHT_BG)
    add_header(s12, "Relevance in the Age of AI, STEAM & NEP 2020")

    future_pillars = [
        ("The 'A' in STEAM Education", "From STEM to STEAM", "Modern pedagogy realizes that Science, Tech, Engineering, and Math (STEM) without Arts produce soulless innovation. Steve Jobs famously credited his calligraphy class for the Mac's typography. The 64 Kalas were the world's first formal STEAM framework.", COLOR_PRIMARY),
        ("AI-Proof Human Capabilities", "What Algorithms Cannot Replicate", "As Generative AI commoditizes rote code and basic drafting, distinctively human traits will dominate: nuanced sensory taste (Rasa), physical artisanal craft, social emotional charisma, and creative lateral leaps.", COLOR_GOLD),
        ("National Education Policy (NEP)", "Experiential & Vocational Revival", "NEP 2020 actively dismantles rigid streams between arts and sciences, mandating vocational training (Lokavidya), experiential learning, and traditional Indian knowledge systems (IKS) in primary and higher education.", COLOR_ACCENT_TEAL)
    ]

    for idx, (title, sub, body, acc) in enumerate(future_pillars):
        c = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 3.98), Inches(1.9), Inches(3.8), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_CARD_BG
        c.line.color.rgb = COLOR_CARD_BORDER
        c.line.width = Pt(1)

        st = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8 + idx * 3.98), Inches(1.9), Inches(3.8), Inches(0.12))
        st.fill.solid()
        st.fill.fore_color.rgb = acc
        st.line.fill.background()

        tb = s12.shapes.add_textbox(Inches(1.0 + idx * 3.98), Inches(2.2), Inches(3.4), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = acc

        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.text = "\n" + body
        p3.font.size = Pt(11.5)
        p3.font.color.rgb = COLOR_TEXT_DARK

    add_notes(s12,
        "TIMING: 17:00 - 18:30 (1.5 mins)\n"
        "FORWARD-LOOKING PUNCH: Connect the past to our immediate future. Why does this matter to the audience right now?\n"
        "TALKING POINTS: Mention Steve Jobs and the intersection of technology and liberal arts. Discuss Generative AI—AI can write code or generate pixels, but human taste, physical embodiment, emotional resonance, and multidimensional curiosity are our ultimate competitive moats. Mention India's NEP 2020 which is bringing vocational arts back into mainstream schools."
    )

    # ==========================================================
    # SLIDE 13: Summary, Actionable Takeaways & Q&A (Dark Theme)
    # ==========================================================
    s13 = prs.slides.add_slide(blank_slide_layout)
    set_bg(s13, COLOR_DARK_BG)

    # Decorative Border Frame
    border = s13.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.5), Inches(12.333), Inches(6.5))
    border.fill.background()
    border.line.color.rgb = COLOR_GOLD
    border.line.width = Pt(1.5)

    add_header(s13, "Key Takeaways: Cultivating Your Own Kalās", is_dark=True)

    takeaway_box = s13.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(4.8))
    tf_t = takeaway_box.text_frame
    tf_t.word_wrap = True

    takeaways = [
        ("1. Transcend the Single Specialty", "Embrace cross-disciplinary curiosity. A software architect who learns classical music or carpentry develops superior pattern recognition."),
        ("2. Balance the Cognitive with the Tactile", "Engage your hands: cultivate gardening, cooking, sketching, or instrumental play to stimulate cognitive neuroplasticity."),
        ("3. Develop 'Rasa' (Aesthetic Taste)", "High technical competence paired with refined aesthetic sensibility creates magnetic, world-class products and ideas."),
        ("4. Reclaim Playfulness & Strategy", "Integrate mental puzzles, mind sports, and reflective physical movement into daily life for sustainable creative energy.")
    ]

    p_init = tf_t.paragraphs[0]
    p_init.text = "How to Apply the 64 Kalā Philosophy Today:"
    p_init.font.size = Pt(16)
    p_init.font.bold = True
    p_init.font.color.rgb = COLOR_GOLD

    for title, desc in takeaways:
        pt = tf_t.add_paragraph()
        pt.text = "\n" + title + " — " + desc
        pt.font.size = Pt(13)
        pt.font.color.rgb = COLOR_TEXT_LIGHT

    # Bottom Callout / Q&A Prompt
    p_qa = tf_t.add_paragraph()
    p_qa.text = "\n“Knowledge without aesthetic grace is dry; art without technical discipline is fragile.”"
    p_qa.font.size = Pt(14)
    p_qa.font.italic = True
    p_qa.alignment = PP_ALIGN.CENTER
    p_qa.font.color.rgb = COLOR_GOLD

    p_end = tf_t.add_paragraph()
    p_end.text = "Thank You! Questions & Discussion Welcomed."
    p_end.font.size = Pt(18)
    p_end.font.bold = True
    p_end.alignment = PP_ALIGN.CENTER
    p_end.font.color.rgb = COLOR_TEXT_LIGHT

    add_notes(s13,
        "TIMING: 18:30 - 20:00 (1.5 mins)\n"
        "CLOSING & CALL TO ACTION: Summarize in 30 seconds. Leave the audience with a personal challenge: Pick one new tactile or aesthetic Kala this quarter—learn an instrument, start a kitchen garden, study calligraphy, or learn chess.\n"
        "OPEN FOR Q&A: Invite questions on historical origins, specific texts (Kamasutra vs Bhagavata Purana), or how schools can implement these arts today."
    )

    output_path = r"c:\Projects\Dress Collection\Sixty_Four_Kalas_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at {output_path}")

if __name__ == "__main__":
    create_deck()
