# eez - Real-Time Collaborative Messaging Design Guidelines

## Design Approach

**Reference-Based with Custom Theming**: Drawing from Slack's messaging structure and Discord's presence indicators, enhanced with a distinctive water-inspired aesthetic featuring glass-morphism, transparency layers, and fluid motion.

## Core Design Principles

1. **Transparency & Depth**: Multi-layer glass-morphism with blur effects creating depth perception
2. **Fluid Motion**: Gentle, wave-like animations and ripple effects for interactions
3. **Clarity Through Contrast**: Transparent elements balanced with clear hierarchy despite the ethereal aesthetic

---

## Typography System

**Font Stack**: Inter for UI elements, JetBrains Mono for code/collaborative editing

**Hierarchy**:
- App Title/Headers: text-2xl font-semibold
- Message Sender Names: text-sm font-medium
- Message Content: text-base font-normal
- Timestamps/Meta: text-xs font-normal
- Collaborative Editor: text-lg font-mono

**Line Height**: leading-relaxed for messages, leading-normal for UI elements

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-4, m-6, gap-8, etc.)

**Core Layout Structure**:
```
├── Sidebar (w-64): User presence, channels
├── Main Chat Area (flex-1): Message stream
└── Collaborative Editor Panel (w-96, collapsible)
```

**Container Constraints**:
- Sidebar: Fixed 256px width with backdrop-blur
- Message bubbles: max-w-2xl for readability
- Editor panel: 384px when expanded, hidden when collapsed

---

## Component Library

### Primary Components

**Navigation Sidebar**:
- Glass-morphism panel with backdrop-blur-xl
- User avatars with online status indicators (ring effects)
- Active channel highlights with subtle glow
- Floating dividers between sections

**Message Bubbles**:
- Transparent containers with backdrop-blur-md
- Sender avatar on left (w-8 h-8 rounded-full)
- Nested thread indicators with connecting lines
- Hover state reveals timestamp and actions

**Live Typing Indicators**:
- Real-time character display in semi-transparent preview bubble
- Animated ellipsis for users starting to type
- Multiple user typing shown with stacked indicators
- Ripple animation when new character appears

**Collaborative Editor**:
- Full-height panel with glass background
- User cursors with name tags (different subtle variations)
- Real-time character insertion highlights
- Line numbers in sidebar (text-xs opacity-60)

**Presence Indicators**:
- Online users list with avatars (grid-cols-8 on header)
- Status dots (w-3 h-3) with pulse animation
- "Currently typing" section with user names

### Interactive Elements

**Message Input**:
- Floating glass-morphism bar at bottom
- Auto-expanding textarea (min-h-12, max-h-32)
- Send button with water droplet icon
- Attachment options in icon toolbar

**Thread Replies**:
- Indented with border-l-2 connecting line
- Collapsed by default, expand on click
- Thread count badge in corner

**Navigation Tabs**:
- Pills with glass effect for active state
- Smooth transition between Chat/Edit modes
- Underline indicator for active view

---

## Interaction Patterns

**Animations** (subtle and purposeful):
- Message entry: Fade in from bottom with slight scale (0.95 to 1)
- Typing ripple: Gentle wave effect when new characters appear
- Presence updates: Pulse animation for status changes
- Panel transitions: Slide + fade for editor show/hide

**Scroll Behavior**:
- Smooth scroll with momentum
- Auto-scroll to bottom on new messages
- Scroll-to-top button appears after 10+ messages

**Real-Time Feedback**:
- Character-by-character appears in 50ms intervals
- Cursor position synced every 100ms in collaborative mode
- Message delivery confirmation (subtle checkmark fade-in)

---

## Responsive Breakpoints

**Desktop (1024px+)**: Three-panel layout (sidebar + chat + editor)
**Tablet (768px-1023px)**: Two-panel with collapsible sidebar
**Mobile (<768px)**: Single panel with slide-over navigation, stacked editor view

---

## Accessibility

- Focus indicators with visible outline (ring-2)
- Keyboard shortcuts (Cmd+K for quick navigation, Escape to close panels)
- ARIA labels for all interactive elements
- Screen reader announcements for new messages
- High contrast mode support maintaining glass effects
- Minimum touch target: 44x44px for all buttons

---

## Images

**Hero/Empty State**: Abstract water photography with light refracting through ripples, positioned as background for empty channel state (full container, opacity-20)

**User Avatars**: Circular placeholders with initials, uploaded images displayed with ring border

**Attachment Previews**: Thumbnail cards with glass container, max-h-32

No large hero section needed - this is a functional messaging application focused on the chat interface.