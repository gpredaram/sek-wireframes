# SEK Wireframes

Lee el _index de Notion antes de hacer cualquier cosa:
https://app.notion.com/p/378808081362811fb515c3b9a7d6164c

## ANTES DE GENERAR CUALQUIER HTML — OBLIGATORIO

1. Identifica a qué site pertenece la página y lee su navegación:
   - SEK Education Group → https://app.notion.com/p/37a80808136281809de4e68d689d8590
   - SEK International Schools → https://app.notion.com/p/379808081362818492ebe500bd86cc29

2. Lee siempre estos documentos:
   - Layout global → https://app.notion.com/p/37980808136281f6b6f1d7934349a623
   - Patrones de interacción → https://app.notion.com/p/37980808136281f7840fe8ffe486ac80
   - Guía visual de wireframes → https://app.notion.com/p/38080808136281628af5faa44b04f5f3

3. Importa SIEMPRE shared/styles.css y shared/wireframe.js — NUNCA escribas estilos visuales inline.
   Usa rutas **absolutas** `/shared/...` (funcionan a cualquier profundidad de carpeta,
   así reorganizar módulos en subcarpetas no rompe los estilos):

```html
<link rel="stylesheet" href="/shared/styles.css">
<script src="/shared/wireframe.js" defer></script>
```

## Estructura de archivos

```
sek-wireframes/
├── CLAUDE.md
├── shared/
│   ├── styles.css    ← FUENTE DE VERDAD VISUAL — no duplicar estilos aquí
│   └── wireframe.js  ← JS compartido — no duplicar funciones aquí
├── modules/          ← HTMLs independientes por módulo
└── pages/
    ├── sek-education-group/
    └── sek-schools/
```

## Los dos sites del proyecto

| Site | Navegación | Páginas |
|---|---|---|
| SEK Education Group | Menú simple 2 niveles | pages/sek-education-group/ |
| SEK International Schools + Colegios | Doble menú superpuesto | pages/sek-schools/ |

## Reglas críticas

- NUNCA estilos inline — todo en shared/styles.css
- NUNCA funciones JS duplicadas — todo en shared/wireframe.js
- Mobile-first con media queries · 3 breakpoints: <768px · 768-1199px · ≥1200px
- Sin anotaciones visibles · escala de grises · placeholders grises (nunca emojis)
- Nombres de módulos agnósticos
- Si algo no está claro, pregunta — no asumas
- Actualiza Notion cuando detectes cambios de spec
- Al terminar: npx vercel --prod desde la carpeta raíz

## Checklist al terminar

- [ ] ¿Has actualizado Notion si hubo cambios de spec?
- [ ] ¿Has registrado los cambios en el Changelog global?
- [ ] ⚠️ npx vercel --prod para publicar los cambios
