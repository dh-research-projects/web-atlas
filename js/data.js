/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 04 - DATA LOADING & PROCESSING
 * 
 * Contiene:
 * - Caricamento GeoJSON
 * - Processing features
 * - Popolamento dropdown
 * - Demo data fallback
 */

import {
  map, featureMap, chapterMap, pointMap, placePointsMap, cityData,
  dropdownChapter, dropdownPlace, dropdownAuthor, dropdownCharacter,
  timeline, setSortedFeatures, setMinPageNumber, setMaxPageNumber
} from './config.js';

import { getColorForPlace, showError } from './utils.js';
import { updateCityData, createCityAreas } from './cityAreas.js';
import { initializePageSliders } from './filters.js';
import { loadFiltersFromURL } from './filters.js';
import { closeSpiderGraph } from './spiderGraph.js';
import { showItemCardDirect } from './itemCard.js';
import { clearHighlights, highlightPlacePoints } from './timeline.js';
import { closeFABCompletely, updateControlPositions } from './fabMenu.js';

// ==========================================
// DATA LOADING
// ==========================================
export function loadGeoJSONData() {
  fetch('data/dl_quarantana.geojson')
    .then(response => {
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      processGeoJSONData(data);
    })
    .catch(error => {
      console.error('Errore nel caricamento del file GeoJSON:', error);
      showError('Impossibile caricare il file GeoJSON. Utilizzo dati demo per testare l\'applicazione.');
      loadDemoData();
    });
}

// ==========================================
// DEMO DATA (fallback)
// ==========================================
function loadDemoData() {
  const demoData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "sequence": "1",
          "title": "Demo: Il paese di Lecco",
          "chapter": "Cap. I",
          "page_number": 1,
          "place": "Lecco",
          "authors": ["A. Manzoni"],
          "characters": ["Don Abbondio"],
          "type": "Frontespizio",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.3933, 45.8566]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "2",
          "title": "Demo: La casa di Lucia",
          "chapter": "Cap. II",
          "page_number": 12,
          "place": "Lecco",
          "authors": ["A. Manzoni"],
          "characters": ["Lucia Mondella", "Agnese"],
          "type": "Capolettera",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.3933, 45.8566]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "3",
          "title": "Demo: Milano - L'Innominato",
          "chapter": "Cap. XX",
          "page_number": 267,
          "place": "Milano",
          "authors": ["A. Manzoni"],
          "characters": ["Innominato"],
          "type": "Altre illustrazioni",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.1900, 45.4642]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "4",
          "title": "Demo: Bergamo",
          "chapter": "Cap. XV",
          "page_number": 189,
          "place": "Bergamo",
          "authors": ["A. Manzoni"],
          "characters": ["Renzo Tramaglino"],
          "type": "Intestazione",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.6696, 45.6983]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "sequence": "5",
          "title": "Demo: La Colonna Infame",
          "chapter": "CI_Cap. I",
          "page_number": 1,
          "place": "Milano",
          "authors": ["A. Manzoni"],
          "characters": ["Piazza, Guglielmo"],
          "type": "Altre illustrazioni",
          "image": "",
          "link": "#"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [9.1900, 45.4642]
        }
      }
    ]
  };
  
  processGeoJSONData(demoData);
}

// ==========================================
// PROCESS GEOJSON DATA
// ==========================================
export function processGeoJSONData(data) {
  console.log('Processing GeoJSON data:', data);
  
  if (!data.features || data.features.length === 0) {
    throw new Error('No features found in GeoJSON');
  }
  
  const sorted = data.features.sort(
    (a, b) => Number(a.properties.sequence) - Number(b.properties.sequence)
  );
  setSortedFeatures(sorted);

  const chapterSet = new Set();
  const placeSet = new Set();
  const authorSet = new Set();
  const characterSet = new Set();
  let pageNumbers = [];

  sorted.forEach((feature, i) => {
    const props = feature.properties;
    const baseCoords = feature.geometry.coordinates.slice().reverse();
    const sequence = String(props.sequence);
    const chapter = props.chapter || "Capitolo sconosciuto";
    const place = props.place || "Luogo sconosciuto";
    const authors = props.authors || [];
    const characters = props.characters || [];
    const pageNumber = props.page_number || 0;

    chapterSet.add(chapter);
    placeSet.add(place);
    authors.forEach(author => authorSet.add(author));
    characters.forEach(character => characterSet.add(character));
    if (pageNumber > 0) pageNumbers.push(pageNumber);

    featureMap.set(sequence, feature);

    if (!cityData.has(place)) {
      cityData.set(place, {
        coords: baseCoords,
        items: [],
        visibleCount: 0
      });
    }
    
    const cityInfo = cityData.get(place);
    const item = {
      sequence: sequence,
      title: props.title || "Senza titolo",
      chapter: chapter,
      page: props.page_number || "?",
      place: place,
      authors: authors,
      characters: characters,
      image: props.image || "",
      link: props.link || "#",
      iiif_manifest: props.iiif_manifest || null,
      iiif_canvas_id: props.iiif_canvas_id || null,
      iiif_page_canvas_id: props.iiif_page_canvas_id || null,
      iiif_image_service: props.iiif_image_service || null,
      iiif_page_image_service: props.iiif_page_image_service || null
    };
    
    cityInfo.items.push(item);

    const color = getColorForPlace(place);
    const point = document.createElement('div');
    point.className = 'timeline-point';
    point.title = `${props.title} (pag. ${props.page_number})`;
    point.dataset.sequence = sequence;
    point.dataset.chapter = chapter;
    point.dataset.place = place;
    point.style.backgroundColor = color;

    point.addEventListener('click', (e) => {
      e.stopPropagation();
      clearHighlights();
      closeSpiderGraph();
      
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        closeFABCompletely();
      }
      
      if (timeline.classList.contains('active')) {
        timeline.classList.remove('active');
        updateControlPositions();
        map.invalidateSize();
      }
      
      const cityInfo = cityData.get(place);
      if (cityInfo) {
        const center = L.latLng(cityInfo.coords);
        map.setView(center, 13);
      }
      
      setTimeout(() => {
        showItemCardDirect(item);
      }, 300);
      
      point.classList.add('active');
      setTimeout(() => point.classList.remove('active'), 2000);
    });

    let hoverTimeout;
    point.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        highlightPlacePoints(place);
      }, 300);
    });
    
    point.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      setTimeout(() => {
        const currentHovered = point.dataset.place;
        if (currentHovered === place && !point.matches(':hover')) {
          clearHighlights();
        }
      }, 200);
    });

    if (!chapterMap.has(chapter)) {
      chapterMap.set(chapter, []);
    }
    chapterMap.get(chapter).push(point);
    pointMap.set(sequence, point);

    if (!placePointsMap.has(place)) {
      placePointsMap.set(place, []);
    }
    placePointsMap.get(place).push(point);
  });

  if (pageNumbers.length > 0) {
    setMinPageNumber(Math.min(...pageNumbers));
    setMaxPageNumber(Math.max(...pageNumbers));
  }

  updateCityData();
  createCityAreas();

  // Populate dropdowns
  Array.from(chapterSet).sort().forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    dropdownChapter.appendChild(opt);
  });

  Array.from(placeSet).sort().forEach(pl => {
    const opt = document.createElement('option');
    opt.value = pl;
    opt.textContent = pl;
    dropdownPlace.appendChild(opt);
  });

  Array.from(authorSet).sort().forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    dropdownAuthor.appendChild(opt);
  });

  Array.from(characterSet).sort().forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    dropdownCharacter.appendChild(opt);
  });

  initializePageSliders();

  console.log('Mappa geosemiotica caricata con successo:', {
    features: sorted.length,
    chapters: chapterSet.size,
    places: placeSet.size,
    authors: authorSet.size,
    characters: characterSet.size,
    cities: cityData.size,
    pageRange: `${Math.min(...pageNumbers)} - ${Math.max(...pageNumbers)}`
  });

  loadFiltersFromURL();
}
