/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * MAIN - Application Entry Point
 * 
 * Questo è il file principale che:
 * - Importa tutti i moduli
 * - Inizializza l'applicazione
 * - Gestisce il bootstrap
 */

// ==========================================
// IMPORTS
// ==========================================

import './config.js';
import './utils.js';

import { detectPerformanceMode } from './physics.js';
import { loadGeoJSONData } from './data.js';
import { initMapEvents, initWindowEvents, initUIEvents } from './eventHandlers.js';
import { initMiradorListeners } from './mirador.js';

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

console.log('🚀 Atlante Illustrato dei Promessi Sposi - Initialization');

detectPerformanceMode();

console.log('📡 Initializing event listeners...');
initMapEvents();
initWindowEvents();
initUIEvents();

document.addEventListener('DOMContentLoaded', () => {
  initMiradorListeners();
});

console.log('📦 Loading GeoJSON data...');
loadGeoJSONData();

console.log('✅ Application initialization complete');

// ==========================================
// EXPORT FOR DEBUGGING (optional)
// ==========================================

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 Debug mode active - exposing modules to window');
  
  import('./config.js').then(config => { window.__atlante = { config }; });
}
