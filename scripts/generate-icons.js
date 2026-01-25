#!/usr/bin/env node

/**
 * PWA 아이콘 생성 스크립트
 * 대신물류 브랜드 컬러를 사용한 심플한 트럭 아이콘
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// 디렉토리 생성
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// 브랜드 컬러
const PRIMARY = '#1a1f36';
const ACCENT = '#3b82f6';

/**
 * SVG 아이콘 생성 (심플한 물류/배송 아이콘)
 * - 둥근 사각형 배경
 * - 트럭 아이콘
 */
function generateSVG(size) {
  const padding = size * 0.15;
  const iconSize = size - padding * 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // 트럭 아이콘 비율
  const truckWidth = iconSize * 0.7;
  const truckHeight = iconSize * 0.45;
  const truckX = centerX - truckWidth / 2;
  const truckY = centerY - truckHeight / 2 + size * 0.05;
  
  // 캐빈 크기
  const cabinWidth = truckWidth * 0.3;
  const cabinHeight = truckHeight * 0.7;
  
  // 컨테이너 크기
  const containerWidth = truckWidth * 0.65;
  const containerHeight = truckHeight * 0.85;
  
  // 바퀴 크기
  const wheelRadius = truckHeight * 0.18;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${PRIMARY}"/>
  
  <!-- 컨테이너 (화물칸) -->
  <rect 
    x="${truckX}" 
    y="${truckY}" 
    width="${containerWidth}" 
    height="${containerHeight}" 
    rx="${size * 0.02}"
    fill="${ACCENT}"
  />
  
  <!-- 캐빈 (운전석) -->
  <rect 
    x="${truckX + containerWidth - size * 0.01}" 
    y="${truckY + containerHeight - cabinHeight}" 
    width="${cabinWidth}" 
    height="${cabinHeight}" 
    rx="${size * 0.02}"
    fill="white"
  />
  
  <!-- 캐빈 창문 -->
  <rect 
    x="${truckX + containerWidth + size * 0.02}" 
    y="${truckY + containerHeight - cabinHeight + size * 0.02}" 
    width="${cabinWidth * 0.6}" 
    height="${cabinHeight * 0.4}" 
    rx="${size * 0.01}"
    fill="${PRIMARY}"
    opacity="0.3"
  />
  
  <!-- 바퀴 1 (앞) -->
  <circle 
    cx="${truckX + containerWidth * 0.25}" 
    cy="${truckY + containerHeight + wheelRadius * 0.3}" 
    r="${wheelRadius}" 
    fill="white"
  />
  <circle 
    cx="${truckX + containerWidth * 0.25}" 
    cy="${truckY + containerHeight + wheelRadius * 0.3}" 
    r="${wheelRadius * 0.5}" 
    fill="${PRIMARY}"
  />
  
  <!-- 바퀴 2 (뒤) -->
  <circle 
    cx="${truckX + containerWidth + cabinWidth * 0.5}" 
    cy="${truckY + containerHeight + wheelRadius * 0.3}" 
    r="${wheelRadius}" 
    fill="white"
  />
  <circle 
    cx="${truckX + containerWidth + cabinWidth * 0.5}" 
    cy="${truckY + containerHeight + wheelRadius * 0.3}" 
    r="${wheelRadius * 0.5}" 
    fill="${PRIMARY}"
  />
  
  <!-- DS 텍스트 -->
  <text 
    x="${centerX}" 
    y="${truckY + containerHeight + wheelRadius * 2.5}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${size * 0.1}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle"
  >DS</text>
</svg>`;
}

// 192x192 아이콘 생성
const svg192 = generateSVG(192);
writeFileSync(join(iconsDir, 'icon-192.svg'), svg192);
console.log('Generated: icon-192.svg');

// 512x512 아이콘 생성
const svg512 = generateSVG(512);
writeFileSync(join(iconsDir, 'icon-512.svg'), svg512);
console.log('Generated: icon-512.svg');

console.log('\n아이콘 SVG 생성 완료!');
console.log('PNG 변환을 위해 다음 명령어를 실행하세요:');
console.log('\n# macOS에서 sips 사용:');
console.log('# 또는 온라인 도구 사용: https://svgtopng.com/');
