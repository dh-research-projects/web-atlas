/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 11 - MIRADOR IIIF VIEWER INTEGRATION
 * 
 * Contiene:
 * - Open Mirador viewer
 * - Close Mirador viewer
 * - Mirador configuration
 * - Event listeners
 */

import { miradorInstance, setMiradorInstance } from './config.js';

// ==========================================
// OPEN MIRADOR
// ==========================================
export function openMirador(item) {
  const manifestUrl = item.iiif_manifest;
  const canvasId = item.iiif_page_canvas_id;
  const title = item.title || 'Manoscritto';
  
  if (!manifestUrl) {
    console.error('Manifest IIIF non trovato');
    return;
  }
  
  console.log('🔍 Apertura Mirador:', manifestUrl);
  console.log('📄 Canvas pagina:', canvasId);
  
  const modal = document.getElementById('mirador-modal');
  const titleEl = document.getElementById('mirador-title');
  
  if (!modal || !titleEl) {
    console.error('Elementi modal non trovati nel DOM');
    return;
  }
  
  modal.classList.add('active');
  titleEl.textContent = title;
  
  if (miradorInstance) {
    try {
      if (miradorInstance.store && typeof miradorInstance.store.dispatch === 'function') {
        console.log('🧹 Cleaning up previous Mirador instance');
      }
    } catch (e) {
      console.warn('Could not destroy previous Mirador instance:', e);
    }
    setMiradorInstance(null);
  }

  const viewerContainer = document.getElementById('mirador-viewer');
  viewerContainer.innerHTML = '';

  const config = {
    id: 'mirador-viewer',
    
    windows: [{
      manifestId: manifestUrl,
      canvasId: canvasId,
      thumbnailNavigationPosition: 'off',
      imageToolsEnabled: true,
      imageToolsOpen: false
    }],
    
    window: {
      allowClose: false,
      allowMaximize: true,
      allowFullscreen: true,
      allowWindowSideBar: true,
      allowTopMenuButton: true,
      
      sideBarOpen: false,
      defaultSideBarPanel: 'canvas',
      sideBarOpenByDefault: false,
      
      panels: {
        info: true,
        attribution: true,
        canvas: true,
        annotations: false,
        search: false
      },
      
      views: [
        { key: 'single', behaviors: ['individuals'] },
        { key: 'book', behaviors: ['paged'] },
        { key: 'scroll', behaviors: ['continuous'] },
        { key: 'gallery' }
      ],
      defaultView: 'single',
      
      thumbnailNavigation: {
        defaultPosition: 'far-bottom',
        displaySettings: true,
        height: 130
      }
    },
    
    workspace: {
      showZoomControls: true,
      type: 'mosaic',
      allowNewWindows: false,
      isWorkspaceAddVisible: false,
      exposeModeOn: false
    },
    
    workspaceControlPanel: {
      enabled: true
    },
    
    thumbnailNavigation: {
      defaultPosition: 'far-bottom',
      height: 130
    },
    
    osdConfig: {
      gestureSettingsMouse: {
        clickToZoom: false
      },
      crossOriginPolicy: 'Anonymous',
      ajaxWithCredentials: false
    },
    
    requests: {
      preprocessors: [
        (url, options) => ({...options, mode: 'cors'})
      ]
    }
  };
  
  try {
    const instance = Mirador.viewer(config);
    setMiradorInstance(instance);
    console.log('✅ Mirador caricato con successo');
  } catch (error) {
    console.error('❌ Errore Mirador:', error);
    closeMirador();
  }
}

// ==========================================
// CLOSE MIRADOR
// ==========================================
export function closeMirador() {
  const modal = document.getElementById('mirador-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  
  if (miradorInstance) {
    const viewerContainer = document.getElementById('mirador-viewer');
    if (viewerContainer) {
      viewerContainer.innerHTML = '';
    }
    setMiradorInstance(null);
  }
  
  console.log('🔒 Mirador chiuso');
}

// ==========================================
// INIT LISTENERS
// ==========================================
export function initMiradorListeners() {
  const closeBtn = document.getElementById('mirador-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMirador);
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('mirador-modal');
      if (modal && modal.classList.contains('active')) {
        closeMirador();
      }
    }
  });
  
  console.log('🎧 Mirador listeners inizializzati');
}
