const SVG = ({ children, size = 16, stroke = 'currentColor', fill = 'none', sw = '1.7' }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {children}
  </svg>
)

export const Icons = {
  logo:     <SVG size={18}><rect x="4" y="7" width="16" height="11" rx="2"/><path d="M8 7V5a4 4 0 018 0v2"/><path d="M12 12v3"/></SVG>,
  dash:     <SVG><path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/></SVG>,
  calendar: <SVG><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></SVG>,
  history:  <SVG><path d="M3 3v6h6M3.05 13A9 9 0 106 5.3L3 8"/></SVG>,
  clock:    <SVG><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></SVG>,
  users:    <SVG><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74"/></SVG>,
  settings: <SVG><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></SVG>,
  logout:   <SVG><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></SVG>,
  sun:      <SVG><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></SVG>,
  moon:     <SVG><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></SVG>,
  check:    <SVG sw="2.2"><path d="M20 6L9 17l-5-5"/></SVG>,
  x:        <SVG sw="2.2"><path d="M18 6L6 18M6 6l12 12"/></SVG>,
  plus:     <SVG sw="2.2"><path d="M12 5v14M5 12h14"/></SVG>,
  upload:   <SVG><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></SVG>,
  chart:    <SVG><path d="M18 20V10M12 20V4M6 20v-6"/></SVG>,
  shield:   <SVG><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></SVG>,
  seat:     <SVG><path d="M6 3h12v11H6z"/><path d="M4 14h16v3H4z"/><path d="M8 17v4M16 17v4"/></SVG>,
  bell:     <SVG><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></SVG>,
  search:   <SVG><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></SVG>,
  chevronR: <SVG><path d="M9 18l6-6-6-6"/></SVG>,
  chevronL: <SVG><path d="M15 18l-6-6 6-6"/></SVG>,
  info:     <SVG><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></SVG>,
  menu:     <SVG><path d="M3 12h18M3 6h18M3 18h18"/></SVG>,
  close:    <SVG sw="2"><path d="M18 6L6 18M6 6l12 12"/></SVG>,
  dot:      <SVG fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></SVG>,
  star:     <SVG><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></SVG>,
  filter:   <SVG><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></SVG>,
}

export default Icons
