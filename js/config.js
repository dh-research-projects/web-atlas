/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 01 - CONFIGURATION & GLOBAL STATE
 * 
 * Contiene:
 * - Variabili globali condivise
 * - Riferimenti DOM
 * - Configurazione colori e palette
 * - State management flags
 */

// ==========================================
// LEAFLET MAP INSTANCE
// ==========================================
export const map = L.map('map', { zoomControl: false }).setView([45.5, 9.3], 8);

export const zoomControl = L.control.zoom({ position: 'bottomright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// ==========================================
// D3 SVG LAYER
// ==========================================
export const svg = d3.select(map.getPanes().overlayPane).append("svg").style("overflow", "visible");
export const g = svg.append("g").attr("class", "leaflet-zoom-hide");

// ==========================================
// DATA STRUCTURES
// ==========================================
export const featureMap = new Map();
export const chapterMap = new Map();
export const chapterGroupMap = new Map();
export const pointMap = new Map();
export const placePointsMap = new Map();
export const cityData = new Map();

// ==========================================
// DOM REFERENCES
// ==========================================
export const timeline = document.getElementById('timeline');
export const timelineGrid = document.getElementById('timeline-grid');
export const timelineStats = document.getElementById('timeline-stats');
export const placeIndicator = document.getElementById('place-indicator');
export const fabContainer = document.getElementById('fab-container');
export const breadcrumbContainer = document.getElementById('breadcrumb-container');
export const projectLogo = document.getElementById('project-logo');

export const fabToggle = document.getElementById('fab-toggle');
export const fabTimeline = document.getElementById('fab-timeline');
export const fabFilters = document.getElementById('fab-filters');
export const timelinePanel = document.getElementById('timeline-panel');
export const filtersPanel = document.getElementById('filters-panel');
export const btnPromessi = document.getElementById('btnPromessi');
export const btnColonna = document.getElementById('btnColonna');
export const btnResetFilters = document.getElementById('btnResetFilters');

export const dropdownChapter = document.getElementById('dropdown-chapter');
export const dropdownPlace = document.getElementById('dropdown-place');
export const dropdownAuthor = document.getElementById('dropdown-author');
export const dropdownCharacter = document.getElementById('dropdown-character');

export const pageSliderMin = document.getElementById('page-slider-min');
export const pageSliderMax = document.getElementById('page-slider-max');
export const pageRangeDisplay = document.getElementById('page-range-display');

// ==========================================
// APPLICATION STATE
// ==========================================
export let currentTimeline = null;
export let sortedFeatures = [];
export let fabOpen = false;
export let currentHoveredPlace = null;
export let currentSpiderGraph = null;
export let currentItemCard = null;
export let activeSpiderPlace = null;
export let isProjectInfoOpen = false;
export let currentSpiderSort = 'sequence';
export let isSpiderGraphLoading = false;
export let isDragging = false;
export let isZooming = false;

export let markersHidden = false;
export let currentActiveMarker = null;

// ==========================================
// PHYSICS STATE
// ==========================================
export let physicsSimulation = null;
export let physicsNodes = [];
export let mousePosition = { x: -1000, y: -1000 };
export let isPhysicsEnabled = true;
export let animationFrameId = null;
export let mapCenter = { x: 0, y: 0 };
export let lastTouchTime = 0;
export let performanceMode = 'auto';

export let mouseStillTimer = null;
export let isMouseStill = false;

// ==========================================
// MIRADOR STATE
// ==========================================
export let miradorInstance = null;

// ==========================================
// LOGO ASSETS
// ==========================================
export let originalLogoSrc = 'assets/AtlanteManzoni_Logo.png';
export let minimizedLogoSrc = 'assets/AtlanteManzoni_Miniatura.png';

// ==========================================
// PAGE RANGE
// ==========================================
export let minPageNumber = 0;
export let maxPageNumber = 1000;

// ==========================================
// COLOR PALETTE
// ==========================================
export const colorPalette = [
  '#b3ecff', '#99d6ff', '#80bfff', '#66a3ff', '#4d88ff',
  '#3366ff', '#1a53ff', '#0040ff', '#0033cc', '#001a80'
];

export const placeColorMap = new Map();
export let placeIndex = 0;

// ==========================================
// STATE SETTERS (per permettere modifiche da altri moduli)
// ==========================================
export function setCurrentTimeline(value) { currentTimeline = value; }
export function setSortedFeatures(value) { sortedFeatures = value; }
export function setFabOpen(value) { fabOpen = value; }
export function setCurrentHoveredPlace(value) { currentHoveredPlace = value; }
export function setCurrentSpiderGraph(value) { currentSpiderGraph = value; }
export function setCurrentItemCard(value) { currentItemCard = value; }
export function setActiveSpiderPlace(value) { activeSpiderPlace = value; }
export function setIsProjectInfoOpen(value) { isProjectInfoOpen = value; }
export function setCurrentSpiderSort(value) { currentSpiderSort = value; }
export function setIsSpiderGraphLoading(value) { isSpiderGraphLoading = value; }
export function setIsDragging(value) { isDragging = value; }
export function setIsZooming(value) { isZooming = value; }
export function setMarkersHidden(value) { markersHidden = value; }
export function setCurrentActiveMarker(value) { currentActiveMarker = value; }
export function setPhysicsSimulation(value) { physicsSimulation = value; }
export function setPhysicsNodes(value) { physicsNodes = value; }
export function setMousePosition(value) { mousePosition = value; }
export function setIsPhysicsEnabled(value) { isPhysicsEnabled = value; }
export function setAnimationFrameId(value) { animationFrameId = value; }
export function setMapCenter(value) { mapCenter = value; }
export function setLastTouchTime(value) { lastTouchTime = value; }
export function setPerformanceMode(value) { performanceMode = value; }
export function setMouseStillTimer(value) { mouseStillTimer = value; }
export function setIsMouseStill(value) { isMouseStill = value; }
export function setMiradorInstance(value) { miradorInstance = value; }
export function setMinPageNumber(value) { minPageNumber = value; }
export function setMaxPageNumber(value) { maxPageNumber = value; }
export function setPlaceIndex(value) { placeIndex = value; }
