/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 10 - FAB MENU & PANELS
 * 
 * Contiene:
 * - FAB toggle
 * - Pannelli laterali (timeline/filters)
 * - Viewport state management
 * - Control positioning
 */

import {
  map, timeline, timelinePanel, filtersPanel, fabToggle, fabTimeline, fabFilters,
  fabContainer, breadcrumbContainer, projectLogo,
  fabOpen, currentTimeline, currentSpiderGraph, currentItemCard, chapterGroupMap,
  timelineStats, timelineGrid, btnPromessi, btnColonna, originalLogoSrc, minimizedLogoSrc,
  setFabOpen, setCurrentTimeline
} from './config.js';

import { clearHighlights } from './timeline.js';
import { encodeFiltersToURL } from './filters.js';

// ==========================================
// VIEWPORT STATE MANAGEMENT
// ==========================================
export function updateViewportState() {
  const isBusy = timeline.classList.contains('active') || 
                 currentSpiderGraph !== null || 
                 currentItemCard !== null ||
                 timelinePanel.classList.contains('visible') ||
                 filtersPanel.classList.contains('visible');
  
  const logoImg = projectLogo.querySelector('img');
  
  if (isBusy) {
    document.body.classList.add('viewport-busy');
    projectLogo.classList.add('minimized');
    fabContainer.classList.add('minimized');
    breadcrumbContainer.classList.add('logo-minimized');
    if (logoImg && logoImg.src.includes(originalLogoSrc.split('/').pop())) {
      logoImg.src = minimizedLogoSrc;
    }
  } else {
    document.body.classList.remove('viewport-busy');
    projectLogo.classList.remove('minimized');
    fabContainer.classList.remove('minimized');
    breadcrumbContainer.classList.remove('logo-minimized');
    if (logoImg && !logoImg.src.includes(originalLogoSrc.split('/').pop())) {
      logoImg.src = originalLogoSrc;
    }
  }
}

// ==========================================
// CONTROL POSITIONING
// ==========================================
export function updateControlPositions() {
  const isActive = timeline.classList.contains('active');
  const newBottom = isActive ? '320px' : '30px';
  const zoomEl = document.querySelector('.leaflet-control-zoom');
  if (zoomEl) zoomEl.style.bottom = newBottom;
  fabContainer.style.bottom = isActive ? '300px' : '20px';
  updateViewportState();
}

// ==========================================
// FAB PANELS MANAGEMENT
// ==========================================
export function closeFABPanels() {
  timelinePanel.classList.remove('visible');
  filtersPanel.classList.remove('visible');
  fabTimeline.classList.remove('active');
  fabFilters.classList.remove('active');
  updateViewportState();
}

export function closeFABCompletely() {
  if (fabOpen) {
    setFabOpen(false);
    fabToggle.classList.remove('active');
    fabTimeline.style.display = 'none';
    fabFilters.style.display = 'none';
    fabToggle.innerHTML = '&#9776;';
    closeFABPanels();
  }
}

export function toggleFAB() {
  const newFabOpen = !fabOpen;
  setFabOpen(newFabOpen);
  
  if (fabOpen) {
    fabToggle.classList.add('active');
    fabTimeline.style.display = 'flex';
    fabFilters.style.display = 'flex';
    fabToggle.innerHTML = '&#10005;';
  } else {
    fabToggle.classList.remove('active');
    fabTimeline.style.display = 'none';
    fabFilters.style.display = 'none';
    fabToggle.innerHTML = '&#9776;';
    closeFABPanels();
    
    if (timeline.classList.contains('active')) {
      timeline.classList.remove('active');
      setCurrentTimeline(null);
      chapterGroupMap.clear();
      clearHighlights();
      timelineStats.textContent = '';
      timelineGrid.innerHTML = '';
      btnPromessi.classList.remove('active');
      btnColonna.classList.remove('active');
      updateControlPositions();
      map.invalidateSize();
      encodeFiltersToURL();
    }
  }
  updateViewportState();
}

export function showTimelinePanel() {
  if (!fabOpen) return;
  const isVisible = timelinePanel.classList.contains('visible');
  const fabContainer = document.querySelector('.fab-container');
  
  filtersPanel.classList.remove('visible'); 
  fabFilters.classList.remove('active');
  
  if (fabContainer) {
    fabContainer.classList.remove('filters-open');
  }
  
  if (isVisible) { 
    timelinePanel.classList.remove('visible'); 
    fabTimeline.classList.remove('active'); 
  } else { 
    timelinePanel.classList.add('visible'); 
    fabTimeline.classList.add('active'); 
  }
  updateViewportState();
}

export function showFiltersPanel() {
  if (!fabOpen) return;
  const isVisible = filtersPanel.classList.contains('visible');
  const fabContainer = document.querySelector('.fab-container');
  
  timelinePanel.classList.remove('visible'); 
  fabTimeline.classList.remove('active');
  
  if (isVisible) { 
    filtersPanel.classList.remove('visible'); 
    fabFilters.classList.remove('active'); 
    
    if (fabContainer) {
      fabContainer.classList.remove('filters-open');
    }
  } else { 
    filtersPanel.classList.add('visible'); 
    fabFilters.classList.add('active'); 
    
    if (fabContainer) {
      fabContainer.classList.add('filters-open');
    }
  }
  updateViewportState();
}
