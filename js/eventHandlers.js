/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 12 - EVENT HANDLERS
 * 
 * Contiene:
 * - Map event handlers (drag, zoom, move)
 * - Window event handlers (resize, orientation)
 * - UI event handlers (buttons, dropdowns, sliders)
 * - Cleanup handlers
 */

import {
  map, g, fabToggle, fabTimeline, fabFilters, fabContainer,
  btnPromessi, btnColonna, btnResetFilters, projectLogo, timeline,
  dropdownChapter, dropdownPlace, dropdownAuthor, dropdownCharacter,
  pageSliderMin, pageSliderMax,
  physicsSimulation, isPhysicsEnabled, physicsNodes, animationFrameId,
  currentSpiderGraph, activeSpiderPlace, cityData, currentItemCard,
  isDragging, isZooming, pointMap, fabOpen,
  setIsDragging, setIsZooming, setMapCenter
} from './config.js';

import { throttle, latLngToLayerPoint, isMobile } from './utils.js';
import { detectPerformanceMode, initPhysicsSimulation, initMouseTracking } from './physics.js';
import { createCityAreas } from './cityAreas.js';
import { closeSpiderGraph, createIntegratedSpiderGraph } from './spiderGraph.js';
import { adjustCardPosition } from './itemCard.js';
import { toggleFAB, showTimelinePanel, showFiltersPanel, closeFABPanels, updateViewportState } from './fabMenu.js';
import { toggleTimeline, clearHighlights } from './timeline.js';
import { applyFiltersAndUpdateURL, updatePageRangeDisplay, loadFiltersFromURL, resetAllFilters } from './filters.js';

// ==========================================
// MAP EVENTS
// ==========================================
export function initMapEvents() {
  map.on('dragstart', () => {
    setIsDragging(true);
  });

  map.on('dragend', () => {
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  });

  map.on('zoomstart', () => {
    setIsZooming(true);
  });

  map.on('zoomend', () => {
    setIsZooming(false);
    
    createCityAreas();
    
    if (physicsSimulation && isPhysicsEnabled && physicsNodes.length > 0) {
      physicsNodes.forEach(node => {
        const newCenter = latLngToLayerPoint(node.data.coords);
        node.anchorX = newCenter.x;
        node.anchorY = newCenter.y;
      });
      
      physicsSimulation.alpha(0.3).restart();
    }
    
    if (currentSpiderGraph && activeSpiderPlace && cityData.has(activeSpiderPlace)) {
      const cityInfo = cityData.get(activeSpiderPlace);
      const visibleItems = cityInfo.items.filter(item => {
        const point = pointMap.get(item.sequence);
        return point && point.style.display !== 'none';
      });
      
      if (visibleItems.length > 0) {
        const center = latLngToLayerPoint(cityInfo.coords);
        g.selectAll(".spider-element").remove();
        setTimeout(() => {
          createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
        }, 50);
      }
    }
    
    if (currentItemCard && currentItemCard.linkedCenter) {
      const mapContainer = map.getContainer();
      const mapRect = mapContainer.getBoundingClientRect();
      
      if (!isMobile()) {
        const cardWidth = 320;
        const padding = 80;
        const availableWidth = window.innerWidth - cardWidth - padding * 2;
        const leftPosition = Math.max(padding, Math.min(availableWidth, mapRect.right - cardWidth - padding));
        
        currentItemCard.style.left = leftPosition + 'px';
        currentItemCard.style.top = Math.max(80, mapRect.top + 80) + 'px';
      }
      
      adjustCardPosition(currentItemCard);
    }
  });

  map.on('moveend', () => {
    createCityAreas();
    
    if (physicsSimulation && isPhysicsEnabled && physicsNodes.length > 0) {
      physicsNodes.forEach(node => {
        const newCenter = latLngToLayerPoint(node.data.coords);
        node.anchorX = newCenter.x;
        node.anchorY = newCenter.y;
      });
      
      physicsSimulation.alpha(0.2).restart();
    }
    
    if (currentSpiderGraph && activeSpiderPlace && cityData.has(activeSpiderPlace)) {
      const cityInfo = cityData.get(activeSpiderPlace);
      const visibleItems = cityInfo.items.filter(item => {
        const point = pointMap.get(item.sequence);
        return point && point.style.display !== 'none';
      });
      
      if (visibleItems.length > 0) {
        if (!isDragging && !isZooming) {
          const center = latLngToLayerPoint(cityInfo.coords);
          g.selectAll(".spider-element").remove();
          setTimeout(() => {
            createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
          }, 50);
        }
      }
    }
    
    if (currentItemCard && currentItemCard.linkedCenter) {
      const mapContainer = map.getContainer();
      const mapRect = mapContainer.getBoundingClientRect();
      
      if (!isMobile()) {
        const cardWidth = 320;
        const padding = 80;
        const availableWidth = window.innerWidth - cardWidth - padding * 2;
        const leftPosition = Math.max(padding, Math.min(availableWidth, mapRect.right - cardWidth - padding));
        
        currentItemCard.style.left = leftPosition + 'px';
        currentItemCard.style.top = Math.max(80, mapRect.top + 80) + 'px';
      }
      
      adjustCardPosition(currentItemCard);
    }
  });

  map.on('click', (e) => {
    if (!e.originalEvent.target.closest('.city-area') && 
        !e.originalEvent.target.closest('.spider-element')) {
      closeSpiderGraph();
    }
  });
}

// ==========================================
// WINDOW EVENTS
// ==========================================
export function initWindowEvents() {
  const performanceMode = detectPerformanceMode();
  
  const debouncedResize = throttle(() => {
    console.log('🔄 Window resized - updating physics and UI');
    
    if (currentSpiderGraph && activeSpiderPlace && cityData.has(activeSpiderPlace)) {
      const cityInfo = cityData.get(activeSpiderPlace);
      const visibleItems = cityInfo.items.filter(item => {
        const point = pointMap.get(item.sequence);
        return point && point.style.display !== 'none';
      });
      
      if (visibleItems.length > 0) {
        setTimeout(() => {
          createIntegratedSpiderGraph(activeSpiderPlace, cityInfo, visibleItems);
        }, 300);
      }
    }
    
    if (currentItemCard) {
      adjustCardPosition(currentItemCard);
    }
    
    if (physicsSimulation && isPhysicsEnabled) {
      const mapSize = map.getSize();
      setMapCenter({ x: mapSize.x / 2, y: mapSize.y / 2 });
      
      initMouseTracking();
      
      if (physicsNodes.length > 0) {
        physicsNodes.forEach(node => {
          const newCenter = latLngToLayerPoint(node.data.coords);
          node.anchorX = newCenter.x;
          node.anchorY = newCenter.y;
        });
        
        physicsSimulation.alpha(0.2).restart();
      }
    }
    
    updateViewportState();
  }, performanceMode === 'low' ? 300 : 150);

  window.addEventListener('resize', debouncedResize);

  window.addEventListener('orientationchange', () => {
    console.log('📱 Orientation changed');
    setTimeout(() => {
      detectPerformanceMode();
      
      if (physicsSimulation && isPhysicsEnabled) {
        initPhysicsSimulation();
        initMouseTracking();
        
        if (!currentSpiderGraph) {
          createCityAreas();
        }
      }
      
      debouncedResize();
    }, 500);
  });

  window.addEventListener('beforeunload', () => {
    if (physicsSimulation) {
      physicsSimulation.stop();
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    console.log('🧹 Physics simulation cleaned up');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (physicsSimulation && isPhysicsEnabled) {
        physicsSimulation.alpha(0.01);
        console.log('⏸️ Page hidden - reducing physics activity');
      }
    } else {
      if (physicsSimulation && isPhysicsEnabled) {
        physicsSimulation.alpha(0.3).restart();
        console.log('▶️ Page visible - reactivating physics');
      }
    }
  });

  window.addEventListener('popstate', () => {
    loadFiltersFromURL();
  });
}

// ==========================================
// UI EVENTS
// ==========================================
export function initUIEvents() {
  fabToggle.addEventListener('click', toggleFAB);
  fabTimeline.addEventListener('click', showTimelinePanel);
  fabFilters.addEventListener('click', showFiltersPanel);

  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target)) {
      if (fabOpen) {
        closeFABPanels();
      }
    }
  });

  if (btnPromessi && btnColonna) {
    btnPromessi.addEventListener('click', () => {
      toggleTimeline(chapter => !chapter.startsWith('CI_'), 'promessi');
    });

    btnColonna.addEventListener('click', () => {
      toggleTimeline(chapter => chapter.startsWith('CI_'), 'colonna');
    });
  }

  btnResetFilters.addEventListener('click', resetAllFilters);

  const logoElement = document.querySelector('.project-logo');
  const projectInfoModal = document.getElementById('project-info-modal');
  const projectInfoClose = document.getElementById('project-info-close');
  const startExploration = document.getElementById('start-exploration');
  
  if (logoElement && projectInfoModal) {
    logoElement.addEventListener('click', () => {
      projectInfoModal.classList.add('active');
    });
    
    projectInfoClose.addEventListener('click', () => {
      projectInfoModal.classList.remove('active');
    });
    
    startExploration.addEventListener('click', () => {
      projectInfoModal.classList.remove('active');
    });
    
    projectInfoModal.addEventListener('click', (e) => {
      if (e.target === projectInfoModal) {
        projectInfoModal.classList.remove('active');
      }
    });
  }

  [dropdownChapter, dropdownPlace, dropdownAuthor, dropdownCharacter].forEach(dropdown => {
    if (dropdown) {
      dropdown.addEventListener('change', applyFiltersAndUpdateURL);
    }
  });

  pageSliderMin.addEventListener('input', () => {
    updatePageRangeDisplay();
    applyFiltersAndUpdateURL();
  });

  pageSliderMax.addEventListener('input', () => {
    updatePageRangeDisplay();
    applyFiltersAndUpdateURL();
  });

  document.addEventListener('click', (e) => {
    if (!timeline.contains(e.target) && !e.target.closest('.spider-popup')) {
      clearHighlights();
    }
  });
}
