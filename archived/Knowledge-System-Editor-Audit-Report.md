# KNOWLEDGE SYSTEM EDITOR AUDIT REPORT

**Date:** September 21, 2026
**System:** Personal Knowledge System (Roam Export)
**Audit Purpose:** Determine internal consistency, semantic clarity, human maintainability, AI navigability, cross-domain retrieval capability, and Essay support readiness

---

## EXECUTIVE SUMMARY

### Overall Assessment

The knowledge system demonstrates **remarkable architectural sophistication** with clear organizing principles, well-defined Pattern boundaries, and coherent Structure logic. The system is fundamentally sound and operationally ready for AI assistance.

However, **several critical inconsistencies** threaten reliable AI classification and could cause duplicate canonical objects or failed cross-domain retrieval. These issues are concentrated in three areas:

1. **Namespace collision and duplication** (CRITICAL)
2. **Metadata field inconsistency** (STRUCTURAL)
3. **Cross-domain tagging underspecification** (RETRIEVAL)

The system's strengths significantly outweigh its weaknesses, but the weaknesses identified are consequential enough to merit systematic correction before scaling content production.

### Most Consequential Findings

#### CRITICAL

**1. Question/ and Topic/ namespace design (RESOLVED)**

**FINAL DESIGN DECISION:**
- **Question/** = Naming convention for both Perkins (Cases of Conscience) and Aquinas (Summa) patterns
  - Both patterns examine questions, differing only in domain (practical vs theological)
  - Examples: `Question/Should I Correct My Child in Front of Guests?` (Perkins), `Question/Whether the Canon Is Closed?` (Aquinas)
  - **Canonical pages**: Yes, these are Lab posts

- **Topic/** = Pure classificatory namespace (areas of inquiry where subjects touch specific concerns)
  - Used to tag Questions, Adler Concept outline items, and other entries for retrieval
  - Examples: `Topic/Anger`, `Topic/Distributive Justice`, `Topic/Health`
  - **No authored content** - pages populate automatically through linked references
  - Functions as aggregation infrastructure for Essay discovery
  - Multiple topics can apply to one entry

- **Subject/** = Top-level knowledge domains (Encyclopedia only)
  - Examples: `Subject/Theology`, `Subject/Philosophy`
  - Only Encyclopedia creates canonical Subject/ pages
  - Bibliography shelves and Summa domains remain structure-internal headings

**Impact:** Clean semantic architecture with three tiers: Subject/ (general domains), Topic/ (areas of focus), Question/ (examined propositions). No collision, clear AI classification rules.

**Status:** RESOLVED through architectural clarification.

---

**2. Word/ and Term/ namespace separation (RESOLVED)**

**FINAL DESIGN DECISION:**
- **Word/** = Foreign loanwords (Buckley/Lexicon Pattern)
  - Examples: `Word/Schwerpunkt`, `Word/Zeitgeist`, `Word/Bildung`
  - Canonical pages for foreign words preserved in original language
  - Tagged with `Language/` (German, Latin, Greek, etc.)

- **Term/** = English concept handles (Safire/Glossary Pattern)
  - Examples: `Term/Chronological Snobbery`, `Term/Tactical Flexibility`
  - Canonical pages for coined English phrases that name specific distinctions

**Impact:** Clean semantic separation. Foreign vs English is a natural boundary. No collision possible.

**Status:** RESOLVED through namespace split and template implementation.

---

**3. Book/ and Source/ boundary clarification (RESOLVED)**

**FINAL DESIGN DECISION:**
- **Book/** = 66 canonical biblical books ONLY
  - Examples: `Book/Genesis`, `Book/Hebrews`, `Book/Revelation`
  - Created by Jerome Pattern for biblical book overviews
  - Exactly 66 canonical pages (closed set)

- **Source/** = All other sources
  - Non-biblical books, essays, articles, podcasts, videos, etc.
  - Format: `Source/{Title} - {Author}` or `Source/{Title}` if no clear author
  - Examples: `Source/Mere Christianity - C.S. Lewis`, `Source/The Screwtape Letters - C.S. Lewis`
  - Created by Photius Pattern for reading notes
  - Open set (grows as sources are read)

**Key clarifications:**
- Commentaries on biblical books use `Source/`, NOT `Book/`
- Personal Bible reading logs link to existing `Book/` pages, don't create new `Source/` pages
- Study Bibles, Bible translations, and biblical reference works use `Source/`

**Impact:** Crystal clear boundary. AI can easily distinguish: 66 biblical books → Book/, everything else → Source/.

**Status:** RESOLVED through boundary clarification and documentation.

---

#### STRUCTURAL

**4. Pattern template metadata field order is inconsistent (STRUCTURAL)**
The universal fields appear in at least three different orders across templates:

- Order A: Date Created, Date Updated, Type, Pattern, Tags, Notes
- Order B: Date Created, Date Updated, Type, Pattern, Tags (Notes under Tags as subheading)
- Order C: Date Created, Date Updated, Tags, Type, Pattern, Notes

**Impact:** Degrades human scanning and may confuse AI parsers expecting consistent field position.

**Recommendation:** Standardize metadata order across all Lab templates (see Canonical Metadata Schema below).

---

**5. Notes terminology varies (STRUCTURAL)**
Most templates use "Notes:" as the label for Pattern-specific instructions. Three exceptions:
- Chreia: "Notes" (no colon)
- Perkins: Notes shown but actually uses expanded subsections (Naming, Anchor, Boundary, etc.)
- Aquinas: "Notes:" is used consistently

**Recommendation:** Standardize "Notes:" with colon across all templates. Subsection labels within Notes (Naming, Anchor, Boundary, etc.) should remain flexible per Pattern.

---

#### RETRIEVAL

**6. Support-heavy Patterns lack required cross-domain tags (RETRIEVAL)**
Several support-heavy Patterns (Chreia, Bede/Florilegium, Erasmus/Chrestomathy, Gerald/Topographia) provide optional or recommended cross-domain tags but do not enforce them strongly enough.

**Impact:** A Chreia entry with profound theological significance could remain trapped in its chronological year without `Concept/` or `Theme/` tags, making it invisible to Essay discovery.

**Recommendation:** See Cross-Domain Retrieval Matrix below for Pattern-by-Pattern requirements.

---

**7. Structure vs Subject namespace ambiguity (CONSISTENCY)**
- Bibliography uses `Subject/{Section}` for shelf classification
- Encyclopedia uses `Subject/{Topic}` for syllabus entries
- Summa uses `Subject/` as domain headings (Systematic Theology, Biblical Theology, etc.)

These may or may not intend to create the same canonical pages. Unclear whether `Subject/Theology` in Encyclopedia and `Subject/Systematic Theology` in Summa should coexist or merge.

**Recommendation:** Distinguish classification from canonical pages. Bibliography shelves and Summa domains should be structure-internal headings, not namespaced tags. Only Encyclopedia syllabi should create canonical `Subject/` pages.

---

## SYSTEM MAP

```
STREAM (rapid capture)
  ↓ Tags::

LAB (bounded intellectual objects via Patterns)
  ├── Annals & Histories Structure
  │   ├── Tacitus Pattern → Event/{Year}: {What} → Time/, Person/, Place/, Event/, Artifact/, Source/, Theme/, Concept/
  │   ├── Plutarch Pattern → Person/{Name} (canonical) → Time/, Place/, Concept/, Source/
  │   ├── Chreia Pattern → {Year}: "{Words}" → Time/, Person/, Place/, Source/, Event/, Concept/
  │   └── Ussher Pattern → Dating/{Event} → Time/, Event/, Person/, Source/
  │
  ├── Bibliography & Reading Log Structure
  │   └── Photius Pattern → Source/{Title} - {Author} (canonical) → Person/, Subject/, Concept/, Topic/, Theme/
  │
  ├── Cases of Conscience Structure
  │   └── Perkins Pattern → Topic/{Question} → Topic/, Concept/, Rule/, Person/
  │
  ├── Chrestomathy Structure
  │   └── Erasmus Pattern → {Key Phrase} → Craft/, Function/, Occasion/, Source/, Person/, Theme/, Concept/
  │
  ├── Commentary Structure
  │   ├── Calvin Pattern → {Book Chapter:Verses} → Source/, Topic/, Theme/, Concept/
  │   └── Jerome Pattern → Book/{Name} (canonical biblical) → Person/, Concept/, Theme/, Topic/
  │
  ├── Confessions Structure
  │   ├── Newman Pattern → Conviction/{I [present] ...} → Time/, Topic/, Concept/, Source/
  │   ├── Augustine Pattern → Confession/{I [past] ...} → Time/, Concept/, Theme/, Person/
  │   └── Pascal Pattern → Reflection/{Insight} → Time/, Concept/, Theme/, Person/
  │
  ├── Criticism Structure
  │   ├── Lewis Pattern → Review/{Title} → Source/, Person/, Concept/, Theme/, Topic/
  │   ├── Isocrates Pattern → Appraisal/{Subject} → Person/, Source/, Topic/, Concept/, Theme/
  │   └── Quintilian Pattern → Judgment/{Question} → Person/, Event/, Time/, Topic/, Concept/, Theme/
  │
  ├── Emblem Book Structure
  │   └── Alciato Pattern → Emblem/{Name} (canonical) → Theme/, Concept/, Person/, Source/, Artifact/, Place/, Tradition/, Term/
  │
  ├── Encyclopedia Structure
  │   └── Diderot Pattern → {Topic} → Subject/, Concept/, Person/, Source/
  │
  ├── Florilegium Structure
  │   └── Bede Pattern → Florilegium/{Key Phrase} → Theme/ (required), Source/, Person/, Concept/
  │
  ├── Glossary of Concept Handles Structure
  │   └── Safire Pattern → Term/{Coined Phrase} (canonical) → Person/, Concept/, Source/
  │
  ├── History of Redemption Structure
  │   └── Irenaeus Pattern → Thread/{Name} → Concept/, Theme/, Person/, Place/, Source/
  │
  ├── Household Liturgy Structure
  │   └── Cranmer Pattern → {Month Day} (Year N): {Theme} → Day/, Cycle/, Season/, Theme/, Person/
  │
  ├── Lexicon Structure
  │   └── Buckley Pattern → Term/{Headword} (canonical) → Language/, Concept/, Term/
  │
  ├── Pattern Language for Learning Structure
  │   └── Alexander Pattern → Pattern/{Name} (canonical) → Concept/, Theme/
  │
  ├── Rule of Life Structure
  │   ├── Franklin Pattern → Virtue/{Name} (canonical) → Concept/, Person/, Role/
  │   ├── Edwards Pattern → Resolve/{Imperative} → Virtue/ (required), Concept/, Topic/, Person/, Role/ (required)
  │   ├── Benedict Pattern → Discipline/{Imperative} → Concept/, Topic/, Role/ (required)
  │   └── Luther Pattern → Responsibility/{Duty} → Role/ (required), Concept/, Topic/, Person/, Source/
  │
  ├── Silva Rerum Structure
  │   └── Eco List Pattern → List/{Name} → Theme/, Concept/, Topic/
  │
  ├── Summa Structure
  │   └── Aquinas Pattern → Topic/{Question} → Topic/, Concept/, Theme/, Claim/
  │
  ├── Syntopicon Structure
  │   └── Adler Pattern → Concept/{Name} (canonical, top-level) → accumulated backward from all patterns
  │
  └── Topographia Itinerum Structure
      └── Gerald Pattern → Place/{Name} (canonical) → Place/, Time/, Country/, Region/, City/, Person/, Event/, Concept/, Theme/, Source/, Kind/

GARDEN (domain-organized synthesis)
  ├── Native Structures (each gathers its feeding Patterns chronologically, conceptually, thematically, etc.)
  └── Cross-Domain Structures (synthesis across Gardens)
      ├── Syntopicon (Concept/)
      ├── Commentary (Book/ + Source/)
      ├── Person/ pages (accumulated via Plutarch, Chreia, Photius, etc.)
      ├── Time/ chronology (Annals, Chreia, Ussher)
      ├── Place/ (Tacitus, Gerald)
      ├── Source/ (Photius canonical, referenced everywhere)
      └── Theme/ (broad cross-cutting)

ESSAYS (reader-facing compositions)
  ↑ draws on Lab backbone + supporting material surfaced via cross-domain tags
```

---

## NAMESPACE DICTIONARY

### Canonical Namespaces (create persistent pages, one per real-world object)

| Namespace | Meaning | Object Type | Create/Reuse Rule | Naming Convention | Conflicts | Recommendation |
|-----------|---------|-------------|-------------------|-------------------|-----------|----------------|
| **Person/** | Individual human being | Canonical person page | Reuse always; one page per person regardless of pattern | `Person/C.S. Lewis` | None | **RETAIN**. Plutarch Notes correctly state "never create a second page for a person." All patterns referencing people should tag the same canonical `Person/` page. |
| **Place/** | Geographic location or site | Canonical place page | Reuse when same physical location; create new when distinct site even if same city | `Place/Palace of Fine Arts` | Potential collision: `Place/Rome` (city) vs `Place/Roman Forum` (site within Rome). Needs containment rule. | **RETAIN** with clarification: use finest-grained Place that merits its own page. Gerald creates place-specific pages; Tacitus/Chreia may reference broader `Place/` tags. Both acceptable. |
| **Source/** | Any non-biblical source (books, essays, articles, podcasts, videos, etc.) | Canonical source page | One page per distinct work. Author in title when applicable: `Source/{Title} - {Author}` | `Source/Mere Christianity - C.S. Lewis` | None. Clean boundary with Book/. | **RETAIN** as primary namespace for all non-biblical sources. Photius canonical. Commentaries on biblical books use Source/, not Book/. |
| **Book/** | Biblical book (66 canonical books ONLY) | Canonical biblical book page | Exactly 66 pages, one per biblical book; never create for non-biblical sources | `Book/Hebrews` | None. Clean boundary with Source/. | **RESTRICT** to 66 biblical books only (closed set). Jerome Pattern creates these. All other books, commentaries, and biblical reference works use Source/. |
| **Word/** | Foreign loanword preserved in original language | Canonical foreign word page | One page per foreign word; used by Buckley (Lexicon) Pattern | `Word/Schwerpunkt`, `Word/Zeitgeist` | None. Clean separation from Term/ (English handles). | **RETAIN**. Buckley creates Word/ pages for foreign loanwords. Tag with Language/ (German, Latin, etc.). Cross-reference to Term/ if English concept handle exists for same idea. |
| **Concept/** | Top-level idea in Syntopicon | Canonical concept page, closed vocabulary | Adler: create stub when worth tracking; populate backward from linked references. Deliberately closed list. | `Concept/Justice` | May overlap with `Virtue/{Name}` (Franklin) when same word. Templates acknowledge this is acceptable: "one is the argument, the other is the commitment." Also potential collision with coined `Term/` when concept has a handle. | **RETAIN**. Collision with `Virtue/` is intentional and acceptable. Collision with `Term/` should be managed by cross-reference, not prevention. |
| **Virtue/** | Personal virtue in Rule of Life | Canonical virtue commitment page, deliberately small closed list | Franklin: create stub when virtue worth committing to; accumulate backward from Resolve/, Discipline/, Responsibility/ | `Virtue/Diligence` | Intentional overlap with `Concept/` when same word exists in Syntopicon. This is by design. | **RETAIN**. |
| **Term/** | English concept handle (coined phrase naming a specific distinction) | Canonical term page | One page per coined English phrase; used by Safire (Glossary) Pattern only | `Term/Chronological Snobbery`, `Term/Tactical Flexibility` | None. Clean separation from Word/ (foreign loanwords). | **RETAIN**. Safire creates Term/ pages for English concept handles. May cross-reference to Concept/ if the term maps to a Syntopicon entry, or to Word/ if a foreign equivalent exists. |
| **Emblem/** | Fixed cultural symbol with historically established meaning | Canonical emblem page | One per historically attested emblem; normalize across instances | `Emblem/Festina Lente` | Boundary with `Image/` (Warburg, archived): Alciato = fixed meaning, Warburg = constructed meaning through comparison. Clean separation. | **RETAIN**. Boundary with archived Warburg is clear. |
| **Pattern/** | Alexander Pattern entry | Canonical pattern in pattern language | One per pattern | `Pattern/Family Worship` | Collides with metadata field `Pattern::` (which records which template was used). Namespace creates a canonical page; metadata field is a pointer. Functionally distinct but lexically identical. | **RETAIN** but note collision is harmless: namespace is a canonical object, metadata field is an attribute. AI can distinguish by context (tag vs field). |
| **Thread/** | Redemptive-historical thread (Irenaeus) | Canonical thread page | Create when at least two meaningful fragments form a trajectory | `Thread/The Son as Representative of the Father` | None | **RETAIN**. |
| **List/** | Eco List entry (Silva Rerum) | Canonical list page | Create when something worth collecting has no other pattern | `List/Apps for Spiritual Disciplines` | None | **RETAIN**. |
| **Claim/** | Thesis extracted from Summa "I Answer that" section | Canonical claim page | One per declarative thesis | `Claim/The Canon Closed with the Apostolic Witness` | None | **RETAIN**. Useful for synthesis and retrieval of settled theological positions. |
| **Question/** | Examined question (both practical and theological) | Canonical question page | One per examined question; used by both Perkins (practical/pastoral) and Aquinas (theological/doctrinal) patterns | Perkins: `Question/Should I Correct My Child in Front of Guests?`; Aquinas: `Question/Whether the Canon Is Closed?` | None. Clean semantic unity: both examine questions, differing only in domain and method. | **RETAIN**. Excellent namespace choice that unifies across practical and theological domains while preserving Pattern distinction for method. |

---

### Classificatory Namespaces (tag existing objects, do not create new canonical pages)

| Namespace | Meaning | Function | Canonical or Classificatory | Recommendation |
|-----------|---------|----------|---------------------------|----------------|
| **Time/** | Year or era | Chronological placement and retrieval | Classificatory (indexes into Annals timeline or era heading) | **RETAIN**. Tacitus, Chreia, Ussher, Plutarch, Newman, Augustine, Pascal, Cranmer, Gerald all use. Critical retrieval axis. |
| **Topic/** | Areas of inquiry where subjects touch specific concerns | Pure aggregation infrastructure | Classificatory (creates aggregation pages with NO authored content; auto-populated through linked references) | **RETAIN**. Used by Perkins Questions, Adler Concept outlines, and other patterns for cross-domain retrieval. Examples: `Topic/Anger`, `Topic/Distributive Justice`, `Topic/Health`. Multiple topics can apply to one entry. Critical for Essay discovery. Pages populate automatically—zero maintenance cost. |
| **Event/** | Historical event | Categorical marker | Classificatory (not canonical page—Tacitus creates the page, Event/ tags it) | **CLARIFY**: `Event/` should not create a page; Tacitus entry itself IS the canonical event. Tag is for classification and retrieval only. |
| **Artifact/** | Object (not a place) | Categorical marker | Classificatory | **RETAIN**. Used by Tacitus and Alciato. |
| **Theme/** | Broad thematic connection | Thematic retrieval across domains | Classificatory | **RETAIN**. Used by Photius, Bede (required), Cranmer, Aquinas, Irenaeus, Isocrates, Quintilian, Lewis, Augustine, Pascal, Gerald, Eco List. One of the most important cross-domain axes. |
| **Concept/** | (when used as tag, not Adler canonical) | Concept linkage | Both canonical (Adler) and classificatory (everyone else) | **RETAIN** dual function but clarify: Adler creates canonical Concept/ pages; all other patterns tag into those pages. |
| **Craft/** | Rhetorical device (Erasmus) | Analytical tag for Chrestomathy | Classificatory | **RETAIN**. Notes correctly state "descriptive, not the endpoint." |
| **Function/** | Rhetorical function (Erasmus) | Analytical tag for Chrestomathy | Classificatory | **RETAIN**. |
| **Occasion/** | Social setting (Erasmus) | Analytical tag for Chrestomathy | Classificatory | **RETAIN**. |
| **Day/** | Calendar day (Cranmer) | Liturgical date indexing | Classificatory | **RETAIN**. Format: `Day/January 1` (no year). |
| **Cycle/** | Liturgical year rotation (Cranmer) | Year rotation marker | Classificatory | **RETAIN**. Format: `Cycle/Year 1`. |
| **Season/** | Liturgical season (Cranmer) | Seasonal marker | Classificatory | **RETAIN**. |
| **Language/** | Language name (Buckley) | Language classification | Classificatory | **RETAIN**. Examples: `Language/Latin`, `Language/German`. |
| **Kind/** | Type of place/object (Gerald) | Type classification | Classificatory | **RETAIN**. Examples: `Kind/Nature`, `Kind/Curiosity`, `Kind/Cultural Artifact`. |
| **Country/, Region/, City/** | Geographic containment (Gerald) | Geographic classification | Classificatory | **RETAIN**. Useful for geographic retrieval. |
| **Tradition/** | Cultural/religious tradition (Alciato) | Tradition marker | Classificatory | **RETAIN**. |
| **Role/** | Life role/office (Rule of Life patterns) | Role indexing | Classificatory (gathers Virtues, Resolutions, Disciplines, Responsibilities under role headings) | **RETAIN**. Required for Edwards, Benedict, Luther. Central organizing axis for Rule of Life. |

---

### Remaining Namespace Ambiguities (Resolved or Clarified)

| Namespace                                 | Status                                                                                                                                    | Resolution                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Question/ + Topic/**                    | **RESOLVED**. Clean architectural separation achieved.                                                                                    | **Question/** = Naming for both Perkins and Aquinas patterns (examined questions, canonical pages). **Topic/** = Pure classificatory namespace for areas of inquiry (aggregation only, no authored content). See Namespace Dictionary above for full details. |                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Subject/**                              | **CLARIFIED**. Ownership determined.                                                                                                      | **Encyclopedia ONLY** creates canonical `Subject/` pages for knowledge domain syllabi. Bibliography shelves and Summa domain headings remain structure-internal, NOT namespaced. Clear rule prevents collision.                                               |                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Dating/**                               | Single-purpose namespace (Ussher only). May be unnecessary.                                                                               | **Ussher**: `Dating/{Event}` for chronological problem pages.                                                                                                                                                                                                 | **RETAIN** but consider whether `Dating/` adds value over simply titling the page `{Event} - Dating Problem` without namespace. Single-pattern namespaces risk creating unnecessary proliferation. **ACCEPTABLE AS-IS** if useful for retrieval filtering.                                                                                                                                         |
| **Conviction/, Confession/, Reflection/** | Three namespaces for three closely related Confessions patterns. Are these genuinely distinct canonical objects or merely Pattern labels? | **Newman**: `Conviction/{I [present]...}`<br>**Augustine**: `Confession/{I [past]...}`<br>**Pascal**: `Reflection/{Insight}`                                                                                                                                  | **EVALUATE**: Do these need separate namespaces or should they all use a common namespace? Current naming creates three separate retrieval axes for what may be a single intellectual domain (personal theological development). **TENTATIVELY RETAIN** since the patterns serve distinct rhetorical purposes (conviction change vs shortfall vs fragmentary insight). But this merits discussion. |
| **Review/, Appraisal/, Judgment/**        | Three namespaces for three Criticism patterns.                                                                                            | **Lewis**: `Review/{Title}`<br>**Isocrates**: `Appraisal/{Subject}`<br>**Quintilian**: `Judgment/{Question}`                                                                                                                                                  | Similar concern as Confessions trio. Do these need separate namespaces or is the Pattern field sufficient differentiation? **TENTATIVELY RETAIN** since objects are semantically distinct (work vs subject vs question). But creates namespace proliferation.                                                                                                                                      |
| **Florilegium/**                          | Single entry in current corpus uses this as a title prefix. Unclear if it's a namespace or just a naming convention.                      | **Bede Notes**: "Naming: `Florilegium/{Key Phrase}`"                                                                                                                                                                                                          | **REMOVE NAMESPACE**. Florilegium is the Structure name, not a semantic category. Entries should be bare `{Key Phrase}` without prefix. Alternatively, if Florilegium entries need disambiguation from Chrestomathy (both preserve quotations), clarify boundary more explicitly. **PREFERENCE: REMOVE.** Pattern and structure are sufficient; namespace is redundant.                            |

---

### Obsolete or Underused Namespaces

| Namespace | Status | Recommendation |
|-----------|--------|----------------|
| **Image/** | Warburg Pattern archived. No current use. | **ARCHIVE**. Remove from active namespace list unless Warburg is revived. |
| **Custom/** | Appears in archived Herodotus Pattern. | **ARCHIVE**. |
| **Quotation/** | Appears in archived Chreia Expansion template. Overlaps with Chreia Pattern's naming convention. | **ARCHIVE**. Chreia already handles quotations. |

---

## CANONICAL METADATA SCHEMA

### Recommended Universal Metadata Block

All Lab templates should use this exact order and format:

```markdown
- # Metadata
    - Date Created::
    - Date Updated::
    - Type:: [[Lab Post]]
    - Pattern:: [[Pattern Name]]
    - Tags::
    - Notes:
        - Naming:
        - Anchor:
        - Boundary:
        - Tags:
        - Garden:
        - Add to the Lab index page.
        - [Additional Pattern-specific Notes sections as needed]
```

### Universal Fields (required for all Lab Posts)

| Field | Purpose | Format | Notes |
|-------|---------|--------|-------|
| **Date Created::** | Creation timestamp | Date | Should be set once at creation. AI should not update. |
| **Date Updated::** | Last substantive update | Date | AI should update when content changes, not on typo fixes. |
| **Type::** | Post type | `[[Lab Post]]`, `[[Garden Post]]`, `[[Stream Post]]`, `[[Essay Post]]` | Distinguishes system levels. Always uses double-bracket link format. |
| **Pattern::** | Pattern template used | `[[Pattern Name]]` | Links to the Pattern. Useful for filtering and understanding template evolution. |
| **Tags::** | Free-form tags | Comma-separated | Cross-domain and classificatory tags. **Position after Pattern to separate universal metadata from specific tagging.** |
| **Notes:** | Pattern-specific instructions and conventions | Prose + subsections | **Always ends with colon.** Contains naming, anchor, boundary, tagging rules, Garden placement, etc. |

### Optional Pattern-Specific Fields

Some patterns add domain-specific metadata. These should appear **within the Notes section** as labeled subsections rather than as separate top-level metadata fields.

Examples:
- Cranmer: `Person::` (required Person tag for the week's figure)
- Bibliography shelving: field could be moved into Notes rather than metadata if desired

**Recommendation:** Minimize top-level metadata fields. Only universal fields should be at the top level. Pattern-specific requirements should be documented in Notes and enforced through tagging conventions rather than creating new metadata fields.

### Stream and Garden Metadata

**Stream Post:**
```markdown
- # Metadata
    - Tags::
    - Type:: [[Stream Post]]
```

**Garden Post:**
```markdown
- # Metadata
    - Date Created::
    - Date Updated::
    - Subtitle::
    - Type:: [[Garden Post]]
```

**Essay Post:**
```markdown
- # Metadata
    - Date Created::
    - Date Updated::
    - Tags::
    - Type:: [[Essay Post]]
```

---

## CANONICAL PATTERN NOTES SCHEMA

### Standard Notes Labels (recommended for most Patterns)

Pattern Notes sections should follow this order when applicable:

1. **Naming** - How to title the page (required)
2. **Anchor** - What triggers creating this kind of post (required)
3. **Boundary** - What this pattern is NOT; how to distinguish from neighboring patterns (required when confusion likely)
4. **Admission** - When to create a new entry (optional, used when "readiness" is subtle)
5. **Growth** - How the entry develops over time (optional, for living documents like Adler, Irenaeus)
6. **Tags** - Which cross-domain tags are required, recommended, optional (required)
7. **Canonical Object** - What persistent thing this pattern creates or treats (optional, useful for clarification)
8. **Cross-Domain Behavior** - How this pattern feeds other structures (optional, useful for support-heavy patterns)
9. **Garden** - Where and how to link this entry in the Garden structure (required)
10. **Add to the Lab index page.** - Reminder to index (required)
11. **Essay Role** - Whether this is backbone-heavy, mixed, or support-heavy (optional, recommended for patterns)
12. **Inspiration** - Historical models or precedents (optional, useful for context)
13. **Description** - Explanation of body sections and their purpose (required)
14. **Example** - Sample entry showing the pattern in practice (optional, very useful for onboarding)

### Current Inconsistencies

| Pattern | Issues |
|---------|--------|
| **Chreia** | Uses "Notes" without colon (line 91). Should be "Notes:" |
| **Perkins** | Uses "Notes:" but then has unusual subsection structure (double-hyphen bullets). Functionally fine, but formatting differs from others. |
| **Alexander (Pattern Language)** | Has "Notes:" but content differs significantly from other patterns due to its meta-recursive nature. Acceptable. |
| **All Confessions patterns** | "Notes:" used but labeled subsections vary (Then/Turn/Now for Newman vs Memory/Desire/Confession for Augustine). Acceptable variation given different rhetorical structures. |

**Recommendation:** Standardize "Notes:" with colon. Allow subsection flexibility per Pattern as long as the core categories (Naming, Anchor, Boundary, Tags, Garden) are present where applicable.

---

## PATTERN BOUNDARY MATRIX

### Annals & Histories Patterns

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|---------------|----------------|----------|
| **Tacitus** | Ussher, Chreia | AI might create both Tacitus and Ussher for same event | Tacitus records **what happened**; Ussher argues **when it happened**. If date requires justification → Ussher. If date is straightforward → Tacitus only. | **Boundary is explicit and clean.** No problems. | - |
| **Plutarch** | Tacitus | AI might create separate person page vs linking to Plutarch Life | Plutarch creates **canonical Person/ page** (the tag page IS the Life). Tacitus **references** Person/ but does not own it. | **Boundary is explicit**: "never create a second page for a person." Excellent. | - |
| **Chreia** | Tacitus, Erasmus | Overlap: significant saying at a significant event | Chreia anchors on **the quotation**; Tacitus anchors on **the event**. If the words are the point → Chreia. If the event's outcome is the point → Tacitus. Erasmus (Chrestomathy) anchors on **rhetorical craft**. | **Boundary stated but could be sharper**. Chreia Notes say "occasion exists to explain the saying," which is good. But overlap with Chrestomathy needs more clarity: can the same quotation appear in both? (Answer should be YES, one as historical saying, one as rhetorical exemplar.) | OPTIONAL |
| **Ussher** | Tacitus | AI creates Ussher when Tacitus would suffice | "If the date requires argument, explanation, or comparison → Ussher. If straightforward and uncontested → Tacitus." | **Clean.** | - |

**Recommendations:**
- Clarify Chreia/Chrestomathy overlap explicitly: "The same saying may appear as both Chreia (historical attestation + virtue) and Chrestomathy (rhetorical craft). They are separate entries block-referencing the same source."

---

### Bibliography & Reading

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|---------------|----------------|----------|
| **Photius** | Jerome, Lewis | Book reading note vs biblical book overview vs book review | Photius = **canonical Source/ page** for any book (contents, summary, citations, reading record). Jerome = **biblical Book/ overview** (reserved for 66 biblical books). Lewis = **critical review** (separate evaluation, links back to Source/ but doesn't duplicate contents). | **Boundaries are stated but need reinforcement**. Lewis Notes correctly say "the Source page remains canonical; a Lewis Review is separate." Jerome should clarify that Book/ is reserved for biblical canon only. | STRUCTURAL |

**Recommendations:**
- Jerome Notes should explicitly state: "`Book/` namespace is reserved for the 66 biblical books. Commentaries and theological works about books remain `Source/{Title} - {Author}`."
- Lewis Notes already handle boundary well.

---

### Commentary

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Calvin** | Summa, Irenaeus | Passage study vs doctrinal question vs redemptive-historical thread | Calvin = **passage-level exegesis**. Summa = **doctrinal question worth extended systematic treatment**. Irenaeus = **biblical-theological trajectory across passages**. | **Boundaries stated but not sharp enough**. Calvin Notes say "a doctrinal question worth extended treatment → Summa" but doesn't define "extended." Risk: AI creates Summa when Calvin's "Doctrine" section would suffice. | STRUCTURAL |
| **Jerome** | Photius | Biblical book overview vs non-biblical source | See above: Book/ vs Source/ collision. | **Needs clarification** (see Photius). | STRUCTURAL |

**Recommendations:**
- Calvin Notes should sharpen: "If the doctrinal issue can be handled in a paragraph or two within the passage's context → include in Calvin's 'Doctrine' section. If it requires systematic argument with objections and replies independent of a single passage → Summa."

---

### Confessions

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Newman** | Augustine, Pascal | Belief changed vs life fell short vs fragmentary insight | Newman = **"I used to think X, now I think Y"** (belief change). Augustine = **"I believe X but failed to live it"** (shortfall). Pascal = **fragmentary personal observation that discloses something about human nature**. | **Boundaries are explicit and clean.** Templates state this clearly. | - |
| **Augustine** | Newman | Covered above | Covered above | **Clean.** | - |
| **Pascal** | Newman, Augustine | Fragment vs developed confession/conviction | Pascal allows **intentional incompleteness**. "One sentence or several paragraphs; completeness not required." Newman and Augustine expect fuller structure. | **Clean.** | - |

**No problems in Confessions boundaries.**

---

### Criticism

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Lewis** | Photius, Isocrates | Review a work vs record a work vs appraise a person/movement | Lewis = **critical evaluation of a work**. Photius = **canonical reading record** (contents, summary, citations). Isocrates = **appraisal of a subject** (person, movement, institution). | **Boundaries stated clearly**. Lewis Notes explicitly say "the Source page remains canonical; Review is separate." | - |
| **Isocrates** | Lewis, Plutarch | Appraise a person vs write their Life | Isocrates = **critical evaluation** (praise/blame, merits/faults). Plutarch = **biographical Life** (character, deeds, death, parallel). If primary goal is evaluation → Isocrates. If primary goal is biography → Plutarch. | **Boundary stated but could be sharper**. Isocrates Notes say "balanced historical life whose purpose is biography → Plutarch." But "balanced" is vague. What if the biography is unbalanced but still primarily biographical? | OPTIONAL |
| **Quintilian** | Summa, Perkins | Disputed question vs theological question vs personal dilemma | Quintilian = **bounded disputed question about action/decision/claim** (weigh considerations, reach judgment). Summa = **doctrinal/exegetical/theological question, context-independent**. Perkins = **personal dilemma requiring wisdom of circumstances**. | **Boundaries stated but overlap remains subtle**. E.g. "Was Socrates justly condemned?" could be Quintilian (judgment) or Summa (question of justice). Deciding factor: Quintilian weighs **specific facts**; Summa argues **general principles**. | STRUCTURAL |

**Recommendations:**
- Isocrates: Clarify "If the primary organizational structure is chronological (birth, deeds, death) → Plutarch. If organized by critical categories (merits, faults, appraisal) → Isocrates."
- Quintilian: Add to Notes: "If the question depends materially on specific historical facts and circumstances → Quintilian. If it can be argued from principles without those facts → Summa."

---

### Chrestomathy & Florilegium

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Erasmus (Chrestomathy)** | Chreia, Bede | Rhetorical craft vs historical saying vs worldview-bearing passage | Erasmus = **rhetorical craft** (form-function lesson). Chreia = **historical saying with virtue exemplified**. Bede = **conviction-bearing passage**. **Same quotation may appear in multiple patterns.** | **Boundary stated but needs reinforcement**. Erasmus Notes say "if the passage is preserved for what it says or conviction → Florilegium." But then says Chrestomathy is for "how language works." This is good but should explicitly acknowledge **overlap is expected and acceptable**. | OPTIONAL |
| **Bede (Florilegium)** | Erasmus | Worldview vs craft | Bede = **chosen for conviction, independent of phrasing**. Erasmus = **chosen for craft**. "A phrase can qualify for both; separate entries, each block-referencing the same source." | **Boundary is stated clearly.** Good. | - |

**Recommendations:**
- Erasmus Notes should add: "The same passage may appear as both Chrestomathy (for craft) and Florilegium (for conviction). They are written as separate Lab entries, each block-referencing the same source citation."

---

### Lexicon & Glossary

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Buckley (Lexicon)** | Safire, Alciato | Foreign loanword vs English concept handle vs emblem motto | Buckley = **foreign word kept in original language**. Safire = **English coined phrase**. Alciato = **motto paired with image**. | **CRITICAL NAMESPACE COLLISION**. Buckley and Safire share `Term/`. Templates acknowledge this: Safire Notes say "shares namespace with Lexicon" and recommend writing under primary pattern. **This is too vague.** | CRITICAL |
| **Safire (Glossary)** | Buckley | See above | See above | **See above.** | CRITICAL |

**Recommendations:**
- **Split namespace**. Use `Word/` for Buckley (foreign loanwords) and `Term/` for Safire (English concept handles).

---

### Rule of Life

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Franklin (Virtue)** | Edwards, Adler | Virtue vs Resolution vs Concept | Franklin = **quality of character to cultivate**. Edwards = **specific commitment with no schedulable practice**. Adler = **intellectual concept**. Templates state Virtue and Concept may coexist for same word (e.g. `Virtue/Diligence` and `Concept/Diligence`). "One is the argument, the other is the commitment." | **Boundary stated clearly. Acceptable overlap.** | - |
| **Edwards (Resolution)** | Benedict, Franklin | Resolution vs Discipline vs Virtue | Edwards = **commitment with no regular cadence** ("catch yourself in the moment"). Benedict = **repeatable practice with cadence**. Franklin = **character quality**. Boundary test: "Can you honestly write a Discipline section without inventing one? If concrete practice → Benedict. If 'remember and try' → Edwards." | **Excellent boundary test.** Clear. | - |
| **Benedict (Discipline)** | Edwards | See above | See above | **Clear.** | - |
| **Luther (Responsibility)** | Edwards, Benedict | Responsibility vs Resolution vs Discipline | Luther = **duty inherent in a role/office**. Edwards = **personal commitment**. Benedict = **practice**. "Responsibility not primarily chosen; arises from what's entrusted." | **Boundary stated but could be sharper**. E.g. "Teach my children the faith" — is this a Responsibility (inherent in fatherhood) or Resolution (personal commitment)? Answer: Responsibility if grounded in biblical command or nature of the role; Resolution if personally adopted beyond role requirements. Needs clarification. | STRUCTURAL |

**Recommendations:**
- Luther Notes should add: "If the duty is grounded in Scripture or inherent in the nature of the role/office → Responsibility. If it is a personally adopted commitment that goes beyond strict role requirements → Resolution. If uncertain, prefer Responsibility for duties Scripture explicitly assigns to the role."

---

### Summa & Syntopicon

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Aquinas (Summa)** | Perkins, Quintilian, Calvin | Disputed question vs case of conscience vs judgment vs doctrine in passage | Summa = **context-independent question argued systematically**. Perkins = **personal circumstances determine answer**. Quintilian = **specific disputed action/claim**. Calvin = **doctrinal note within passage commentary**. | **Boundaries stated but overlap remains subtle**. Summa Notes say "context-independent — true/false regardless of who's asking." But many theological questions have both general principles (Summa) and personal application (Perkins). AI could create both when one would suffice. | STRUCTURAL |
| **Adler (Syntopicon)** | Safire, Franklin | Concept vs Term vs Virtue | Adler = **top-level closed concept**. Safire = **coined handle for a specific distinction**. Franklin = **personal virtue commitment**. Boundaries mostly clear but overlap acknowledged as acceptable. | **Clean.** | - |

**Recommendations:**
- Summa Notes should add: "If the question requires weighing the person's particular circumstances (who they are, their relationships, their role) → Perkins. If it can be argued from Scripture and doctrine without knowing who's asking → Summa. When in doubt, prefer Summa for theological questions and Perkins for pastoral questions."

---

### Other Patterns

| Pattern | Nearest Neighbors | Likely Confusion | Deciding Test | Problems Found | Severity |
|---------|-------------------|------------------|--------------|----------------|----------|
| **Alciato (Emblem)** | Buckley, Warburg | Fixed emblem vs motto vs constructed image | Alciato = **historically established meaning**. Buckley = **motto phrase only, no essential image**. Warburg (archived) = **meaning constructed through comparison**. | **Boundaries clear.** Alciato Notes state "if phrase itself is the point and no image is essential → Buckley. If meaning is open/associative → Warburg." | - |
| **Diderot (Encyclopedia)** | Adler, Photius | Syllabus vs Concept vs Source | Diderot = **lived experience syllabus for a field**. Adler = **top-level concept**. Photius = **single book**. Clear functional separation. | **Clean.** | - |
| **Irenaeus (Thread)** | Calvin, Summa | Redemptive-historical trajectory vs passage study vs doctrine | Irenaeus = **development across biblical story**. Calvin = **single passage**. Summa = **doctrinal argument**. Boundary: "must involve real development across story, not just repeated vocabulary." | **Boundary stated but could be sharper**. What counts as "real development"? Add example: "Repeated use of 'seed' vocabulary alone is insufficient. Thread requires meaningful theological connection (e.g. Genesis 3:15 → Abraham's seed → David's seed → Galatians 3)." | OPTIONAL |
| **Cranmer (Household Liturgy)** | Tacitus, Plutarch | Liturgical day vs historical event vs person | Cranmer = **recurring annual day**. Tacitus = **linear historical event**. Clear. | **Clean.** | - |
| **Alexander (Pattern Language)** | All | Meta-pattern vs domain-specific patterns | Alexander creates patterns ABOUT patterns. Recursive. | **Clean.** | - |
| **Eco List** | All | List vs structured pattern | Eco List = **holding pen for material with no established pattern**. "If a real shape emerges → may deserve its own pattern." | **Clean.** | - |
| **Gerald (Topographia)** | Tacitus, Plutarch, Alciato | Travel place vs historical place vs emblem | Gerald = **personally encountered travel place**. Tacitus = **event location** (may reference `Place/` but event is the point). Alciato = **symbolic place in emblem**. Boundary: "If primary point is historical event → Tacitus. If person → Plutarch. If personally encountered in travel → Gerald." | **Boundary stated but needs one clarification**: Can the same `Place/` be both Tacitus and Gerald? Answer: Yes. Tacitus references `Place/Rome`; Gerald creates `Place/Roman Forum` as personally encountered site. These may or may not be the same page depending on granularity. Needs containment rule. | OPTIONAL |

**Recommendations:**
- Gerald Notes should add: "A `Place/` tag may appear in multiple patterns. Tacitus and Chreia reference places where events occurred; Gerald creates canonical Place/ pages for personally visited sites. Use the finest-grained Place that merits its own page. A city-level Place (e.g. `Place/Rome`) may be referenced by Tacitus and also have child Place pages created by Gerald (e.g. `Place/Colosseum`). No conflict."

---

## CROSS-DOMAIN RETRIEVAL MATRIX

### Matrix Format

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other Key Tags | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|----------------|-------------|

**Legend:**
- **REQUIRED** = AI must enforce; missing tag is an error
- **RECOMMENDED** = AI should prompt if absent
- **OPTIONAL** = Apply when useful
- **NONE** = Generally inappropriate for this pattern

---

### Annals & Histories

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Tacitus** | **REQUIRED** | RECOMMENDED | RECOMMENDED | RECOMMENDED | OPTIONAL | OPTIONAL | NONE | OPTIONAL | Artifact/ | Time/ is the organizing axis (year). Person/, Place/, Source/ surface the event. Event/ is classificatory (not canonical). Concept/Theme/ when intellectually significant. |
| **Plutarch** | **REQUIRED** (birth+death) | N/A (IS Person/) | RECOMMENDED | RECOMMENDED | RECOMMENDED | OPTIONAL | NONE | OPTIONAL | Subject/ for field | Person/ is the canonical page itself. Time/ for birth/death years. Concept/ for virtues/vices named. Source/ for their works. |
| **Chreia** | **REQUIRED** | **REQUIRED** | OPTIONAL | **REQUIRED** | RECOMMENDED | OPTIONAL | NONE | OPTIONAL | - | Time/ (year), Person/ (speaker), Source/ (attestation) are essential. Concept/ for virtue/vice per Valerius's principle. Event/ if saying tied to event. |
| **Ussher** | **REQUIRED** (verdict + candidates) | OPTIONAL | OPTIONAL | RECOMMENDED | NONE | NONE | NONE | **REQUIRED** | - | Time/ for verdict and rival candidates. Event/ for the event being dated. Source/ for witnesses. |

---

### Bibliography & Reading

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Photius** | OPTIONAL | **REQUIRED** (author) | NONE | N/A (IS Source/) | OPTIONAL | OPTIONAL | **ISSUE** | NONE | Subject/ (shelf) | Person/ for author required. Subject/ for Bibliography shelving. **ISSUE**: Template says "Topic/" for themes but this collides with Perkins and Summa uses of Topic/. Should probably be Theme/ instead. |

**Problem Found:** Photius Notes say "`Topic/`, `Theme/` as they arise." But Topic/ is overloaded. Recommendation: Remove Topic/ from Photius; use Theme/ only.

---

### Cases of Conscience

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Perkins** | NONE | OPTIONAL | NONE | OPTIONAL | **RECOMMENDED** | NONE | **REQUIRED** | NONE | Rule/ (if precept bears) | Topic/ for domain (e.g. `Topic/On Anger`). Concept/ for virtue/vice at stake. Person/ if from correspondence. Rule/ if standing precept applies. |

---

### Chrestomathy

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Erasmus** | NONE | OPTIONAL | NONE | **RECOMMENDED** | OPTIONAL | OPTIONAL | NONE | NONE | Craft/, Function/, Occasion/ | Craft/ (device), Function/ (effect), Occasion/ (social setting) are analytical tags. Source/ and Person/ for origin. Theme/Concept/ "only when genuinely useful; not the organizing vocabulary." **RETRIEVAL CONCERN**: Support-heavy pattern. If a Chrestomathy entry teaches a powerful writing move with theological significance, how is it surfaced for an Essay? |

**Recommendation:** Chrestomathy should **RECOMMEND** Theme/ or Concept/ when the passage has intellectual substance beyond craft. Otherwise it may disappear.

---

### Commentary

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Calvin** | NONE | NONE | NONE | **REQUIRED** (Book/) | OPTIONAL | OPTIONAL | **ISSUE** | NONE | - | Source/ links to Jerome Book/ overview. **ISSUE**: Template says "`Topic/`, `Theme/`, `Concept/`" but Topic/ collides with other uses. Should be Theme/ and Concept/ only. |
| **Jerome** | NONE | OPTIONAL (trad. author) | NONE | N/A (IS Book/) | OPTIONAL | OPTIONAL | **ISSUE** | NONE | - | Same issue as Calvin. |

**Recommendation:** Remove Topic/ from Calvin and Jerome; use Theme/ and Concept/ only.

---

### Confessions

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Newman** | **REQUIRED** (year of Turn) | OPTIONAL | NONE | RECOMMENDED (decisive books) | OPTIONAL | NONE | **ISSUE** | NONE | - | Time/ for timeline placement. Source/ for decisive books. **ISSUE**: Template says "`Topic/`, `Concept/`" but Topic/ collides. Should be Concept/ and possibly Theme/. |
| **Augustine** | **REQUIRED** (year) | OPTIONAL | NONE | OPTIONAL | OPTIONAL | OPTIONAL | NONE | NONE | - | Time/ for timeline. Concept/, Theme/ as they arise. **CLEAN**. |
| **Pascal** | **REQUIRED** (year) | OPTIONAL | NONE | NONE | OPTIONAL | OPTIONAL | NONE | NONE | - | Time/ for timeline. Concept/, Theme/ as they arise. **CLEAN**. |

**Recommendation:** Remove Topic/ from Newman; use Concept/ and Theme/.

---

### Criticism

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Lewis** | NONE | **REQUIRED** (author) | NONE | **REQUIRED** | OPTIONAL | OPTIONAL | **ISSUE** | NONE | - | Source/ and Person/ required. **ISSUE**: Template says "`Topic/`" — should be Theme/ only. |
| **Isocrates** | NONE | OPTIONAL | NONE | OPTIONAL | OPTIONAL | OPTIONAL | **ISSUE** | NONE | Canonical page for subject | Tags canonical Person/, Source/, Topic/, or other page for subject. **ISSUE**: Topic/ collision. |
| **Quintilian** | OPTIONAL | OPTIONAL | NONE | OPTIONAL | OPTIONAL | OPTIONAL | **ISSUE** | OPTIONAL | - | All tags optional but recommended when applicable. **ISSUE**: Template says "`Topic/`" — collides. |

**Recommendation:** Remove Topic/ from all Criticism patterns; use Theme/ and Concept/.

---

### Emblem Book

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Alciato** | NONE | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL | **RECOMMENDED** | NONE | NONE | Artifact/, Tradition/, Term/ (if motto merits Lexicon entry) | Theme/ recommended for symbolic meaning. Concept/ if applicable. **CLEAN**. |

---

### Encyclopedia

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Diderot** | NONE | OPTIONAL | NONE | OPTIONAL | OPTIONAL | NONE | NONE | NONE | Subject/ (if has Bibliography shelf) | Subject/ links to Bibliography shelf if applicable. Concept/, Person/, Source/ as they arise. **CLEAN**. |

---

### Florilegium

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Bede** | NONE | OPTIONAL | NONE | **RECOMMENDED** | OPTIONAL | **REQUIRED** | NONE | NONE | - | Theme/ is required (organizing key). Source/ and Person/ for origin. **CLEAN**. Excellent cross-domain tagging. |

---

### Glossary & Lexicon

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Safire** | NONE | OPTIONAL (coiner) | NONE | OPTIONAL | OPTIONAL | NONE | NONE | NONE | - | Person/ for coiner. Concept/ if maps onto Syntopicon entry. Source/ if from logged book. **CLEAN**. |
| **Buckley** | NONE | NONE | NONE | OPTIONAL | OPTIONAL | NONE | NONE | NONE | Language/ (required) | Language/ required (German, Latin, etc.). Concept/ for idea named. Term/ if English handle also exists (cross-ref). **CLEAN**. |

---

### History of Redemption

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Irenaeus** | NONE (Era/ on fragments) | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL | OPTIONAL | NONE | NONE | - | Era tagging belongs to canonical fragments in Narrative, not to Thread post itself. Concept/, Theme/, Person/, Place/, Source/ as useful. **CLEAN**. |

---

### Household Liturgy

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Cranmer** | NONE (uses Day/ and Cycle/) | **REQUIRED** | NONE | OPTIONAL | NONE | **REQUIRED** | NONE | NONE | Day/, Cycle/, Season/ | Person/ required (week's figure). Theme/ required. Day/ (bare, no year), Cycle/ (Year N), Season/ (liturgical). **CLEAN**. |

---

### Pattern Language

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Alexander** | NONE | NONE | NONE | NONE | OPTIONAL | OPTIONAL | NONE | NONE | - | Concept/, Theme/ as they arise. **CLEAN**. |

---

### Rule of Life

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Franklin** | NONE | OPTIONAL (exemplar) | NONE | NONE | OPTIONAL (if Concept shares name) | NONE | NONE | NONE | Role/ (required) | Role/ required for every virtue. Concept/ if cross-ref to Syntopicon. Person/ for exemplar. **CLEAN**. |
| **Edwards** | NONE | OPTIONAL (exemplar) | NONE | OPTIONAL | OPTIONAL | NONE | **ISSUE** | NONE | Virtue/ (required), Role/ (required) | Virtue/ (links Resolution to virtue being cultivated) and Role/ required. **ISSUE**: Template says "`Topic/` for domain of life" — should be removed; Role/ handles this. |
| **Benedict** | NONE | NONE | NONE | OPTIONAL | OPTIONAL | NONE | **ISSUE** | NONE | Role/ (required) | Role/ required. Concept/ for virtue/vice. **ISSUE**: Template says "`Topic/` for domain" — remove; use Role/. |
| **Luther** | NONE | OPTIONAL | NONE | OPTIONAL | OPTIONAL | NONE | **ISSUE** | NONE | Role/ (required) | Role/ required. Source/ for Scripture. **ISSUE**: Template says "`Topic/`" — remove; use Role/. |

**Recommendation:** Remove Topic/ from all Rule of Life patterns; Role/ already handles this.

---

### Silva Rerum

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Eco List** | NONE | NONE | NONE | NONE | OPTIONAL | OPTIONAL | **ISSUE** | NONE | - | Theme/, Concept/ as they apply. **ISSUE**: Template says "`Topic/`" — should be Theme/. |

---

### Summa

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Aquinas** | NONE | NONE | NONE | OPTIONAL | OPTIONAL | OPTIONAL | **CRITICAL ISSUE** | NONE | Claim/ | **CRITICAL**: Template uses `Topic/{Question}` for naming AND `Topic/` as a tag. This creates massive overload with Perkins (which uses `Topic/` for dilemma domains). **MUST RENAME** to `Question/`. |

---

### Syntopicon

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Adler** | NONE | NONE | NONE | NONE | N/A (IS Concept/) | NONE | OPTIONAL | NONE | Topic/ (outline sub-heading, INTERNAL ONLY) | Adler creates canonical Concept/ pages. **ISSUE**: Notes say "Topic/{On X} under specific sub-questions within Outline of Topics." This makes Topic/ an INTERNAL HEADING within Concept entries, NOT a separate namespace. **DO NOT TAG EXTERNALLY**. |

**Recommendation:** Clarify that Adler's use of "Topic/" is internal to Concept/ entries and should not be created as separate namespace tags.

---

### Topographia

| Pattern | Time/ | Person/ | Place/ | Source/ | Concept/ | Theme/ | Topic/ | Event/ | Other | Explanation |
|---------|-------|---------|--------|---------|----------|--------|--------|--------|-------|-------------|
| **Gerald** | **REQUIRED** (year visited) | OPTIONAL | N/A (IS Place/) | OPTIONAL | OPTIONAL | OPTIONAL | NONE | OPTIONAL | Kind/, Country/, Region/, City/ | Place/ is the canonical page. Time/ for visit year. Kind/ (Nature/Curiosity/Cultural Artifact) recommended. Country/Region/City for geography. **CLEAN**. |

---

### Summary of Cross-Domain Issues

**CRITICAL:**
- **Topic/ overload across Perkins, Summa, Adler, and multiple other patterns.** Must be split.

**RECOMMENDED FIXES:**
1. Rename Summa `Topic/` to `Question/`
2. Remove Topic/ from: Photius, Calvin, Jerome, Newman, Lewis, Isocrates, Quintilian, Edwards, Benedict, Luther, Eco List
3. Replace with Theme/ or Concept/ or Role/ depending on context
4. Clarify that Adler's Topic/ is internal only, not a separate namespace

---

## BACKBONE AND SUPPORT MATRIX

### Classifying Patterns by Essay Role

**BACKBONE-HEAVY** = Often capable of supplying the organizing intellectual structure of an Essay.

| Pattern | Essay Role | Explanation |
|---------|-----------|-------------|
| **Aquinas (Summa)** | **BACKBONE-HEAVY** | Disputed questions with systematic argument. Could form the spine of a theological Essay. |
| **Adler (Syntopicon)** | **BACKBONE-HEAVY** | Top-level concept with definitions, outline of topics, and notes. Natural Essay backbone. |
| **Diderot (Encyclopedia)** | **BACKBONE-HEAVY** | Syllabus for a field drawn from lived experience. Could organize an Essay on that field. |
| **Newman (Conviction)** | **BACKBONE-HEAVY** | Doctrinal conviction that moved over time. Natural Essay backbone for personal theological development. |
| **Isocrates (Appraisal)** | **BACKBONE-HEAVY** | Critical evaluation of a subject. Could organize an Essay. |
| **Lewis (Review)** | **BACKBONE-HEAVY** | Critical review of a work. Could be expanded into Essay. |
| **Quintilian (Judgment)** | **BACKBONE-HEAVY** | Bounded disputed question with weighing of considerations. Could be Essay backbone. |
| **Irenaeus (Thread)** | **BACKBONE-HEAVY** | Biblical-theological trajectory. Natural backbone for theological Essay. |
| **Perkins (Case)** | **MIXED** | Some cases could expand into Essays; others remain narrow pastoral responses. |
| **Augustine (Confession)** | **MIXED** | Some confessions could be Essay backbones; others remain personal fragments. |
| **Pascal (Reflection)** | **MIXED** | Intentionally fragmentary, but some could seed Essays. |

---

**SUPPORT-HEAVY** = Usually supplies evidence, examples, quotations, distinctions, terms, history, imagery, sources, memories, cases, or other material to an Essay whose backbone originates elsewhere.

| Pattern | Essay Role | Explanation |
|---------|-----------|-------------|
| **Tacitus** | **SUPPORT-HEAVY** | Historical events. Provides evidence, context, examples. Rarely Essay backbone alone. |
| **Plutarch** | **MIXED** | Lives could be Essay backbones (biographical) OR supporting evidence (character examples). |
| **Chreia** | **SUPPORT-HEAVY** | Historical sayings. Supplies quotations, examples of virtue/vice. |
| **Ussher** | **SUPPORT-HEAVY** | Dating arguments. Supports historical claims in Essays. |
| **Photius** | **SUPPORT-HEAVY** | Reading notes. Supplies sources, quotations, summaries. Critical support infrastructure. |
| **Calvin (Passage)** | **SUPPORT-HEAVY** | Exegesis of specific passages. Supports larger theological Essays. |
| **Jerome (Book)** | **MIXED** | Book overviews could be Essay backbones OR supporting material. |
| **Erasmus (Chrestomathy)** | **SUPPORT-HEAVY** | Rhetorical craft examples. Supplies writing lessons, stylistic moves. |
| **Bede (Florilegium)** | **SUPPORT-HEAVY** | Conviction-bearing quotations. Supplies worldview support. **CRITICAL** for cross-domain surfacing. |
| **Alciato (Emblem)** | **SUPPORT-HEAVY** | Fixed emblems. Supplies imagery, symbolism. |
| **Safire (Glossary)** | **SUPPORT-HEAVY** | Concept handles. Supplies terminology, distinctions. |
| **Buckley (Lexicon)** | **SUPPORT-HEAVY** | Foreign loanwords. Supplies terminology. |
| **Cranmer (Liturgy)** | **SUPPORT-HEAVY** | Household liturgy. Supplies devotional material, memories. |
| **Gerald (Topographia)** | **SUPPORT-HEAVY** | Travel places. Supplies imagery, memories, examples. |
| **Franklin (Virtue)** | **SUPPORT-HEAVY** | Virtues. Supplies character framework. |
| **Edwards (Resolution)** | **SUPPORT-HEAVY** | Resolutions. Supplies personal commitments, examples of conviction. |
| **Benedict (Discipline)** | **SUPPORT-HEAVY** | Disciplines. Supplies practices, examples. |
| **Luther (Responsibility)** | **SUPPORT-HEAVY** | Responsibilities. Supplies role-based duties. |
| **Alexander (Pattern Language)** | **MIXED** | Patterns could be Essay backbones (on learning) OR supporting structure. |
| **Eco List** | **SUPPORT-HEAVY** | Lists. Supplies collections, inventories. |

---

### Critical Observation

**Support-heavy Patterns require especially strong cross-domain discoverability.** If a Chreia entry preserves a profound saying with theological import, it must be tagged with Concept/ or Theme/ or it will disappear inside its chronological year.

Current system addresses this INCONSISTENTLY:
- **Bede (Florilegium)**: Theme/ REQUIRED. ✓
- **Cranmer**: Theme/ REQUIRED. ✓
- **Chreia**: Concept/ RECOMMENDED (should be REQUIRED when virtue/vice is substantive). ⚠️
- **Erasmus (Chrestomathy)**: Theme/Concept/ "only when genuinely useful." ⚠️
- **Gerald**: Theme/Concept/ OPTIONAL. ⚠️
- **Tacitus**: Theme/Concept/ OPTIONAL. ⚠️

**Recommendation:** Strengthen cross-domain tagging requirements for support-heavy patterns (see Cross-Domain Retrieval Matrix).

---

## STRUCTURE AUDIT

### Annals and Histories

**Organizing Logic:** Chronological (year-by-year timeline from 4000 BC to present)

**Feeding Patterns:**
- Tacitus (events)
- Plutarch (lives, linked at birth and death years)
- Chreia (sayings, linked at year spoken)
- Ussher (dating arguments, linked from Tacitus entries rather than placed on timeline)

**Retrieval Role:** Native Garden for historical material. Cross-domain: feeds `Time/`, `Person/`, `Place/`, `Event/`.

**Current Weaknesses:**
1. Notes describe archived patterns (Diegema Episode, Diogenes Profile, Herodotus Custom, Augustine Theme, Chreia Expansion) as if they're active. These should be removed from Structure Notes or explicitly marked as archived.
2. "Tasks" section includes incomplete TODO. Acceptable if in active development.

**AI Ambiguity:**
- How to handle events spanning multiple years? (E.g. 30 Years' War) — Needs placement rule.
- How to handle prehistorical/legendary events with uncertain dates? (E.g. Fall of Troy) — Needs convention.

**Recommended Changes:**
- Remove or archive references to obsolete patterns in Structure Notes
- Add placement rule for multi-year events: "Place under the year the event began, with a note spanning X–Y years."
- Add convention for legendary dates: "Use traditional date; note uncertainty in Tacitus entry; create Ussher entry if chronology is contested."

**Severity:** CONSISTENCY

---

### Bibliography

**Organizing Logic:** Hybrid subject classification (6 categories: Truth, Memory, Imagination, Practice, Craft, Language) + alphabetical within sections

**Feeding Patterns:**
- Photius (canonical Source/ pages)

**Retrieval Role:** Native Garden for reading. Cross-domain: feeds `Source/`, `Person/`.

**Current Weaknesses:**
1. Uses `Subject/{Section}` for shelving (e.g. `Subject/Knowing`). This collides with Encyclopedia's use of `Subject/` for syllabus topics and Summa's use for domain headings. **Needs clarification** (see Namespace Dictionary).
2. "Five of the Greatest" subsections suggest ranking but mechanism not specified.

**AI Ambiguity:**
- Should shelf classification be tagged `Subject/` or remain structure-internal?
- How are "Five of the Greatest" selections determined and maintained?

**Recommended Changes:**
- Clarify that Bibliography shelving is structure-internal, not namespaced. Do NOT create `Subject/` tags for shelves. Only Encyclopedia creates `Subject/` pages.
- Add Notes on "Five of the Greatest" selection criteria if it's meant to be systematic.

**Severity:** STRUCTURAL

---

### Cases of Conscience

**Organizing Logic:** Four-part division (Self, Household, Church, Society) with thematic subsections

**Feeding Patterns:**
- Perkins

**Retrieval Role:** Native Garden for practical theology. Cross-domain: feeds `Topic/` (dilemma domains), `Concept/`, `Role/`.

**Current Weaknesses:**
1. Well-structured. No major weaknesses.
2. "Preface" placeholder not yet written (acceptable).

**AI Ambiguity:**
- Subsection headings (e.g. "Spiritual Life and Disciplines") — are these merely organizational or should they be tagged? Answer: organizational only.

**Recommended Changes:**
- None critical. Consider writing Preface when ready.

**Severity:** OPTIONAL

---

### Chrestomathy

**Organizing Logic:** Organized by practical form-function "Moves" (reusable writing lessons), not by device taxonomy

**Feeding Patterns:**
- Erasmus

**Retrieval Role:** Native Garden for writing craft. Cross-domain: feeds `Craft/`, `Function/`, `Occasion/`, `Theme/`, `Concept/` (when applicable).

**Current Weaknesses:**
1. Structure Notes are extensive and excellent but the actual Garden structure is empty (only Preface placeholder).
2. Notes correctly emphasize that Garden should center on Moves, not bare device buckets. **This is good guidance** but needs execution.

**AI Ambiguity:**
- How to determine when a Move is ready to be added to Garden? "A strong single example can generate a Move." Clear.
- Should Craft/Function/Occasion tags create Garden headings? Notes say no: "Don't build Garden headings directly from these categories." Good.

**Recommended Changes:**
- Populate Garden structure with initial Moves as Erasmus entries are created.
- Consider adding example Moves to Structure Notes to clarify expected Garden organization.

**Severity:** OPTIONAL (structure is well-designed but empty)

---

### Commentary

**Organizing Logic:** Biblical order (Law, History, Wisdom, Prophets, Gospels, Acts, Epistles, Revelation)

**Feeding Patterns:**
- Calvin (passage-level exegesis)
- Jerome (book overviews)

**Retrieval Role:** Native Garden for Scripture. Cross-domain: feeds `Book/`, `Source/`, `Concept/`, `Theme/`.

**Current Weaknesses:**
1. Book/ vs Source/ namespace collision (see Namespace Dictionary).
2. Each genre section has placeholder for summary (TODO).

**AI Ambiguity:**
- When to create Jerome Book/ overview vs accumulating Calvin passages? Answer: Jerome when preparing to teach/study a book; Calvin as passages are studied. Clear enough.

**Recommended Changes:**
- Jerome Notes should clarify `Book/` is reserved for biblical books only.
- Write genre summaries when ready.

**Severity:** STRUCTURAL (Book/ collision)

---

### Confessions

**Organizing Logic:** Chronological timeline by `Time/` tag, interleaving Newman, Augustine, and Pascal entries

**Feeding Patterns:**
- Newman (conviction changed)
- Augustine (shortfall from conviction)
- Pascal (fragmentary reflection)

**Retrieval Role:** Native Garden for personal theological development. Cross-domain: feeds `Time/`, `Concept/`, `Theme/`, `Person/`, `Source/`.

**Current Weaknesses:**
1. Structure is minimalist (only "I", "II", "III" headings with no explanation). This may be intentional (letting titles read as compressed memoir) but AI cannot populate without knowing what I/II/III represent.

**AI Ambiguity:**
- What do "I", "II", "III" headings represent? Eras? Decades? Themes? **CRITICAL AMBIGUITY**.

**Recommended Changes:**
- Add Structure Notes explaining what the three divisions represent, OR clarify that the structure is a flat chronological sequence (remove the I/II/III headings if they're vestigial).

**Severity:** STRUCTURAL

---

### Criticism

**Organizing Logic:** Three-part division (Reviews, Appraisals, Judgments) by object of evaluation

**Feeding Patterns:**
- Lewis (reviews of works)
- Isocrates (appraisals of subjects)
- Quintilian (judgments on questions)

**Retrieval Role:** Native Garden for critical writing. Cross-domain: feeds `Source/`, `Person/`, `Concept/`, `Theme/`.

**Current Weaknesses:**
1. Excellent Structure Notes. No weaknesses.

**AI Ambiguity:**
- None. Boundaries are clear.

**Recommended Changes:**
- None.

**Severity:** -

---

### Emblem Book

**Organizing Logic:** Image-first gallery with sidenotes (visual coherence emphasized)

**Feeding Patterns:**
- Alciato

**Retrieval Role:** Native Garden for cultural symbols. Cross-domain: feeds `Emblem/`, `Theme/`, `Concept/`, `Term/`.

**Current Weaknesses:**
1. Extensive AI image generation prompts in Structure Notes. **This is excellent documentation** for maintaining visual consistency.

**AI Ambiguity:**
- None. Notes are extremely detailed.

**Recommended Changes:**
- None. This is exemplary Structure Notes.

**Severity:** -

---

### Encyclopedia

**Organizing Logic:** Nine subject domains (Theology, Philosophy, Natural Science, History, Culture, Society, Applied Science, Practice & Craft, Liberal Arts)

**Feeding Patterns:**
- Diderot

**Retrieval Role:** Native Garden for syllabi. Cross-domain: feeds `Subject/`.

**Current Weaknesses:**
1. Subject/ namespace collision with Bibliography and Summa (see Namespace Dictionary).

**AI Ambiguity:**
- Which patterns create `Subject/` pages vs merely referencing them? **Needs clarification**.

**Recommended Changes:**
- Clarify that ONLY Encyclopedia creates canonical `Subject/` pages. Bibliography and Summa domain headings are structure-internal.

**Severity:** STRUCTURAL

---

### Florilegium

**Organizing Logic:** Six-part categorical division (Truth, Memory, Imagination, Practice, Craft, Language) — note: SAME as Bibliography categories

**Feeding Patterns:**
- Bede

**Retrieval Role:** Native Garden for worldview-bearing quotations. Cross-domain: feeds `Theme/` (required), `Concept/`, `Source/`, `Person/`.

**Current Weaknesses:**
1. Shares category structure with Bibliography. Is this intentional alignment or coincidence? If intentional, it's elegant; if coincidence, it's confusing.

**AI Ambiguity:**
- Should Florilegium and Bibliography always share the same six categories? If so, this should be documented.

**Recommended Changes:**
- If category alignment is intentional, add note: "Florilegium uses the same six-part framework as Bibliography to preserve thematic coherence across reading and quotation."
- If not intentional, consider whether alignment is desirable.

**Severity:** OPTIONAL

---

### Glossary of Concept Handles

**Organizing Logic:** Alphabetical

**Feeding Patterns:**
- Safire

**Retrieval Role:** Native Garden for coined English terms. Cross-domain: feeds `Term/`, `Concept/`, `Person/`.

**Current Weaknesses:**
1. Term/ namespace collision with Buckley/Lexicon (see Namespace Dictionary).

**AI Ambiguity:**
- When does a concept handle merit a Glossary entry vs just being referenced in a Concept/ page? **Needs boundary clarification**.

**Recommended Changes:**
- Split namespace: Glossary uses `Term/`, Lexicon uses `Word/`.
- Add boundary rule: "If a term is coined specifically to name a distinction ordinary language flattens → Glossary. If the concept is broad and contested (e.g. Justice) → Syntopicon instead."

**Severity:** CRITICAL (Term/ collision)

---

### History of Redemption

**Organizing Logic:** Dual structure: (1) Redemptive-Historical Narrative (chronological fragments by era), (2) Redemptive-Historical Threads (thematic trajectories)

**Feeding Patterns:**
- Irenaeus (threads)
- Fragments stored in Narrative section (not a separate pattern)

**Retrieval Role:** Native Garden for biblical theology. Cross-domain: feeds `Thread/`, `Concept/`, `Theme/`, `Book/`.

**Current Weaknesses:**
1. **Excellent design.** Block-reference architecture prevents duplication. Fragments stored once, reused in Threads.

**AI Ambiguity:**
- When to create a new Thread vs adding to existing? "Create once at least two genuinely related fragments form a meaningful connection." Clear enough.

**Recommended Changes:**
- None. This is exemplary structure.

**Severity:** -

---

### Household Liturgy

**Organizing Logic:** Four-year liturgical cycle, organized by liturgical seasons (Anticipation, Incarnation, Revelation, Suffering, Resurrection, Mission)

**Feeding Patterns:**
- Cranmer

**Retrieval Role:** Native Garden for household worship. Cross-domain: feeds `Day/`, `Cycle/`, `Season/`, `Theme/`, `Person/`.

**Current Weaknesses:**
1. Tables are empty (in development). Acceptable.

**AI Ambiguity:**
- None. Structure is clear.

**Recommended Changes:**
- None.

**Severity:** -

---

### Lab

**Organizing Logic:** Master index of all Lab posts (not shown in export, but referenced in Pattern Notes)

**Feeding Patterns:**
- All Lab patterns feed here

**Retrieval Role:** Master index

**Current Weaknesses:**
1. Not visible in export. Cannot audit.

**AI Ambiguity:**
- What is the indexing structure? Chronological? By Pattern?

**Recommended Changes:**
- Include Lab index structure in next export for audit purposes.

**Severity:** OPTIONAL

---

### Lexicon

**Organizing Logic:** Alphabetical

**Feeding Patterns:**
- Buckley

**Retrieval Role:** Native Garden for foreign loanwords. Cross-domain: feeds `Term/` (should be `Word/`), `Language/`, `Concept/`.

**Current Weaknesses:**
1. Term/ namespace collision with Safire/Glossary (see Namespace Dictionary).

**AI Ambiguity:**
- None.

**Recommended Changes:**
- Rename namespace to `Word/` to avoid collision with Glossary.

**Severity:** CRITICAL

---

### Pattern Language for Learning

**Organizing Logic:** Tree structure with eight root patterns (Semantic, Personal, Logical, Narrative, Practical, Symbolic, Reference, Structural); all other patterns nest under roots via "Larger Patterns" chain

**Feeding Patterns:**
- Alexander

**Retrieval Role:** Native Garden for learning patterns. Cross-domain: feeds `Pattern/`, `Concept/`, `Theme/`.

**Current Weaknesses:**
1. Structure is minimalist (Introduction + three headings: Orientations, Practices, Moves). Cannot assess without seeing pattern population.

**AI Ambiguity:**
- How do Orientations/Practices/Moves map to the eight roots? **Needs clarification or is placeholder**.

**Recommended Changes:**
- Clarify structure or populate to show mapping.

**Severity:** OPTIONAL

---

### Reading Log

**Organizing Logic:** Chronological table (Title, Author, Date Read, Rating, Review link)

**Feeding Patterns:**
- None (fed by manual logging, possibly integrated with Photius)

**Retrieval Role:** Chronological reading history. Cross-domain: none directly.

**Current Weaknesses:**
1. Table is empty.

**AI Ambiguity:**
- Relationship to Photius? Are these the same Source/ pages or separate? Should be linked.

**Recommended Changes:**
- Clarify relationship to Photius: "Each Source/ page created by Photius Pattern should be added to Reading Log table with Date Read and Rating."

**Severity:** OPTIONAL

---

### Rule of Life

**Organizing Logic:** Four-part division (Prologue, Virtues, Resolutions, Disciplines, Responsibilities) + Examination; also indexed by Role/ tags

**Feeding Patterns:**
- Franklin (Virtues)
- Edwards (Resolutions)
- Benedict (Disciplines)
- Luther (Responsibilities)

**Retrieval Role:** Native Garden for personal commitments. Cross-domain: feeds `Virtue/`, `Role/`, `Concept/`.

**Current Weaknesses:**
1. Excellent Structure Notes.
2. "Responsibilies" is misspelled (should be "Responsibilities") on line 28.

**AI Ambiguity:**
- None. Boundaries between patterns are clear.

**Recommended Changes:**
- Fix typo: "Responsibilies" → "Responsibilities"

**Severity:** CONSISTENCY (typo)

---

### Silva Rerum

**Organizing Logic:** Simple index of lists

**Feeding Patterns:**
- Eco List

**Retrieval Role:** Native Garden for lists. Cross-domain: feeds `List/`, `Theme/`, `Concept/`.

**Current Weaknesses:**
1. Minimal structure (subtitle + one list link).

**AI Ambiguity:**
- Should lists be organized by type (Log, Plan, Options, Collection, Inventory, Ranking) as mentioned in Eco List Notes? Or remain flat alphabetical?

**Recommended Changes:**
- Consider organizing by List Type if volume grows.

**Severity:** OPTIONAL

---

### Summa

**Organizing Logic:** Six theological domain headings (Systematic, Biblical, Exegetical, Pastoral, Practical, Contemporary) with subject subdivisions

**Feeding Patterns:**
- Aquinas

**Retrieval Role:** Native Garden for theology. Cross-domain: feeds `Question/` (should be renamed from `Topic/`), `Claim/`, `Concept/`, `Theme/`.

**Current Weaknesses:**
1. **CRITICAL:** Uses `Topic/{Question}` which collides with Perkins and other patterns (see Namespace Dictionary and Cross-Domain Matrix).
2. Uses `Subject/` for domain headings (e.g. `Subject/Systematic Theology`), which collides with Encyclopedia and Bibliography (see Namespace Dictionary).

**AI Ambiguity:**
- Should domain headings be namespaced or structure-internal? **Recommendation: structure-internal only**.

**Recommended Changes:**
- Rename pattern from `Topic/` to `Question/`
- Clarify that domain headings (Subject/Systematic Theology, etc.) are structure-internal, not namespaced tags

**Severity:** CRITICAL

---

### Syntopicon

**Organizing Logic:** Alphabetical index of top-level concepts

**Feeding Patterns:**
- Adler

**Retrieval Role:** Cross-domain synthesis surface for concepts. All patterns feed here via `Concept/` tags.

**Current Weaknesses:**
1. Minimal structure (Preface placeholder).

**AI Ambiguity:**
- How is alphabetical organization maintained? Manually or automatically?

**Recommended Changes:**
- None critical.

**Severity:** -

---

### Topographia Itinerum

**Organizing Logic:** Image-first gallery (similar to Emblem Book) with optional geographic/journey subdivisions

**Feeding Patterns:**
- Gerald

**Retrieval Role:** Native Garden for travel places. Cross-domain: feeds `Place/`, `Time/`, `Kind/`, `Country/`, `Region/`, `City/`.

**Current Weaknesses:**
1. **Excellent Structure Notes** with detailed AI image generation prompts.

**AI Ambiguity:**
- None.

**Recommended Changes:**
- None.

**Severity:** -

---

## SPECIFIC TEMPLATE PROBLEMS

### CRITICAL (RESOLVED)

**1. Question/ and Topic/ namespace design (RESOLVED)**

**Files:**
- Templates.md (Perkins line 189, Aquinas line 927, and other patterns that previously misused Topic/)

**Pattern:** Multiple (primarily Perkins and Aquinas)

**Original Issue:** `Topic/` was serving incompatible functions across patterns (dilemma domains, disputed questions, internal headings, and general thematic tags), causing classification ambiguity.

**Resolution Adopted:**

**Question/** (NEW canonical namespace)
- Naming convention for BOTH Perkins (Cases of Conscience) and Aquinas (Summa) patterns
- Both patterns examine questions; they differ in domain (practical/pastoral vs theological/doctrinal) and method (casuistry vs disputation)
- Examples:
  - Perkins: `Question/Should I Correct My Child in Front of Guests?`
  - Aquinas: `Question/Whether the Canon Is Closed?`
- Creates canonical Lab post pages
- Clean semantic unity: "examined question" applies to both

**Topic/** (REDEFINED as pure classificatory namespace)
- No longer used for naming; exclusively for classification/tagging
- Areas of inquiry where subjects touch specific concerns
- Examples: `Topic/Anger`, `Topic/Distributive Justice`, `Topic/Health`
- Creates aggregation pages with NO authored content
- Auto-populated through linked references (zero maintenance)
- Used by Perkins Questions, Adler Concept outlines, and other patterns for cross-domain retrieval
- Multiple topics can apply to one entry
- Critical infrastructure for Essay discovery

**Template Updates Required:**
1. Perkins (line 189): Change naming from `Topic/` to `Question/`; add `Topic/` as classificatory tag
2. Aquinas (line 927): Change naming from `Topic/` to `Question/`; add `Topic/` as classificatory tag
3. All other patterns (Photius, Calvin, Jerome, Newman, Lewis, Isocrates, Quintilian, Edwards, Benedict, Luther, Eco List): Remove `Topic/` references; use `Theme/` or `Concept/` for thematic connections
4. Adler Pattern Notes: Clarify that "Outline of Topics" items can tag multiple `Topic/` for retrieval, but Topic/ remains classificatory

**Why This Solution Is Superior:**
- Semantic consistency: Question/ means "examined question" across both patterns
- Functional clarity: three-tier architecture (Subject/ for domains, Topic/ for areas, Question/ for propositions)
- Reduces namespace proliferation: no need for separate Perkins vs Aquinas namespaces
- Solves Adler elegantly: outline items tag topics without becoming canonical pages
- Provides powerful retrieval infrastructure through auto-aggregating Topic/ pages

**Migration Impact:** Moderate. Existing Perkins and Aquinas entries need namespace rename. Topic/ tags need review across all patterns.

**Status:** RESOLVED through architectural clarification

---

**2. Word/ and Term/ namespace separation (RESOLVED)**

**Files:** Templates.md (Buckley line 684, Safire line 600)

**Patterns:** Buckley (Lexicon), Safire (Glossary)

**Original Issue:** Both patterns were using `Term/{X}` as naming convention, creating ambiguity between foreign loanwords and English concept handles.

**Resolution Adopted:**
- **Buckley (Lexicon)**: Now uses `Word/{Headword}` for foreign loanwords
  - Examples: `Word/Schwerpunkt`, `Word/Zeitgeist`
  - Tagged with `Language/` for the source language

- **Safire (Glossary)**: Retains `Term/{Coined Phrase}` for English concept handles
  - Examples: `Term/Chronological Snobbery`, `Term/Tactical Flexibility`
  - May cross-reference to `Concept/` or `Word/` when relevant

**Template Updates Required:**
1. Buckley template (line 684): Change naming from `Term/` to `Word/`
2. Buckley Notes: Update all references to reflect Word/ namespace
3. Update cross-reference guidance: Word/ entries may link to Term/ if English handle exists for same idea

**Migration Impact:** Existing Buckley entries using `Term/` renamed to `Word/`.

**Status:** RESOLVED through namespace split and implementation.

---

**3. Book/ and Source/ boundary clarification (RESOLVED)**

**Files:** Templates.md (Photius line 158, Jerome line 294)

**Patterns:** Photius, Jerome

**Original Issue:** Ambiguity about when to create Book/ vs Source/ pages, particularly for biblical books vs other sources.

**Resolution Adopted:**
- **Book/** = 66 biblical books ONLY (closed set)
  - Jerome Pattern creates these
  - Examples: `Book/Genesis`, `Book/Hebrews`
  - Exactly 66 canonical pages, no more

- **Source/** = Everything else
  - Non-biblical books, essays, articles, podcasts, videos, commentaries on biblical books, study Bibles, etc.
  - Photius Pattern creates these
  - Format: `Source/{Title} - {Author}`
  - Open set (grows with reading)

**Template Updates Required:**
1. Jerome Notes (line 294): Add explicit boundary statement:
   - "The `Book/` namespace is reserved for the 66 canonical biblical books only. Commentaries on biblical books, study Bibles, Bible translations, theological works about biblical books, and all other non-biblical sources use `Source/{Title} - {Author}` per the Photius Pattern."

2. Photius Notes (line 158): Add clarification:
   - "Biblical books (Genesis through Revelation) have canonical `Book/{Name}` pages created by the Jerome Pattern. When logging a personal reading of a biblical book, link to the existing `Book/` page rather than creating a new `Source/` page. Commentaries on biblical books DO use `Source/`."

**Migration Impact:** Low if already following this convention. May need to audit any biblical books created as Source/ entries.

**Status:** RESOLVED through boundary clarification and documentation.

---

### STRUCTURAL

**4. Metadata field order inconsistency**

**Files:** Templates.md (all Lab templates)

**Patterns:** All Lab patterns

**Issue:** Metadata fields appear in inconsistent order. Three variations observed:
- Order A: Date Created, Date Updated, Type, Pattern, Tags, Notes (most common)
- Order B: Date Created, Date Updated, Type, Pattern, Tags (Notes as sub-heading under Tags)
- Order C: Date Created, Date Updated, Tags, Type (less common)

**Severity:** STRUCTURAL

**Why It Matters:** Inconsistency degrades human scanning and may confuse AI parsers expecting fixed field positions.

**Recommended Correction:**
Standardize all Lab templates to this order:
```markdown
- # Metadata
    - Date Created::
    - Date Updated::
    - Type:: [[Lab Post]]
    - Pattern:: [[Pattern Name]]
    - Tags::
    - Notes:
```

**Migration Impact:** Low. Existing posts remain readable; future posts follow standard.

---

**5. Notes label inconsistency**

**Files:** Templates.md (Chreia line 91, others use "Notes:")

**Patterns:** Chreia (no colon), others (with colon)

**Issue:** Chreia uses "Notes" without colon; all others use "Notes:".

**Severity:** STRUCTURAL (minor)

**Why It Matters:** Cosmetic inconsistency. May confuse AI parsers looking for "Notes:" pattern.

**Recommended Correction:**
- Line 91: change "Notes" to "Notes:"

**Migration Impact:** Negligible.

---

**6. Perkins vs Summa vs Quintilian boundary vagueness**

**Files:** Templates.md (Perkins line 181, Aquinas line 919, Quintilian line 471)

**Patterns:** Perkins, Aquinas, Quintilian

**Issue:** Boundary tests stated but overlap remains subtle. E.g. "Should I confront my neighbor about his adultery?" could be:
- Perkins (personal circumstances)
- Summa (general moral question)
- Quintilian (specific disputed action)

**Severity:** STRUCTURAL

**Why It Matters:** AI will struggle to classify borderline cases.

**Recommended Correction:**
Add sharper boundary tests:
- **Perkins Notes** (line 191): "The test is whether personal context is doing the real work—a specific person's circumstances, requiring wisdom and discernment to weigh. If the answer depends on who's asking and their particulars → here. If the question holds regardless of who's asking → Summa. If it's primarily a judgment on a specific completed action → Quintilian."
- **Aquinas Notes** (line 929): "If the entry is fundamentally an engagement with Scripture—exegetical, interpretive, or applicational—it belongs here, even when it touches politics, science, or personal conduct. If personal circumstances determine the answer → Cases of Conscience. If weighing a specific disputed action → Criticism (Quintilian)."
- **Quintilian Notes** (line 481): "If the question depends materially on specific historical facts and circumstances → here. If it can be argued from principles without those facts → Summa. If it requires weighing the asker's personal circumstances → Perkins."

**Migration Impact:** Low. Clarifies guidance without changing structure.

---

**7. Calvin vs Summa boundary on doctrinal material**

**Files:** Templates.md (Calvin line 256)

**Patterns:** Calvin, Aquinas

**Issue:** Calvin Notes say "a doctrinal question worth extended treatment → Summa" but "extended" is undefined.

**Severity:** STRUCTURAL

**Why It Matters:** AI might create Summa entries when Calvin's "Doctrine" section would suffice.

**Recommended Correction:**
Calvin Notes (line 266) should clarify: "If the doctrinal issue can be handled in a paragraph or two within the passage's context → include in this entry's Doctrine section. If it requires systematic argument with objections and replies independent of a single passage → create a Summa entry and link it from this passage."

**Migration Impact:** Low.

---

**8. Luther (Responsibility) vs Edwards (Resolution) boundary**

**Files:** Templates.md (Luther line 841, Edwards line 774)

**Patterns:** Luther, Edwards

**Issue:** Boundary stated but examples could go either way. E.g. "Teach my children the faith"—Responsibility (inherent in fatherhood) or Resolution (personal commitment)?

**Severity:** STRUCTURAL

**Why It Matters:** AI may misclassify commitments.

**Recommended Correction:**
Luther Notes (line 854) should add: "If the duty is grounded in Scripture or inherent in the nature of the role/office → Responsibility. If it is a personally adopted commitment that goes beyond strict role requirements → Resolution. When uncertain, prefer Responsibility for duties Scripture explicitly assigns to the role."

**Migration Impact:** Low.

---

**9. Subject/ namespace ambiguity**

**Files:** Bibliography.md line 97, Encyclopedia.md line 10, Summa.md line 8

**Structures:** Bibliography, Encyclopedia, Summa

**Issue:** All three use `Subject/` but unclear if they create the same pages or different ones.

**Severity:** STRUCTURAL

**Why It Matters:** AI cannot determine whether `Subject/Theology` in Encyclopedia and `Subject/Systematic Theology` in Summa should coexist or merge.

**Recommended Correction:**
- **Bibliography Structure Notes:** Clarify that shelving uses `Subject/{Section}` as structure-internal headings, NOT namespaced tags. Do not create Subject/ pages.
- **Encyclopedia Structure Notes:** Clarify that ONLY Encyclopedia creates canonical `Subject/{Topic}` pages for syllabi.
- **Summa Structure Notes:** Clarify that domain headings (Subject/Systematic Theology, etc.) are structure-internal, NOT namespaced tags.

**Migration Impact:** Low if current practice already follows this.

---

**10. Confessions Structure "I/II/III" headings unexplained**

**Files:** Confessions.md lines 6-8

**Structure:** Confessions

**Issue:** Structure has three headings ("I", "II", "III") with no explanation of what they represent.

**Severity:** STRUCTURAL

**Why It Matters:** AI cannot populate structure without knowing organizing logic. Are these eras? Themes? Decades?

**Recommended Correction:**
Add Structure Notes explaining divisions, OR remove headings if vestigial.

**Migration Impact:** Low.

---

**11. Rule of Life typo**

**Files:** Rule of Life.md line 28

**Structure:** Rule of Life

**Issue:** "Responsibilies" misspelled (should be "Responsibilities")

**Severity:** CONSISTENCY

**Why It Matters:** Cosmetic.

**Recommended Correction:**
Line 28: "Responsibilies" → "Responsibilities"

**Migration Impact:** Negligible.

---

### RETRIEVAL

**12. Support-heavy Patterns lack strong cross-domain tagging enforcement**

**Files:** Templates.md (Chreia line 94, Erasmus line 226, Gerald line 986, Tacitus line 30)

**Patterns:** Chreia, Erasmus, Gerald, Tacitus

**Issue:** Concept/ and Theme/ tags are optional or weakly recommended, but these are support-heavy patterns that will disappear without them.

**Severity:** RETRIEVAL

**Why It Matters:** A Chreia entry preserving "The die is cast" with profound implications could remain trapped in 49 BC without cross-domain tags.

**Recommended Correction:**
- **Chreia Notes** (line 94): Change "Concept/ for the virtue or vice it exemplifies" to "Concept/ for the virtue or vice it exemplifies (REQUIRED when substantive; this is Valerius's organizing principle and critical for cross-domain retrieval)."
- **Erasmus Notes** (line 231): Change "`Theme/` and `Concept/` only when genuinely useful" to "`Theme/` and `Concept/` RECOMMENDED when the passage carries intellectual substance beyond craft; critical for surfacing this material in Essay discovery."
- **Gerald Notes** (line 991): No change (optional is acceptable for travel).
- **Tacitus Notes** (line 30): Change "`Theme/` and `Concept/` as they arise" to "`Theme/` and `Concept/` RECOMMENDED when the event has intellectual, theological, or cultural significance; critical for Essay retrieval."

**Migration Impact:** Low. Improves future tagging; existing posts can be reviewed.

---

### CONSISTENCY

**13. Archived patterns still referenced in Structure Notes**

**Files:** Annals and Histories.md lines 67 (references Diegema, Diogenes, Herodotus, Augustine Theme patterns in Background and Inspiration)

**Structure:** Annals and Histories

**Issue:** Structure Notes reference archived patterns as if active.

**Severity:** CONSISTENCY

**Why It Matters:** Confusing. May mislead AI into thinking archived patterns are available.

**Recommended Correction:**
Remove references to archived patterns from Background and Inspiration, OR explicitly mark them as "Archived for reference."

**Migration Impact:** Low.

---

**14. Florilegium/ prefix unnecessary**

**Files:** Templates.md (Bede line 573)

**Pattern:** Bede

**Issue:** Naming convention uses `Florilegium/{Key Phrase}`. Florilegium is the Structure name, not a semantic category.

**Severity:** CONSISTENCY

**Why It Matters:** Namespace proliferation. The Structure and Pattern are sufficient; namespace is redundant.

**Recommended Correction:**
Bede Notes (line 573): Change "Naming: `Florilegium/{Key Phrase}`" to "Naming: `{Key Phrase}` (no namespace prefix; Florilegium is the Structure name)."

**Migration Impact:** Low if not yet populated. Moderate if entries exist.

---

## RECOMMENDED CHANGES

### A. Required for Reliable AI Operation (CRITICAL)

1. **Implement Question/ and Topic/ namespace redesign (RESOLVED)**
   - Files: Templates.md (Perkins line 189, Aquinas line 927, and other patterns)
   - Changes:
     - Perkins: Change naming from `Topic/` to `Question/`; add `Topic/` as classificatory tag
     - Aquinas: Change naming from `Topic/` to `Question/`; add `Topic/` as classificatory tag
     - All other patterns: Remove inappropriate `Topic/` usage; use `Theme/` or `Concept/` instead
     - Document that `Topic/` is now purely classificatory (no authored content, auto-aggregation only)
   - Impact: Eliminates namespace collision. Creates clean three-tier architecture (Subject/Topic/Question). Provides powerful retrieval infrastructure.
   - Status: **DESIGN RESOLVED** - awaiting template updates

2. **Word/ and Term/ namespace separation: RESOLVED**
   - Files: Templates.md lines 684 (Buckley), 600 (Safire)
   - Resolution: Buckley uses `Word/` for foreign loanwords, Safire uses `Term/` for English concept handles
   - Impact: Clean semantic separation. Existing Buckley entries migrated to Word/.
   - Status: **IMPLEMENTED**

3. **Book/ and Source/ boundary clarification: RESOLVED**
   - Files: Templates.md lines 294 (Jerome), 158 (Photius)
   - Resolution: Book/ reserved for 66 biblical books only; everything else uses Source/
   - Impact: Crystal clear boundary prevents future ambiguity.
   - Status: **CLARIFIED** - awaiting template Notes documentation

4. **Clarify Subject/ ownership (RESOLVED)**
   - Files: Bibliography.md, Encyclopedia.md, Summa.md Structure Notes
   - Change: Only Encyclopedia creates canonical Subject/ pages; Bibliography shelves and Summa domains remain structure-internal
   - Impact: Prevents namespace collision.
   - Status: **CLARIFIED** - awaiting documentation updates

---

### B. High-Value Improvements (STRUCTURAL/RETRIEVAL)

6. **Standardize metadata field order**
   - File: Templates.md (all Lab templates)
   - Change: Use canonical order (Date Created, Date Updated, Type, Pattern, Tags, Notes)
   - Impact: Improves consistency and AI parsing.

7. **Strengthen cross-domain tagging for support-heavy patterns**
   - Files: Templates.md (Chreia, Erasmus, Tacitus)
   - Change: Elevate Concept/Theme from optional to RECOMMENDED when substantive
   - Impact: Improves Essay retrieval.

8. **Sharpen Pattern boundary tests**
   - Files: Templates.md (Perkins, Aquinas, Quintilian, Calvin, Luther, Irenaeus, Chreia, Erasmus)
   - Change: Add concrete boundary clarifications
   - Impact: Improves AI classification accuracy.

9. **Explain or remove Confessions I/II/III headings**
   - File: Confessions.md
   - Change: Add Structure Notes explaining divisions
   - Impact: Clarifies organizing logic.

10. **Fix Rule of Life typo**
    - File: Rule of Life.md line 28
    - Change: "Responsibilies" → "Responsibilities"
    - Impact: Cosmetic.

---

### C. Optional Cleanup (CONSISTENCY/OPTIONAL)

11. **Remove Florilegium/ namespace prefix**
    - File: Templates.md Bede line 573
    - Change: Use bare `{Key Phrase}` naming
    - Impact: Reduces namespace proliferation.

12. **Add Notes colon to Chreia**
    - File: Templates.md line 91
    - Change: "Notes" → "Notes:"
    - Impact: Cosmetic consistency.

13. **Clean up Annals Structure Notes**
    - File: Annals and Histories.md
    - Change: Remove or mark archived pattern references
    - Impact: Reduces confusion.

14. **Clarify Florilegium/Bibliography category alignment**
    - Files: Florilegium.md, Bibliography.md Structure Notes
    - Change: Document whether shared six-part structure is intentional
    - Impact: Clarifies design intent.

---

## MIGRATION PLAN

### Phase 1: Namespace Corrections (CRITICAL)

**Goal:** Eliminate namespace collisions that could cause duplicate pages.

**Order:**
1. Implement Question/ and Topic/ namespace redesign
   - Update Perkins template (line 189):
     - Change naming from `Topic/{Question}` to `Question/{Question}`
     - Add Notes explaining Topic/ is now purely classificatory
     - Document that Questions should tag relevant `Topic/` areas
   - Update Aquinas template (line 927):
     - Change naming from `Topic/{Question}` to `Question/{Question}`
     - Add Notes explaining Topic/ is now purely classificatory
     - Document that Questions should tag relevant `Topic/` areas
   - Update Adler template:
     - Clarify "Outline of Topics" items can tag multiple `Topic/` for retrieval
     - Document that Topic/ pages have no authored content (auto-aggregation only)
   - Remove Topic/ from other templates:
     - Photius, Calvin, Jerome, Newman, Lewis, Isocrates, Quintilian: replace with Theme/Concept/
     - Edwards, Benedict, Luther: replace with Role/
     - Eco List: replace with Theme/
   - Migrate existing content:
     - Rename Perkins entries: `Topic/` → `Question/`
     - Rename Aquinas entries: `Topic/` → `Question/`
     - Review existing Topic/ tags on other patterns; retag as Theme/Concept/Role/

2. **Word/ and Term/ split: COMPLETED**
   - ✓ Buckley template updated to use Word/
   - ✓ Existing Buckley entries migrated to Word/
   - ✓ Cross-references updated
   - Status: IMPLEMENTED

3. **Book/ and Source/ boundary: CLARIFIED**
   - ✓ Design decision: Book/ for 66 biblical books only, Source/ for everything else
   - Remaining: Update Jerome and Photius template Notes with explicit boundaries
   - Remaining: Audit existing entries for compliance
   - Status: AWAITING DOCUMENTATION

4. Clarify Subject/ ownership
   - Update Structure Notes for Bibliography, Encyclopedia, Summa
   - Document: only Encyclopedia creates canonical Subject/ pages
   - Bibliography shelves and Summa domains remain structure-internal

**Impact:** Requires systematic review of existing content but prevents future errors.

---

### Phase 2: Metadata Standardization (STRUCTURAL)

**Goal:** Improve consistency and human/AI readability.

**Order:**
1. Standardize metadata field order
   - Update all Lab templates
   - Future posts auto-comply
   - Existing posts: migration optional

2. Add Notes colon to Chreia
   - One-line template change
   - Negligible impact

3. Fix Rule of Life typo
   - One-line change
   - Negligible impact

**Impact:** Low. Mostly forward-looking improvements.

---

### Phase 3: Pattern Boundary Clarifications (STRUCTURAL)

**Goal:** Reduce AI classification errors.

**Order:**
1. Add sharp boundary tests to templates:
   - Perkins vs Summa vs Quintilian
   - Calvin vs Summa
   - Luther vs Edwards
   - Chreia vs Chrestomathy
   - Irenaeus growth criteria

2. Update Pattern Notes with clarifications

**Impact:** Low. Improves future AI decisions; no content migration needed.

---

### Phase 4: Cross-Domain Retrieval Strengthening (RETRIEVAL)

**Goal:** Improve Essay discovery.

**Order:**
1. Update Chreia, Erasmus, Tacitus templates to elevate Concept/Theme tagging
2. Audit support-heavy posts for missing cross-domain tags
3. Retag where appropriate

**Impact:** Moderate. Requires content review but high ROI for Essay work.

---

### Phase 5: Structure Clarifications (OPTIONAL)

**Goal:** Clean up remaining inconsistencies.

**Order:**
1. Explain or remove Confessions I/II/III headings
2. Clean up Annals Structure Notes (remove archived pattern references)
3. Document Florilegium/Bibliography category alignment
4. Consider removing Florilegium/ namespace prefix

**Impact:** Low. Mostly cosmetic or clarifying.

---

### Safe Migration Principles

1. **Preserve existing page links where possible**
   - When renaming namespaces (e.g. Term/ → Word/), maintain redirects or update all references

2. **Canonical names should be stable**
   - Person/, Place/, Source/, Concept/, Virtue/, Emblem/, etc. should remain unchanged

3. **Batch migrations by namespace**
   - Easier to QA and verify completeness

4. **Update templates before migrating content**
   - Ensures new content follows corrected conventions immediately

5. **Prioritize collision-prevention over cosmetic cleanup**
   - Phase 1-2 are critical; Phase 3-5 can be deferred

---

## OPEN QUESTIONS

These are genuine design decisions requiring human judgment. Do not silently resolve them.

### 1. Should Confessions patterns (Newman, Augustine, Pascal) share a namespace?

**Current State:** Three separate namespaces: `Conviction/`, `Confession/`, `Reflection/`.

**Options:**
- **A. Retain three namespaces** (current). Rationale: They serve distinct rhetorical purposes (conviction change, shortfall, fragmentary insight). Separation aids retrieval.
- **B. Merge into single namespace** `Confession/{Title}` or `Personal/{Title}`. Rationale: They're all personal theological development. Pattern field already distinguishes them. Reduces namespace proliferation.

**Tradeoffs:**
- Option A: Better semantic separation, but three retrieval axes for one intellectual domain.
- Option B: Simpler retrieval, but loses namespace-level distinction.

**Recommendation:** Lean toward **Option A** (retain three namespaces) unless retrieval across all personal theological development is more important than distinguishing types. Needs discussion.

---

### 2. Should Criticism patterns (Lewis, Isocrates, Quintilian) share a namespace?

**Current State:** Three separate namespaces: `Review/`, `Appraisal/`, `Judgment/`.

**Options:**
- **A. Retain three namespaces** (current). Rationale: Objects differ semantically (work vs subject vs question).
- **B. Merge into single namespace** `Criticism/{Title}`. Rationale: Pattern field distinguishes them. Simplifies namespace.

**Tradeoffs:**
- Option A: Clearer semantics, but namespace proliferation.
- Option B: Simpler, but loses distinction at namespace level.

**Recommendation:** Lean toward **Option A** (retain three) since objects are semantically distinct. But if retrieval across all critical writing is more important, merge.

---

### 3. Should Dating/ (Ussher) exist as a namespace?

**Current State:** Ussher creates `Dating/{Event}` for chronological problems.

**Options:**
- **A. Retain** `Dating/{Event}`. Rationale: Useful for filtering dating problems vs events. Single-purpose namespaces are acceptable if retrieval value justifies.
- **B. Remove namespace**, title as `{Event} - Dating Problem`. Rationale: Reduces namespace proliferation. Pattern field already distinguishes Ussher from Tacitus.

**Tradeoffs:**
- Option A: Cleaner retrieval filtering.
- Option B: Simpler namespace list.

**Recommendation:** **Retain** (Option A). The semantic distinction is real, and AI benefits from explicit namespace when deciding whether to create Ussher vs Tacitus.

---

### 4. Should Florilegium and Bibliography align categories intentionally?

**Current State:** Both use six-part structure (Truth, Memory, Imagination, Practice, Craft, Language). Unknown if intentional.

**Options:**
- **A. Intentional alignment.** Rationale: Preserves thematic coherence across reading (Bibliography) and quotation (Florilegium). Elegant.
- **B. Coincidence.** Rationale: Categories happened to match but serve different purposes.

**Question:** Is this alignment intentional? If so, should it be documented and enforced? If not, should they diverge?

**Recommendation:** **Clarify intent**. If intentional, document it in Structure Notes. If not, consider whether alignment adds value or causes confusion.

---

### 5. Should Alexander's Pattern Language roots be enforced strictly?

**Current State:** Alexander Notes say "every other pattern must trace upward through Larger Patterns until it reaches one of these eight" roots.

**Question:** Is this a hard constraint (AI should error if a pattern doesn't trace to a root) or aspirational guidance?

**Options:**
- **A. Hard constraint.** All patterns must trace to one of eight roots.
- **B. Soft guidance.** Patterns should trace to roots where applicable, but orphans are acceptable.

**Recommendation:** **Clarify in Pattern Language Structure Notes** whether root tracing is required or recommended.

---

### 6. Should Stream posts use Tags:: for cross-domain tagging?

**Current State:** Stream template includes `Tags::` field. No guidance on what to tag.

**Question:** Should Stream posts tag `Concept/`, `Theme/`, `Person/`, etc. to feed cross-domain retrieval? Or are Stream posts ephemeral and not meant to surface in cross-domain indexes?

**Options:**
- **A. Stream tags feed cross-domain.** Rationale: Surfacing Stream insights enriches cross-domain structures.
- **B. Stream tags are internal only.** Rationale: Stream is rapid capture; cross-domain tagging is Lab's job.

**Recommendation:** **Clarify Stream tagging policy**. If Stream posts can surface in Concept/ or Theme/ pages, this should be explicit. If not, explain that Stream tags are for personal organization only and Lab posts handle cross-domain linking.

---

### 7. Should Gerald (Place/) entries be granular or broad?

**Current State:** Gerald creates Place/ pages for "personally encountered travel places." Potential overlap with Tacitus/Chreia Place/ tags (e.g. `Place/Rome` referenced by Tacitus; `Place/Roman Forum` created by Gerald).

**Question:** Should Place/ namespace allow both city-level and site-level pages? Or should only one granularity exist?

**Options:**
- **A. Allow hierarchical Places.** `Place/Rome` (city) and `Place/Roman Forum` (site within Rome) can coexist. Containment relationship implied but not formalized.
- **B. Enforce single granularity.** Choose either city-level OR site-level uniformly.

**Recommendation:** **Option A** (hierarchical). This is more natural. But add guidance: "Use the finest-grained Place that merits its own page. City-level `Place/Rome` may be referenced by historical patterns; site-level `Place/Roman Forum` may be created by travel pattern. Both acceptable."

---

### 8. Should Photius "Key Ideas" section be structured or freeform?

**Current State:** Photius template describes Key Ideas as "Luhmann's literature notes—personalized, keyword-like reading records."

**Question:** Should these be tagged (e.g. `Concept/`, `Theme/`) to feed cross-domain retrieval, or remain freeform text?

**Options:**
- **A. Tag Key Ideas.** Rationale: Allows AI to surface book-specific insights via Concept/ pages.
- **B. Keep freeform.** Rationale: Key Ideas are personal reading records, not canonical concepts.

**Recommendation:** **Clarify in Photius Notes** whether Key Ideas should use inline `Concept/` or `Theme/` tags when identifying major ideas.

---

### 9. Should there be a maximum number of Tags:: per entry?

**Current State:** No guidance on tag quantity.

**Question:** Can an entry have unlimited tags, or should there be a practical limit to maintain focus?

**Options:**
- **A. No limit.** Tag everything relevant.
- **B. Soft limit** (e.g. "aim for 3-5 core tags; more than 10 suggests the entry lacks focus").

**Recommendation:** **Add guidance** to avoid over-tagging, which dilutes retrieval signal. Suggest: "Tag the 3-5 most salient cross-domain connections. If an entry requires 10+ tags, consider whether it should be split into multiple entries."

---

### 10. What is the canonical capitalization for namespace tags?

**Current State:** Templates use capitalized namespaces (`Person/`, `Concept/`, etc.) but this may be Roam convention.

**Question:** Should namespaces be capitalized or lowercase?

**Options:**
- **A. Capitalized** (current). Rationale: Clarity, looks cleaner.
- **B. Lowercase.** Rationale: Some systems prefer lowercase for tags.

**Recommendation:** **Document capitalization standard** explicitly. Current practice appears to be capitalized; codify this.

---

## CONCLUSION

This knowledge system is **fundamentally well-designed** with clear architectural principles, sophisticated Pattern boundaries, and thoughtful Structure organization. The system is **ready for AI-assisted operation** with the following corrections:

### Critical Issues (Three of Four Resolved)

1. **Question/ and Topic/ namespace design: RESOLVED**
   - Clean three-tier architecture established: Subject/ (domains), Topic/ (areas, classificatory only), Question/ (examined propositions, canonical)
   - Both Perkins and Aquinas now use Question/ for naming
   - Topic/ redefined as pure aggregation infrastructure (no authored content)
   - Status: Design complete, awaiting template implementation

2. **Word/ and Term/ namespace separation: RESOLVED**
   - Buckley (Lexicon) → Word/ for foreign loanwords
   - Safire (Glossary) → Term/ for English concept handles
   - Clean semantic separation eliminates collision
   - Status: IMPLEMENTED (entries migrated, templates updated)

3. **Book/ and Source/ boundary clarification: RESOLVED**
   - Book/ reserved for 66 biblical books only (closed set)
   - Source/ for all other sources (books, essays, podcasts, etc.)
   - Commentaries on biblical books use Source/, not Book/
   - Status: Design complete, awaiting template Notes documentation

4. **Subject/ ownership: CLARIFIED**
   - Encyclopedia only creates canonical Subject/ pages
   - Bibliography shelves and Summa domains remain structure-internal
   - Status: Design complete, awaiting Structure Notes documentation

### Should Fix (STRUCTURAL/RETRIEVAL)

5. Standardize metadata field order
6. Strengthen cross-domain tagging for support-heavy patterns
7. Sharpen Pattern boundary tests
8. Explain Confessions structure headings

### Nice to Fix (CONSISTENCY/OPTIONAL)

9. Remove Florilegium/ prefix
10. Clean up archived pattern references
11. Fix cosmetic inconsistencies (typos, Notes colon)

Once Phase 1 template updates are implemented, the system will be highly reliable for AI assistance. The remaining issues are refinements, not blockers.

**The system's greatest strengths:**
- Explicit Pattern boundary tests (excellent AI guidance)
- Block-reference architecture (prevents duplication)
- Cross-domain tagging infrastructure (enables Essay discovery)
- Thoughtful distinction between canonical and classificatory namespaces
- **Three-tier namespace architecture (Subject/Topic/Question) provides clean semantic separation**

**The system's greatest achievements during this audit:**
- **Question/ and Topic/ redesign** resolves the most significant namespace collision while creating powerful retrieval infrastructure through auto-aggregating Topic/ pages
- **Word/ and Term/ split** provides clean semantic separation between foreign loanwords and English concept handles (IMPLEMENTED)
- **Book/ and Source/ boundary** establishes crystal-clear 66-book canonical set vs. open-ended source collection (CLARIFIED)

**Priority recommendation:** Complete remaining Phase 1 documentation (Question/Topic template updates, Book/Source Notes, Subject/ Structure clarification). Three of four critical namespace issues are architecturally resolved; only documentation and template implementation remain.

---

**END OF AUDIT**
