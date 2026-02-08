/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 06 - TIMELINE MANAGEMENT
 * 
 * Contiene:
 * - Rendering timeline
 * - Toggle timeline (Promessi Sposi / Colonna Infame)
 * - Timeline stats
 * - Highlighting system per luoghi
 */

import {
  map, timeline, timelineGrid, timelineStats, chapterMap, chapterGroupMap,
  placeIndicator, currentHoveredPlace, placePointsMap, currentTimeline,
  btnPromessi, btnColonna,
  setCurrentTimeline, setCurrentHoveredPlace
} from './config.js';

import { updateControlPositions } from './fabMenu.js';
import { applyFilters, encodeFiltersToURL } from './filters.js';

// ==========================================
// TIMELINE STATS
// ==========================================
export function updateTimelineStats() {
  let visiblePoints = 0, totalChapters = 0;
  for (const [chapter, group] of chapterGroupMap.entries()) {
    if (group.style.display !== 'none') {
      totalChapters++;
      visiblePoints += group.querySelectorAll('.timeline-point:not(.hidden)').length;
    }
  }
  timelineStats.textContent = `${visiblePoints} punti • ${totalChapters} capitoli`;
}

// ==========================================
// TIMELINE RENDERING
// ==========================================
export function renderTimeline(filterFn) {
  timelineGrid.innerHTML = '';
  chapterGroupMap.clear();
  
  for (const [chapter, points] of chapterMap.entries()) {
    if (!filterFn(chapter)) continue;
    
    const group = document.createElement('div');
    group.className = 'chapter-group';
    group.dataset.chapter = chapter;

    const label = document.createElement('div');
    label.className = 'chapter-label';
    label.dataset.chapter = chapter;
    label.textContent = chapter;

    const pointsContainer = document.createElement('div');
    pointsContainer.className = 'chapter-group-points';
    points.forEach(point => pointsContainer.appendChild(point));

    group.appendChild(label);
    group.appendChild(pointsContainer);
    timelineGrid.appendChild(group);
    chapterGroupMap.set(chapter, group);
  }
  updateTimelineStats();
}

// ==========================================
// TIMELINE TOGGLE
// ==========================================
export function toggleTimeline(filterFn, key) {
  btnPromessi.classList.remove('active');
  btnColonna.classList.remove('active');
  
  const fabContainer = document.querySelector('.fab-container');
  
  if (currentTimeline === key) {
    timeline.classList.remove('active');
    timelineGrid.innerHTML = '';
    setCurrentTimeline(null);
    chapterGroupMap.clear();
    clearHighlights();
    timelineStats.textContent = '';
    
    if (fabContainer) {
      fabContainer.classList.remove('timeline-open');
    }
  } else {
    timeline.classList.add('active');
    setCurrentTimeline(key);
    if (key === 'promessi') btnPromessi.classList.add('active');
    if (key === 'colonna') btnColonna.classList.add('active');
    renderTimeline(filterFn);
    setTimeout(() => { applyFilters(); }, 200);
    
    if (fabContainer) {
      fabContainer.classList.add('timeline-open');
    }
  }
  updateControlPositions();
  map.invalidateSize();
  encodeFiltersToURL();
}

// ==========================================
// PLACE HIGHLIGHTING SYSTEM
// ==========================================
export function highlightPlacePoints(place) {
  clearHighlights();
  if (!place) return;
  setCurrentHoveredPlace(place);
  
  const points = placePointsMap.get(place) || [];
  const visiblePoints = points.filter(p => p.style.display !== 'none');
  if (visiblePoints.length < 2) return;
  
  visiblePoints.forEach(point => point.classList.add('highlighted'));
  placeIndicator.textContent = `${place} (${visiblePoints.length} punti)`;
  placeIndicator.classList.add('visible');
}

export function clearHighlights() {
  document.querySelectorAll('.timeline-point.highlighted').forEach(point => {
    point.classList.remove('highlighted', 'show-connections');
  });
  placeIndicator.classList.remove('visible');
  setCurrentHoveredPlace(null);
}
