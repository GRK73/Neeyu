# 🏛️ 니유 사진 박물관 (Neeyu Photo Museum)

400여 장의 소중한 사진들을 현대적인 감각으로 재해석한 **인터랙티브 3D 아카이브** 프로젝트입니다.

## 🚀 프로젝트 개요
사용자가 페이지에 접속할 때마다 새로운 전시를 경험할 수 있도록, 전체 이미지 중 일부를 무작위로 선별하여 화려한 3D 공간에 배치합니다. 강렬한 **레드(Red)**와 화려한 **무지개(Rainbow)** 테마를 조화시켜 시각적 몰입감을 극대화했습니다.

## ✨ 주요 기능
- **3D Circular Gallery**: WebGL(OGL)을 사용하여 구현된 입체적인 원형 갤러리. 드래그와 휠을 통해 자유롭게 탐색 가능.
- **Precise Zoom-In Animation**: 클릭한 사진이 3D 공간상의 위치와 크기를 유지하며 화면 중앙으로 부드럽게 날아와 확대되는 직관적인 인터랙션.
- **Random Curation**: '전시물 교체하기' 버튼 클릭 시 전체 데이터베이스에서 새로운 사진들을 무작위로 추출하여 실시간 업데이트.
- **Mobile Optimized**: 모바일 환경에서도 안정적인 가로 드래그와 터치 인터랙션을 지원.
- **Smooth Transitions**: 사진 교체 시 부드러운 페이드 아웃/인 효과 적용.
- **Custom Typography**: 'Cafe24 써라운드' 폰트를 적용하여 개성 있는 브랜드 아이덴티티 구축.

## 🛠 기술 스택
- **Frontend**: React (TypeScript), Vite
- **Rendering Engine**: OGL (Minimal WebGL library)
- **Styling**: Vanilla CSS (Custom Keyframes & Transitions)
- **Data Management**: JSON-based image manifest
- **Deployment Strategy**: Cloudflare Pages & R2 Object Storage

## 🎨 디자인 시스템
- **Main Color**: `#A30000` (Deep Red)
- **Accent**: `Rainbow Gradient` (Neon Glow Effect)
- **Background**: `#080808` (Dark Ambient with Red Glow)
- **Typography**: Cafe24Ssurround

## 📂 폴더 구조 및 파일 관리
- 이미지 파일들은 `public/img`에 저장되어 있으며, 중복 방지를 위해 네이밍 컨벤션이 정리됨.
- `images.json`: 전체 이미지 리스트를 관리하는 매니페스트 파일.
- `CircularGallery.tsx`: WebGL 기반의 핵심 3D 로직 포함.

---
*© 2026 Neeyu Photo Museum. Powered by Gemini CLI.*
