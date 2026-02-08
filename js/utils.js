/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 02 - UTILITY FUNCTIONS
 * 
 * Contiene:
 * - Funzioni helper generali
 * - Conversioni coordinate
 * - Gestione colori
 * - Throttle/debounce
 * - Viewport utilities
 * - Mobile detection
 */

import { map, colorPalette, placeColorMap, placeIndex, setPlaceIndex } from './config.js';

// ==========================================
// THROTTLE FUNCTION
// ==========================================
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ==========================================
// COLOR MANAGEMENT
// ==========================================
export function getColorForPlace(place) {
  if (!placeColorMap.has(place)) {
    placeColorMap.set(place, colorPalette[placeIndex % colorPalette.length]);
    setPlaceIndex(placeIndex + 1);
  }
  return placeColorMap.get(place);
}

// ==========================================
// VIEWPORT UTILITIES
// ==========================================
export function getAvailableViewportBounds() {
  const mapContainer = map.getContainer();
  const mapBounds = mapContainer.getBoundingClientRect();
  const marginPercent = 0.1;
  const horizontalMargin = mapBounds.width * marginPercent;
  const verticalMargin = mapBounds.height * marginPercent;
  return {
    width: mapBounds.width - (horizontalMargin * 2),
    height: mapBounds.height - (verticalMargin * 2),
    centerX: mapBounds.width / 2,
    centerY: mapBounds.height / 2,
    left: horizontalMargin,
    top: verticalMargin
  };
}

// ==========================================
// COORDINATE CONVERSION
// ==========================================
export function latLngToLayerPoint(latlng) {
  return map.latLngToLayerPoint(L.latLng(latlng));
}

export function layerPointToLatLng(point) {
  return map.layerPointToLatLng(L.point(point.x, point.y));
}

// ==========================================
// MOBILE DETECTION
// ==========================================
export function isMobile() {
  return window.innerWidth <= 768;
}

// ==========================================
// ERROR DISPLAY
// ==========================================
export function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <h3>⚠️ Errore</h3>
    <p>${message}</p>
    <button onclick="this.parentElement.remove()">OK</button>
  `;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 5000);
}
