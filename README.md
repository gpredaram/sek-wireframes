# SEK · Wireframes

Wireframes estáticos (HTML + CSS + JS vanilla) de los sites de SEK. Sin build, sin
framework: se sirven tal cual. En producción se despliegan en Vercel.

🔗 **Producción:** https://sek-wireframes-gpredarams-projects.vercel.app

## Estructura

```
.
├── index.html                 # índice/TOC: enlaza páginas y módulos
├── pages/
│   ├── bienvenida.html
│   ├── sek-education-group/    # SEK Education Group (menú simple 2 niveles)
│   │   └── la-institucion.html
│   └── sek-schools/            # SEK International Schools (doble menú superpuesto)
│       └── future-learning-model.html
├── modules/                   # HTMLs independientes por módulo (nombres agnósticos)
│   └── sek-<tipo>-NNN.html
├── shared/
│   ├── styles.css             # FUENTE DE VERDAD VISUAL — no duplicar estilos
│   └── wireframe.js           # JS compartido — no duplicar funciones
├── vercel.json                # estático, cleanUrls, cabeceras de caché
└── CLAUDE.md                  # reglas del proyecto (lee esto antes de generar HTML)
```

## Reglas clave

- **Nunca estilos inline** — todo en `shared/styles.css`.
- **Nunca funciones JS duplicadas** — todo en `shared/wireframe.js`.
- **Mobile-first**, 3 breakpoints: `<768px` · `768–1199px` · `≥1200px`.
- Escala de grises, sin anotaciones visibles, placeholders grises (nunca emojis).
- Importa siempre los assets compartidos según la profundidad:
  - desde `pages/<site>/`: `../../shared/`
  - desde `modules/`: `../shared/`
- Detalle completo y specs de Notion → [`CLAUDE.md`](./CLAUDE.md).

## Ver en local

Sin build. Abre `index.html` en el navegador, o sirve la carpeta con un estático:

```bash
python3 -m http.server 8000   # luego http://localhost:8000
```

## Despliegue

El repo está conectado a Vercel: **cada `push` a `main` redespliega automáticamente**.

```bash
git add -A && git commit -m "..."
git push origin main          # Vercel despliega solo
```

La URL de producción no cambia entre despliegues.
