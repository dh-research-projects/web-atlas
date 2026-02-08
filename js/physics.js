/**
 * ATLANTE ILLUSTRATO DEI PROMESSI SPOSI
 * 03 - PHYSICS SIMULATION SYSTEM
 * 
 * Contiene:
 * - Performance mode detection
 * - Physics simulation initialization
 * - Force functions (anchor, mouse repulsion)
 * - Marker position updates
 * - Mouse/touch tracking
 * - Physics enable/disable logic
 */

import {
  map, g, physicsSimulation, physicsNodes, mousePosition, isPhysicsEnabled,
  mapCenter, performanceMode, mouseStillTimer, isMouseStill, lastTouchTime,
  currentSpiderGraph, isDragging,
  setPhysicsSimulation, setPhysicsNodes, setMousePosition, setIsPhysicsEnabled,
  setMapCenter, setPerformanceMode, setMouseStillTimer, setIsMouseStill, setLastTouchTime
} from './config.js';

import { latLngToLayerPoint, throttle } from './utils.js';

// ==========================================
// PERFORMANCE MODE DETECTION
// ==========================================
export function detectPerformanceMode() {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const isSlowDevice = isMobileDevice && (isLowEnd || window.innerWidth < 768);
  
  if (isSlowDevice) {
    setPerformanceMode('low');
    console.log('Low performance mode detected');
  } else if (isMobileDevice) {
    setPerformanceMode('high');
    console.log('Mobile high performance mode');
  } else {
    setPerformanceMode('auto');
    console.log('Desktop auto performance mode');
  }
  
  return performanceMode;
}

// ==========================================
// PHYSICS SIMULATION INITIALIZATION
// ==========================================
export function initPhysicsSimulation() {
  if (physicsSimulation) {
    physicsSimulation.stop();
  }
  
  const mapSize = map.getSize();
  const newMapCenter = { x: mapSize.x / 2, y: mapSize.y / 2 };
  setMapCenter(newMapCenter);
  
  const perf = detectPerformanceMode();
  const velocityDecay = perf === 'low' ? 0.6 : 0.4;
  const alphaDecay = perf === 'low' ? 0.05 : 0.02;
  
  const simulation = d3.forceSimulation()
    .velocityDecay(velocityDecay)
    .alphaDecay(alphaDecay)
    .alphaMin(0.01)               
    .force("collision", d3.forceCollide().strength(0.8).iterations(perf === 'low' ? 2 : 3))
    .force("anchor", forceAnchor().strength(0.4))
    .force("mouse", forceMouseRepulsion().strength(perf === 'low' ? 20 : 30))
    .on("tick", updateMarkerPositions);
  
  setPhysicsSimulation(simulation);
  console.log(`🎮 Physics initialized (${perf} performance):`, mapCenter);
}

// ==========================================
// FORCE: ANCHOR (ritorno alla posizione originale)
// ==========================================
export function forceAnchor() {
  let nodes;
  let strength = 0.4;
  
  function force(alpha) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (isNaN(node.anchorX) || isNaN(node.anchorY)) {
        console.warn('Invalid anchor coordinates for', node.place);
        continue;
      }

      const dx = node.anchorX - node.x;
      const dy = node.anchorY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const forceStrength = strength * alpha;

      const maxForce = 5;
      const forceX = Math.min(maxForce, Math.max(-maxForce, dx * forceStrength));
      const forceY = Math.min(maxForce, Math.max(-maxForce, dy * forceStrength));
      
      node.vx += forceX;
      node.vy += forceY;
    }
  }
  
  force.initialize = function(_) {
    nodes = _;
  };
  
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  
  return force;
}

// ==========================================
// FORCE: MOUSE REPULSION
// ==========================================
export function forceMouseRepulsion() {
  let nodes;
  let strength = 50;
  
  function force(alpha) {
    if (mousePosition.x < -500 || mousePosition.y < -500) return;
    
    const mouseInfluenceRadius = performanceMode === 'low' ? 80 : 100;
    const forceMultiplier = performanceMode === 'low' ? 0.5 : 0.7;
    
    const attractionRadius = 50;
    const clickableRadius = 35;
    const transitionRadius = 60;
    
    let closestNode = null;
    let closestDistance = Infinity;
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = node.x - mousePosition.x;
      const dy = node.y - mousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNode = node;
      }
    }
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = node.x - mousePosition.x;
      const dy = node.y - mousePosition.y;
      const distanceSquared = dx * dx + dy * dy;
      const distance = Math.sqrt(distanceSquared);
      
      if (distanceSquared < mouseInfluenceRadius * mouseInfluenceRadius && distanceSquared > 0) {
        let repulsionStrength = strength * alpha * forceMultiplier;
        
        if (node === closestNode && distance < attractionRadius) {
          const attractionStrength = 0.2 * (1 - distance / attractionRadius);
          node.vx -= (dx / distance) * attractionStrength;
          node.vy -= (dy / distance) * attractionStrength;
          
          repulsionStrength *= 0.05;
        }
        else if (distance < clickableRadius) {
          const reductionFactor = distance < 20 ? 0.02 : 
            0.02 + 0.08 * ((distance - 20) / (clickableRadius - 20));
          repulsionStrength *= reductionFactor;
        }
        else if (distance < transitionRadius) {
          const transitionFactor = 0.1 + 0.5 * ((distance - clickableRadius) / (transitionRadius - clickableRadius));
          repulsionStrength *= transitionFactor;
        }
        else {
          repulsionStrength *= (1 - distance / mouseInfluenceRadius);
        }
        
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        node.vx += normalizedDx * repulsionStrength;
        node.vy += normalizedDy * repulsionStrength;
      }
    }
  }
  
  force.initialize = function(_) {
    nodes = _;
  };
  
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  
  return force;
}

// ==========================================
// UPDATE MARKER POSITIONS
// ==========================================
export function updateMarkerPositions() {
  if (!isPhysicsEnabled || currentSpiderGraph || !physicsNodes.length) return;
  
  g.selectAll('.city-area')
    .attr('cx', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.x || node.anchorX) : d.x;
    })
    .attr('cy', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.y || node.anchorY) : d.y;
    });
    
  g.selectAll('.city-label')
    .attr('x', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.x || node.anchorX) : d.x;
    })
    .attr('y', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.y || node.anchorY) - 5 : d.y - 5;
    });

  g.selectAll('.city-count')
    .attr('x', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.x || node.anchorX) : d.x;
    })
    .attr('y', d => {
      const node = physicsNodes.find(n => n.place === d.place);
      return node ? (node.y || node.anchorY) + 8 : d.y + 8;
    });
}

// ==========================================
// PHYSICS ENABLE/DISABLE LOGIC
// ==========================================
export function shouldUsePhysics() {
  const zoom = map.getZoom();
  const markerCount = physicsNodes.length;

  if (performanceMode === 'low' && markerCount > 10) {
    return zoom < 9;
  }

  if (zoom < 10) return true;

  if (zoom > 13) {
    return checkForActualOverlaps();
  }

  return zoom < 12;
}

export function checkForActualOverlaps() {
  const nodes = physicsNodes;
  const minDistance = 35;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].anchorX - nodes[j].anchorX;
      const dy = nodes[i].anchorY - nodes[j].anchorY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance + nodes[i].radius + nodes[j].radius) {
        return true;
      }
    }
  }
  return false;
}

// ==========================================
// MOUSE/TOUCH TRACKING
// ==========================================
export function initMouseTracking() {
  const mapContainer = map.getContainer();
  
  const mapSize = map.getSize();
  const newMousePos = { x: mapSize.x / 2, y: mapSize.y / 2 };
  setMousePosition(newMousePos);
  
  mapContainer.removeEventListener('mousemove', handleMouseMove);
  mapContainer.removeEventListener('mouseleave', handleMouseLeave);
  mapContainer.removeEventListener('touchmove', handleTouchMove);
  mapContainer.removeEventListener('touchend', handleTouchEnd);
  mapContainer.removeEventListener('touchstart', handleTouchStart);
  
  mapContainer.addEventListener('mousemove', throttle(handleMouseMove, performanceMode === 'low' ? 50 : 16));
  mapContainer.addEventListener('mouseleave', handleMouseLeave);
  
  mapContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  mapContainer.addEventListener('touchmove', throttle(handleTouchMove, performanceMode === 'low' ? 100 : 33), { passive: true });
  mapContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  console.log(`📱 Mouse/Touch tracking initialized (${performanceMode} mode):`, mousePosition);
}

export function handleMouseMove(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const newMousePos = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  setMousePosition(newMousePos);
  
  clearTimeout(mouseStillTimer);
  setIsMouseStill(false);
  
  const timer = setTimeout(() => {
    setIsMouseStill(true);
    if (physicsSimulation && isPhysicsEnabled) {
      physicsSimulation.force("mouse").strength(performanceMode === 'low' ? 8 : 12);
      physicsSimulation.alpha(0.05);
    }
  }, 300);
  setMouseStillTimer(timer);
  
  if (physicsSimulation && isPhysicsEnabled) {
    const baseStrength = performanceMode === 'low' ? 20 : 30;
    physicsSimulation.force("mouse").strength(baseStrength);
    physicsSimulation.alpha(0.2).restart();
  }
}

export function handleTouchStart(event) {
  if (event.touches.length === 1) {
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    const newMousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    setMousePosition(newMousePos);
    
    setLastTouchTime(Date.now());
    
    if (physicsSimulation && isPhysicsEnabled) {
      physicsSimulation.force("mouse").strength(performanceMode === 'low' ? 25 : 40);
      physicsSimulation.alpha(0.3).restart();
    }
  }
}

export function handleTouchMove(event) {
  if (event.touches.length === 1) {
    const now = Date.now();
    
    if (now - lastTouchTime < (performanceMode === 'low' ? 100 : 33)) {
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];
    const newMousePos = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    setMousePosition(newMousePos);
    
    setLastTouchTime(now);
    
    if (physicsSimulation && isPhysicsEnabled) {
      physicsSimulation.alpha(0.3).restart();
    }
  }
}

export function handleTouchEnd(event) {
  setTimeout(() => {
    const newMousePos = { x: -1000, y: -1000 };
    setMousePosition(newMousePos);
    
    if (physicsSimulation && isPhysicsEnabled) {
      physicsSimulation.force("mouse").strength(performanceMode === 'low' ? 20 : 30);
      physicsSimulation.alpha(0.1);
    }
  }, 200);
}

export function handleMouseLeave() {
  clearTimeout(mouseStillTimer);
  setIsMouseStill(false);
  const newMousePos = { x: -1000, y: -1000 };
  setMousePosition(newMousePos);
  
  if (physicsSimulation && isPhysicsEnabled) {
    physicsSimulation.force("mouse").strength(performanceMode === 'low' ? 20 : 30);
    physicsSimulation.alpha(0.05);
  }
}
