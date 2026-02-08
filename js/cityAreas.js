/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 07 - CITY AREAS & AGGREGATED MARKERS
 * 
 * Contiene:
 * - Update city data
 * - Creazione marker circolari aggregati
 * - Logic fisica per marker
 * - Show/hide markers
 */

import {
  map, g, cityData, pointMap, isDragging, currentSpiderGraph, physicsNodes,
  physicsSimulation, isPhysicsEnabled, mapCenter, currentActiveMarker, markersHidden,
  setPhysicsNodes, setIsPhysicsEnabled, setCurrentActiveMarker, setMarkersHidden
} from './config.js';

import { getColorForPlace, latLngToLayerPoint } from './utils.js';
import { initPhysicsSimulation, initMouseTracking, shouldUsePhysics } from './physics.js';
import { showSpiderGraph } from './spiderGraph.js';
import { showQuickTooltip, hideQuickTooltip } from './itemCard.js';

// ==========================================
// UPDATE CITY DATA
// ==========================================
export function updateCityData() {
  for (const [, data] of cityData.entries()) {
    data.visibleCount = 0;
  }
  
  const placeCounts = new Map();
  for (const [, point] of pointMap.entries()) {
    if (point.style.display !== 'none') {
      const place = point.dataset.place;
      placeCounts.set(place, (placeCounts.get(place) || 0) + 1);
    }
  }
  
  for (const [place, count] of placeCounts.entries()) {
    if (cityData.has(place)) {
      cityData.get(place).visibleCount = count;
    }
  }
}

// ==========================================
// CREATE CITY AREAS (marker circolari)
// ==========================================
export function createCityAreas() {
  if (isDragging || currentSpiderGraph) {
    return;
  }

  g.selectAll('.city-area').remove();
  g.selectAll('.city-label').remove();
  g.selectAll('.city-count').remove();

  if (cityData.size === 0) return;

  const maxItems = Math.max(...Array.from(cityData.values()).map(city => city.visibleCount), 1);
  const minRadius = 15;
  const maxRadius = 80;

  const newPhysicsNodes = [];
  const nodeData = [];

  console.log('Creating city areas - current map center:', map.getCenter());

  for (const [place, data] of cityData.entries()) {
    if (!data.visibleCount) continue;

    const center = latLngToLayerPoint(data.coords);
    const proportion = data.visibleCount / maxItems;
    const radius = minRadius + (maxRadius - minRadius) * Math.sqrt(proportion);
    const color = getColorForPlace(place);

    console.log(`${place}: geo coords (${data.coords[0]}, ${data.coords[1]}) -> screen (${center.x}, ${center.y})`);

    const physicsNode = {
      id: place,
      place: place,
      data: data,
      anchorX: center.x,
      anchorY: center.y,
      x: center.x,
      y: center.y,
      radius: radius,
      color: color,
      visibleCount: data.visibleCount
    };

    newPhysicsNodes.push(physicsNode);
    nodeData.push(physicsNode);
  }

  setPhysicsNodes(newPhysicsNodes);
  setIsPhysicsEnabled(shouldUsePhysics());

  if (isPhysicsEnabled && physicsNodes.length > 1) {
    console.log(`PHYSICS ENABLED for ${physicsNodes.length} markers at zoom ${map.getZoom()}`);
    
    if (!physicsSimulation) {
      initPhysicsSimulation();
      initMouseTracking();
    } else {
      const mapSize = map.getSize();
      const newMapCenter = { x: mapSize.x / 2, y: mapSize.y / 2 };
      mapCenter.x = newMapCenter.x;
      mapCenter.y = newMapCenter.y;
    }

    const collisionStrength = Math.min(0.9, 0.5 + (physicsNodes.length / 20));
    physicsSimulation
      .force("collision", d3.forceCollide()
        .radius(d => d.radius + 8)
        .strength(collisionStrength)
        .iterations(3))
      .nodes(physicsNodes)
      .alpha(0.5)
      .restart();
  } else {
    console.log(`PHYSICS DISABLED - zoom ${map.getZoom()}, markers: ${physicsNodes.length}`);
    
    if (physicsSimulation) {
      physicsSimulation.stop();
    }
  }

  const circles = g.selectAll('.city-area')
    .data(nodeData)
    .enter()
    .append('circle')
    .attr('class', 'city-area')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('stroke', d => d3.rgb(d.color).darker(0.8))
    .attr('stroke-width', 2)
    .attr('data-place', d => d.place)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      showSpiderGraph(d.place, d.data);
      setCurrentActiveMarker(d.place);
      hideOtherMarkers(d.place);
    })
    .on('mouseover', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('r', d.radius * 1.15)
        .attr('opacity', 0.85);
    })
    .on('mouseout', (event, d) => {
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('r', d.radius)
        .attr('opacity', 0.7);
    });

  g.selectAll('.city-label')
    .data(nodeData, d => d.id)
    .enter()
    .append('text')
    .attr('class', 'city-label')
    .attr('x', d => d.x)
    .attr('y', d => d.y - 5)
    .style('pointer-events', 'none')
    .text(d => d.place);

  g.selectAll('.city-count')
    .data(nodeData, d => d.id)
    .enter()
    .append('text')
    .attr('class', 'city-count')
    .attr('x', d => d.x)
    .attr('y', d => d.y + 8)
    .style('pointer-events', 'none')
    .text(d => `(${d.visibleCount})`);
}

// ==========================================
// SHOW/HIDE MARKERS
// ==========================================
function hideOtherMarkers(activePlace) {
  setMarkersHidden(true);
  
  g.selectAll('.city-area').each(function(d) {
    if (d && d.place !== activePlace) {
      d3.select(this)
        .classed('hidden', true)
        .style('opacity', 0);
    }
  });
  
  g.selectAll('.city-label').each(function(d) {
    if (d && d.place !== activePlace) {
      d3.select(this)
        .classed('hidden', true)
        .style('opacity', 0);
    }
  });
  
  g.selectAll('.city-count').each(function(d) {
    if (d && d.place !== activePlace) {
      d3.select(this)
        .classed('hidden', true)
        .style('opacity', 0);
    }
  });
}

export function showAllMarkers() {
  setMarkersHidden(false);
  setCurrentActiveMarker(null);
  
  g.selectAll('.city-area')
    .classed('hidden', false)
    .style('opacity', 0.7);
  
  g.selectAll('.city-label')
    .classed('hidden', false)
    .style('opacity', 1);
    
  g.selectAll('.city-count')
    .classed('hidden', false)
    .style('opacity', 1);
}
