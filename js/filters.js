/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 05 - FILTERS & URL STATE MANAGEMENT
 * 
 * Contiene:
 * - Applicazione filtri
 * - Gestione breadcrumbs
 * - URL encoding/decoding (permalink)
 * - Page range sliders
 * - Reset filtri
 */

import {
  map, featureMap, pointMap, breadcrumbContainer, cityData, activeSpiderPlace,
  dropdownChapter, dropdownPlace, dropdownAuthor, dropdownCharacter,
  pageSliderMin, pageSliderMax, pageRangeDisplay,
  minPageNumber, maxPageNumber, currentTimeline, chapterGroupMap
} from './config.js';

import { closeSpiderGraph, showSpiderGraph } from './spiderGraph.js';
import { updateCityData, createCityAreas } from './cityAreas.js';
import { clearHighlights, updateTimelineStats } from './timeline.js';
import { updateViewportState } from './fabMenu.js';

// ==========================================
// FILTER APPLICATION
// ==========================================
export function applyFilters() {
  const selectedChapter = dropdownChapter.value;
  const selectedPlace = dropdownPlace.value;
  const selectedAuthor = dropdownAuthor.value;
  const selectedCharacter = dropdownCharacter.value;
  const minPage = parseInt(pageSliderMin.value);
  const maxPage = parseInt(pageSliderMax.value);

  closeSpiderGraph();

  const visibleChapters = new Map();

  for (const [seq, feature] of featureMap.entries()) {
    const props = feature.properties;
    const chapter = props.chapter || "Capitolo sconosciuto";
    const place = (props.place || "Luogo sconosciuto").trim().replace(/\s+/g, ' ');
    const authors = props.authors || [];
    const characters = props.characters || [];
    const pageNumber = props.page_number || 0;
    
    const matchChapter = !selectedChapter || chapter === selectedChapter;
    const matchPlace = !selectedPlace || place === selectedPlace;
    const matchAuthor = !selectedAuthor || (authors && authors.includes(selectedAuthor));
    const matchCharacter = !selectedCharacter || (characters && characters.includes(selectedCharacter));
    const matchPage = pageNumber >= minPage && pageNumber <= maxPage;

    const visible = matchChapter && matchPlace && matchAuthor && matchCharacter && matchPage;
    if (visible) visibleChapters.set(chapter, (visibleChapters.get(chapter) || 0) + 1);

    const point = pointMap.get(seq);
    if (point) point.style.display = visible ? 'block' : 'none';
  }

  for (const [chapter, group] of chapterGroupMap.entries()) {
    const hasVisiblePoints = visibleChapters.has(chapter) && visibleChapters.get(chapter) > 0;
    group.style.display = hasVisiblePoints ? 'block' : 'none';
  }

  updateCityData();
  createCityAreas();

  if (activeSpiderPlace && cityData.has(activeSpiderPlace) && cityData.get(activeSpiderPlace).visibleCount > 0) {
    setTimeout(() => { 
      const cityInfo = cityData.get(activeSpiderPlace); 
      showSpiderGraph(activeSpiderPlace, cityInfo); 
    }, 100);
  }

  clearHighlights();
  updateTimelineStats();
  map.invalidateSize();
}

export function applyFiltersAndUpdateURL() {
  applyFilters();
  updateBreadcrumbs();
  encodeFiltersToURL();
}

// ==========================================
// RESET FILTERS
// ==========================================
export function resetAllFilters() {
  dropdownChapter.value = '';
  dropdownPlace.value = '';
  dropdownAuthor.value = '';
  dropdownCharacter.value = '';
  pageSliderMin.value = minPageNumber;
  pageSliderMax.value = maxPageNumber;
  updatePageRangeDisplay();
  applyFiltersAndUpdateURL();
}

// ==========================================
// BREADCRUMB MANAGEMENT
// ==========================================
export function updateBreadcrumbs() {
  const chips = breadcrumbContainer.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.remove());
  let hasActive = false;

  if (dropdownChapter.value) { 
    addFilterChip(dropdownChapter.value, () => { 
      dropdownChapter.value=''; 
      applyFiltersAndUpdateURL(); 
    }); 
    hasActive = true; 
  }
  if (dropdownPlace.value) { 
    addFilterChip(dropdownPlace.value, () => { 
      dropdownPlace.value=''; 
      applyFiltersAndUpdateURL(); 
    }); 
    hasActive = true; 
  }
  if (dropdownAuthor.value) { 
    addFilterChip(dropdownAuthor.value, () => { 
      dropdownAuthor.value=''; 
      applyFiltersAndUpdateURL(); 
    }); 
    hasActive = true; 
  }
  if (dropdownCharacter.value) { 
    addFilterChip(dropdownCharacter.value, () => { 
      dropdownCharacter.value=''; 
      applyFiltersAndUpdateURL(); 
    }); 
    hasActive = true; 
  }

  const minPage = parseInt(pageSliderMin.value), maxPage = parseInt(pageSliderMax.value);
  if (minPage !== minPageNumber || maxPage !== maxPageNumber) {
    addFilterChip(`${minPage}-${maxPage}`, () => {
      pageSliderMin.value = minPageNumber; 
      pageSliderMax.value = maxPageNumber;
      updatePageRangeDisplay(); 
      applyFiltersAndUpdateURL();
    });
    hasActive = true;
  }
  
  breadcrumbContainer.classList.toggle('visible', hasActive);
  updateViewportState();
}

function addFilterChip(text, removeCallback) {
  const chip = document.createElement('div');
  chip.className = 'filter-chip';
  chip.innerHTML = `${text}<span class="filter-chip-remove">×</span>`;
  chip.querySelector('.filter-chip-remove').addEventListener('click', (e) => { 
    e.stopPropagation(); 
    removeCallback(); 
  });
  breadcrumbContainer.appendChild(chip);
}

// ==========================================
// URL STATE MANAGEMENT (permalink)
// ==========================================
export function encodeFiltersToURL() {
  const params = new URLSearchParams();
  if (dropdownChapter.value) params.set('chapter', dropdownChapter.value);
  if (dropdownPlace.value) params.set('place', dropdownPlace.value);
  if (dropdownAuthor.value) params.set('author', dropdownAuthor.value);
  if (dropdownCharacter.value) params.set('character', dropdownCharacter.value);
  const minPage = parseInt(pageSliderMin.value);
  const maxPage = parseInt(pageSliderMax.value);
  if (minPage !== minPageNumber || maxPage !== maxPageNumber) {
    params.set('pageMin', String(minPage));
    params.set('pageMax', String(maxPage));
  }
  if (currentTimeline) params.set('timeline', currentTimeline);
  const newURL = window.location.pathname + (params.toString() ? '#' + params.toString() : '');
  window.history.replaceState(null, '', newURL);
}

export function loadFiltersFromURL() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;
  const params = new URLSearchParams(hash);
  if (params.get('chapter')) dropdownChapter.value = params.get('chapter');
  if (params.get('place')) dropdownPlace.value = params.get('place');
  if (params.get('author')) dropdownAuthor.value = params.get('author');
  if (params.get('character')) dropdownCharacter.value = params.get('character');
  if (params.get('pageMin')) pageSliderMin.value = params.get('pageMin');
  if (params.get('pageMax')) pageSliderMax.value = params.get('pageMax');
  updatePageRangeDisplay();
  updateBreadcrumbs();

  if (params.get('timeline')) {
    const timelineType = params.get('timeline');
    setTimeout(() => {
      if (timelineType === 'promessi') {
      } else if (timelineType === 'colonna') {
      }
    }, 500);
  }
  setTimeout(() => { applyFilters(); }, 100);
}

// ==========================================
// PAGE RANGE SLIDERS
// ==========================================
export function updatePageRangeDisplay() {
  const minVal = parseInt(pageSliderMin.value);
  const maxVal = parseInt(pageSliderMax.value);
  if (minVal >= maxVal) {
    if (event && event.target === pageSliderMin) {
      pageSliderMax.value = minVal + 1;
    } else {
      pageSliderMin.value = maxVal - 1;
    }
  }
  const finalMin = parseInt(pageSliderMin.value);
  const finalMax = parseInt(pageSliderMax.value);
  pageRangeDisplay.textContent = `${finalMin} - ${finalMax}`;
}

export function initializePageSliders() {
  pageSliderMin.min = minPageNumber; 
  pageSliderMin.max = maxPageNumber; 
  pageSliderMin.value = minPageNumber;
  pageSliderMax.min = minPageNumber; 
  pageSliderMax.max = maxPageNumber; 
  pageSliderMax.value = maxPageNumber;
  updatePageRangeDisplay();
}
