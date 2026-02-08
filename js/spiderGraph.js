/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 08 - SPIDER GRAPH VISUALIZATION
 * 
 * Contiene:
 * - Sorting items (sequence, page, title, type)
 * - Layout algorithms (circular, double ring, grid)
 * - Spider graph creation and display
 * - Close spider graph
 */

import {
  g, featureMap, pointMap, currentSpiderGraph, activeSpiderPlace,
  currentSpiderSort, isSpiderGraphLoading, isDragging, isZooming,
  currentActiveMarker, markersHidden, isPhysicsEnabled,
  setCurrentSpiderGraph, setActiveSpiderPlace, setIsSpiderGraphLoading,
  setIsPhysicsEnabled
} from './config.js';

import { getAvailableViewportBounds, latLngToLayerPoint, layerPointToLatLng } from './utils.js';
import { showItemCardLinked } from './itemCard.js';
import { showQuickTooltip, hideQuickTooltip, closeItemCard } from './itemCard.js';
import { updateViewportState } from './fabMenu.js';
import { showAllMarkers, createCityAreas } from './cityAreas.js';

// ==========================================
// SORTING FUNCTIONS
// ==========================================
export function sortSpiderGraphItems(items, sortType = 'sequence') {
  const sortedItems = [...items];
  switch (sortType) {
    case 'page':
      return sortedItems.sort((a, b) => (parseInt(a.page) || 0) - (parseInt(b.page) || 0));
    case 'title':
      return sortedItems.sort((a, b) => a.title.localeCompare(b.title));
    case 'type':
      return sortedItems.sort((a, b) => {
        const featureA = featureMap.get(a.sequence);
        const featureB = featureMap.get(b.sequence);
        const typeA = featureA?.properties?.type || '';
        const typeB = featureB?.properties?.type || '';
        return typeA.localeCompare(typeB);
      });
    case 'sequence':
    default:
      return sortedItems.sort((a, b) => parseFloat(a.sequence) - parseFloat(b.sequence));
  }
}

// ==========================================
// LAYOUT ALGORITHMS
// ==========================================
export function createResponsiveGridLayout(center, items, minSpacing = 25) {
  const sortedItems = sortSpiderGraphItems(items, currentSpiderSort);
  const itemCount = sortedItems.length;
  if (itemCount === 0) return [];
  
  const viewport = getAvailableViewportBounds();
  const aspectRatio = viewport.width / viewport.height;
  let cols = Math.ceil(Math.sqrt(itemCount * aspectRatio));
  let rows = Math.ceil(itemCount / cols);
  let maxCols = Math.floor(viewport.width / minSpacing);
  let maxRows = Math.floor(viewport.height / minSpacing);
  
  if (cols > maxCols) { cols = maxCols; rows = Math.ceil(itemCount / cols); }
  if (rows > maxRows) { rows = maxRows; cols = Math.ceil(itemCount / rows); }
  
  const effectiveSpacingX = Math.max(minSpacing, viewport.width / Math.max(cols, 1));
  const effectiveSpacingY = Math.max(minSpacing, viewport.height / Math.max(rows, 1));
  const spacing = Math.min(effectiveSpacingX, effectiveSpacingY);
  const totalWidth = (cols - 1) * spacing;
  const totalHeight = (rows - 1) * spacing;
  const startX = center.x - totalWidth / 2;
  const startY = center.y - totalHeight / 2;
  
  return sortedItems.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { id: item.sequence, x: startX + col * spacing, y: startY + row * spacing, data: item };
  });
}

export function createCircularLayout(center, items, radius) {
  return items.map((item, i) => {
    const angle = (2 * Math.PI * i) / items.length;
    return { 
      id: item.sequence, 
      x: center.x + radius * Math.cos(angle), 
      y: center.y + radius * Math.sin(angle), 
      data: item 
    };
  });
}

export function createDoubleRingLayout(center, items, innerRadius, outerRadius) {
  const half = Math.ceil(items.length / 2);
  return items.map((item, i) => {
    const isInner = i < half;
    const radius = isInner ? innerRadius : outerRadius;
    const count = isInner ? half : items.length - half;
    const index = isInner ? i : i - half;
    const angle = (2 * Math.PI * index) / count;
    return { 
      id: item.sequence, 
      x: center.x + radius * Math.cos(angle), 
      y: center.y + radius * Math.sin(angle), 
      data: item 
    };
  });
}

// ==========================================
// SHOW SPIDER GRAPH
// ==========================================
export function showSpiderGraph(placeName, placeData) {
  if (isSpiderGraphLoading && !isDragging) return;
  
  closeSpiderGraph();
  
  const visibleItems = placeData.items.filter(item => {
    const point = pointMap.get(item.sequence);
    return point && point.style.display !== 'none';
  });
  
  if (!visibleItems.length) return;

  setActiveSpiderPlace(placeName);
  setIsSpiderGraphLoading(true);
  createIntegratedSpiderGraph(placeName, placeData, visibleItems);
}

export function createIntegratedSpiderGraph(placeName, placeData, visibleItems) {
  const center = latLngToLayerPoint(placeData.coords);
  g.selectAll(".spider-element").remove();

  g.selectAll('.city-area')
    .filter(function() {
      return d3.select(this).attr('data-place') === placeName;
    })
    .style('opacity', 0)
    .style('pointer-events', 'none');
    
  g.selectAll('.city-label').each(function(d, i) {
    const circles = g.selectAll('.city-area').nodes();
    if (circles[i] && d3.select(circles[i]).attr('data-place') === placeName) {
      d3.select(this).style('opacity', 0);
    }
  });
  
  g.selectAll('.city-count').each(function(d, i) {
    const circles = g.selectAll('.city-area').nodes();
    if (circles[i] && d3.select(circles[i]).attr('data-place') === placeName) {
      d3.select(this).style('opacity', 0);
    }
  });

  const itemCount = visibleItems.length;
  let layout;
  if (itemCount <= 6) {
    layout = createCircularLayout(center, sortSpiderGraphItems(visibleItems), 100);
  } else if (itemCount <= 12) {
    layout = createDoubleRingLayout(center, sortSpiderGraphItems(visibleItems), 80, 140);
  } else {
    layout = createResponsiveGridLayout(center, visibleItems, 30);
  }

  const links = visibleItems.map(item => ({ source: 'center', target: item.sequence }));

  const link = g.selectAll(".spider-link")
    .data(links).enter().append("line")
    .attr("class", "spider-link spider-element")
    .attr("stroke", "#66a3ff").attr("stroke-width", 1.5).attr("stroke-opacity", 0.4)
    .attr("stroke-dasharray", "2,2");

  const viewport = getAvailableViewportBounds();
  const clusterRadius = Math.min(viewport.width, viewport.height) * 0.4;
  g.append("circle")
    .attr("class", "spider-background spider-element")
    .attr("cx", center.x).attr("cy", center.y).attr("r", clusterRadius)
    .attr("fill", "rgba(102, 163, 255, 0.1)")
    .attr("stroke", "rgba(102, 163, 255, 0.3)").attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

  const itemNodes = g.selectAll(".spider-node-item")
    .data(layout).enter().append("circle")
    .attr("class", "spider-node spider-element spider-node-item")
    .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 6)
    .attr("fill", d => {
      const point = pointMap.get(d.id);
      return point ? point.style.backgroundColor : "#66a3ff";
    })
    .attr("stroke", "#fff").attr("stroke-width", 2)
    .style("cursor", "pointer");

  const centerNodeEl = g.append("circle")
    .attr("class", "spider-node spider-element spider-node-center")
    .attr("cx", center.x).attr("cy", center.y).attr("r", 12)
    .attr("fill", "#ffa500").attr("stroke", "#ff8c00").attr("stroke-width", 3)
    .style("cursor", "pointer");

  g.append("text")
    .attr("class", "spider-center-label spider-element")
    .attr("x", center.x).attr("y", center.y + 20)
    .attr("font-size", "11px").attr("font-weight", "bold")
    .attr("fill", "#ffa500").attr("text-anchor", "middle").attr("dominant-baseline", "central")
    .text(`${placeName} (${itemCount})`);

  link
    .attr("x1", center.x).attr("y1", center.y)
    .attr("x2", d => (layout.find(n => n.id === d.target) || {x:center.x}).x)
    .attr("y2", d => (layout.find(n => n.id === d.target) || {y:center.y}).y);

  itemNodes
    .on("click", (event, d) => {
      const mapPoint = layerPointToLatLng({x: d.x, y: d.y});
      showItemCardLinked(d.data, mapPoint);
      const point = pointMap.get(d.id);
      if (point) { 
        point.classList.add('active'); 
        setTimeout(() => point.classList.remove('active'), 2000); 
      }
    })
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).transition().duration(200).attr("r", 8).attr("stroke-width", 3);
      showQuickTooltip(event, d.data.title);
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget).transition().duration(200).attr("r", 6).attr("stroke-width", 2);
      hideQuickTooltip();
    });

  centerNodeEl.on("click", () => closeSpiderGraph());

  itemNodes.style("opacity", 0).attr("r", 0).transition().delay((d,i)=>i*20).duration(200).style("opacity",1).attr("r",6);
  link.style("opacity",0).transition().delay(100).duration(200).style("opacity",0.4);
  centerNodeEl.style("opacity",0).attr("r",0).transition().duration(200).style("opacity",1).attr("r",12);

  setCurrentSpiderGraph({ placeName, nodes: layout, links });
  setTimeout(()=>{ setIsSpiderGraphLoading(false); }, 300);
  updateViewportState();
}

// ==========================================
// CLOSE SPIDER GRAPH
// ==========================================
export async function closeSpiderGraph() {
  if (currentSpiderGraph) {
    if (activeSpiderPlace) {
      g.selectAll('.city-area')
        .filter(function() {
          return d3.select(this).attr('data-place') === activeSpiderPlace;
        })
        .style('opacity', 1)
        .style('pointer-events', 'auto');
        
      g.selectAll('.city-label').each(function(d, i) {
        const circles = g.selectAll('.city-area').nodes();
        if (circles[i] && d3.select(circles[i]).attr('data-place') === activeSpiderPlace) {
          d3.select(this).style('opacity', 1);
        }
      });
      
      g.selectAll('.city-count').each(function(d, i) {
        const circles = g.selectAll('.city-area').nodes();
        if (circles[i] && d3.select(circles[i]).attr('data-place') === activeSpiderPlace) {
          d3.select(this).style('opacity', 1);
        }
      });
    }
    
    g.selectAll(".spider-element").transition().duration(200).style("opacity", 0).remove();
    setCurrentSpiderGraph(null); 
    setActiveSpiderPlace(null); 
    setIsSpiderGraphLoading(false);
    
    if (currentActiveMarker && markersHidden) {
      showAllMarkers();
      
      setTimeout(() => {
        if (!isDragging && !isZooming) {
          setIsPhysicsEnabled(true);
          createCityAreas();
        }
      }, 100);
    }
  }
  
  closeItemCard();
  updateViewportState();
}
