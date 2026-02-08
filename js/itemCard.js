/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 09 - ITEM CARDS & TOOLTIPS
 * 
 * Contiene:
 * - Show item card (direct e linked)
 * - Connection lines
 * - Quick tooltips
 * - Card positioning
 * - Close functions
 */

import {
  map, timeline, currentItemCard,
  setCurrentItemCard
} from './config.js';

import { getColorForPlace, isMobile } from './utils.js';
import { closeFABPanels, closeFABCompletely, updateControlPositions, updateViewportState } from './fabMenu.js';
import { openMirador } from './mirador.js';

// ==========================================
// QUICK TOOLTIP
// ==========================================
let quickTooltip = null;

export function showQuickTooltip(event, text) {
  hideQuickTooltip();
  quickTooltip = document.createElement('div');
  quickTooltip.className = 'quick-tooltip';
  quickTooltip.textContent = text;
  Object.assign(quickTooltip.style, {
    position: 'fixed', 
    background: 'rgba(0,0,0,0.8)', 
    color: 'white',
    padding: '5px 10px', 
    borderRadius: '4px', 
    fontSize: '12px', 
    zIndex: '3000',
    pointerEvents: 'none', 
    maxWidth: '200px', 
    left: (event.pageX + 10) + 'px', 
    top: (event.pageY - 30) + 'px'
  });
  document.body.appendChild(quickTooltip);
}

export function hideQuickTooltip() { 
  if (quickTooltip) { 
    quickTooltip.remove(); 
    quickTooltip = null; 
  } 
}

// ==========================================
// SHOW ITEM CARD (DIRECT)
// ==========================================
export function showItemCardDirect(item) {
  console.log('🎴 showItemCardDirect - Item ricevuto:', item);
  
  closeItemCard(); 
  closeFABPanels(); 
  if (isMobile()) closeFABCompletely();
  
  if (timeline.classList.contains('active')) { 
    timeline.classList.remove('active'); 
    updateControlPositions(); 
    map.invalidateSize(); 
  }

  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <h3>${item.title || 'Titolo non disponibile'}</h3>
    ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : ''}
    <div class="meta"><strong>Luogo:</strong> ${item.place || 'Non specificato'}</div>
    <div class="meta"><strong>Capitolo:</strong> ${item.chapter || 'Non specificato'}</div>
    <div class="meta"><strong>Pagina:</strong> ${item.page || 'Non specificata'}</div>
    <div class="meta"><strong>Autori:</strong> ${(item.authors && item.authors.length > 0) ? item.authors.join(', ') : 'Non specificati'}</div>
    <div class="meta"><strong>Personaggi:</strong> ${(item.characters && item.characters.length > 0) ? item.characters.join(', ') : 'Non specificati'}</div>
    <a href="${item.link || '#'}" target="_blank" class="link">Vai alla scheda</a>
    <div class="card-close" onclick="closeItemCard()">×</div>
  `;
  
  if (!isMobile()) {
    const mapRect = map.getContainer().getBoundingClientRect();
    card.style.position = 'fixed';
    card.style.right = Math.min(50, (window.innerWidth - mapRect.width) / 2 + 50) + 'px';
    card.style.top = Math.max(80, mapRect.top + 80) + 'px';
    card.style.maxWidth = '320px';
  }
  
  if (item.place) card.style.borderLeft = '4px solid ' + getColorForPlace(item.place);
  
  document.body.appendChild(card);
  
  if (item.iiif_manifest) {
    const miradorBtn = document.createElement('button');
    miradorBtn.className = 'mirador-button';
    miradorBtn.innerHTML = 'Vedi nell\'Edizione';
    miradorBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      openMirador(item);
    };
    card.appendChild(miradorBtn);
  }
  
  setCurrentItemCard(card);
  adjustCardPosition(card); 
  updateViewportState();
  setTimeout(() => document.addEventListener('click', closeItemCardOnClickOutside), 100);
}

// ==========================================
// SHOW ITEM CARD (LINKED)
// ==========================================
export function showItemCardLinked(item, mapCenter) {
  console.log('🎴 showItemCardLinked - Item ricevuto:', item);
  
  closeItemCard(); 
  closeFABPanels(); 
  if (isMobile()) closeFABCompletely();
  
  if (timeline.classList.contains('active')) { 
    timeline.classList.remove('active'); 
    updateControlPositions(); 
    map.invalidateSize(); 
  }

  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <h3>${item.title || 'Titolo non disponibile'}</h3>
    ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : ''}
    <div class="meta"><strong>Luogo:</strong> ${item.place || 'Non specificato'}</div>
    <div class="meta"><strong>Capitolo:</strong> ${item.chapter || 'Non specificato'}</div>
    <div class="meta"><strong>Pagina:</strong> ${item.page || 'Non specificata'}</div>
    <div class="meta"><strong>Autori:</strong> ${(item.authors && item.authors.length > 0) ? item.authors.join(', ') : 'Non specificati'}</div>
    <div class="meta"><strong>Personaggi:</strong> ${(item.characters && item.characters.length > 0) ? item.characters.join(', ') : 'Non specificati'}</div>
    <a href="${item.link || '#'}" target="_blank" class="link">Vai alla scheda</a>
    <div class="card-close" onclick="closeItemCard()">×</div>
  `;
  
  if (!isMobile()) {
    const mapRect = map.getContainer().getBoundingClientRect();
    const cardWidth = 320, padding = 80;
    const availableWidth = window.innerWidth - cardWidth - padding * 2;
    const leftPosition = Math.max(padding, Math.min(availableWidth, mapRect.right - cardWidth - padding));
    card.style.position = 'fixed';
    card.style.left = leftPosition + 'px';
    card.style.top = Math.max(80, mapRect.top + 80) + 'px';
    card.style.maxWidth = cardWidth + 'px';
  }
  
  card.linkedCenter = mapCenter;
  if (item.place) card.style.borderLeft = '4px solid ' + getColorForPlace(item.place);
  
  document.body.appendChild(card);
  
  if (item.iiif_manifest) {
    const miradorBtn = document.createElement('button');
    miradorBtn.className = 'mirador-button';
    miradorBtn.innerHTML = 'Vedi nell\'Edizione';
    miradorBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      openMirador(item);
    };
    card.appendChild(miradorBtn);
  }
  
  setCurrentItemCard(card);
  if (mapCenter && !isMobile()) createConnectionLine(mapCenter, card);
  adjustCardPosition(card); 
  updateViewportState();
  setTimeout(() => document.addEventListener('click', closeItemCardOnClickOutside), 100);
}

// ==========================================
// CARD POSITIONING
// ==========================================
export function adjustCardPosition(card) {
  const img = card.querySelector('img');
  const adjust = () => {
    const cardRect = card.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 20;
    if (!isMobile() && cardRect.bottom > viewportHeight - margin) {
      const newTop = Math.max(margin, viewportHeight - cardRect.height - margin);
      card.style.top = newTop + 'px';
      if (newTop < margin) {
        card.style.top = margin + 'px';
        card.style.maxHeight = (viewportHeight - margin * 2) + 'px';
      }
    }
    if (card.connectionLine && card.linkedCenter) updateConnectionLine(card);
  };
  if (img && !img.complete) { 
    img.onload = adjust; 
    img.onerror = adjust; 
    setTimeout(adjust, 500); 
  } else {
    setTimeout(adjust, 50);
  }
}

// ==========================================
// CONNECTION LINE
// ==========================================
function updateConnectionLine(card) {
  if (!card.connectionLine || !card.linkedCenter) return;
  const mapPoint = map.latLngToContainerPoint(card.linkedCenter);
  const mapRect = map.getContainer().getBoundingClientRect();
  card.connectionLine.style.left = (mapRect.left + mapPoint.x) + 'px';
  card.connectionLine.style.top = (mapRect.top + mapPoint.y) + 'px';
}

function createConnectionLine(mapCenter, card) {
  removeConnectionLine();
  const mapPoint = map.latLngToContainerPoint(mapCenter);
  const mapRect = map.getContainer().getBoundingClientRect();
  const line = document.createElement('div');
  line.className = 'connection-line';
  line.style.position = 'fixed';
  line.style.left = (mapRect.left + mapPoint.x) + 'px';
  line.style.top = (mapRect.top + mapPoint.y) + 'px';
  line.style.width = '300px';
  line.style.height = '2px';
  line.style.background = 'linear-gradient(90deg, #66a3ff, transparent)';
  line.style.zIndex = '400';
  line.style.pointerEvents = 'none';
  line.style.transformOrigin = '0 0';
  document.body.appendChild(line);
  currentItemCard.connectionLine = line;
}

function removeConnectionLine() {
  const existingLine = document.querySelector('.connection-line');
  if (existingLine) existingLine.remove();
}

// ==========================================
// CLOSE FUNCTIONS
// ==========================================
export function closeItemCard() {
  if (currentItemCard) {
    document.removeEventListener('click', closeItemCardOnClickOutside);
    removeConnectionLine();
    currentItemCard.remove();
    setCurrentItemCard(null);
    updateViewportState();
  }
}

function closeItemCardOnClickOutside(event) {
  if (currentItemCard && !currentItemCard.contains(event.target)) {
    closeItemCard();
  }
}

window.closeItemCard = closeItemCard;
