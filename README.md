# Atlante Illustrato dei Promessi Sposi

L'Atlante Illustrato è un prototipo di **WebGIS narrativo** per l’esplorazione geografica e diacronica di illustrazioni e metadati relativi a:

* *I promessi sposi* (edizione Quarantana)
* *Storia della colonna infame*

Il progetto integra **mappa interattiva**, **timeline narrativa**, **filtri avanzati** e **visualizzazione IIIF** (Mirador), con una particolare attenzione alla rappresentazione **aggregata e non riduzionista** dello spazio letterario.

---

## Funzionalità principali

* **Mappa Leaflet** con basemap CARTO
* **Aggregazione per luogo** (cerchi D3 scalati per occorrenze)
* **Simulazione fisica** (collisioni, repulsione, ancoraggio)
* **Spider graph**: esplosione di un luogo nei singoli item
* **Timeline narrativa** per capitoli e sequenze
* **Filtri** per capitolo, luogo, autore, personaggio + range di pagine
* **Permalink**: stato dell’interfaccia serializzato nell’URL
* **IIIF Viewer (Mirador)** per l’accesso diretto ai facsimili

---

## Fonte dei dati

I dati sono stati estratti dalla **Digital Library del FICLIT** (Dipartimento di Filologia Classica e Italianistica dell'Università di Bologna) tramite API REST. I metadati originali erano strutturati in formato JSON-LD.

- **API REST**: https://dlrc.ficlit.unibo.it/api/items
- **Digital Library FICLIT**: https://dlrc.ficlit.unibo.it

I dati sono stati arricchiti con metadati **IIIF (International Image Interoperability Framework)** per consentire la visualizzazione interattiva dei manoscritti attraverso il viewer Mirador. Ogni illustrazione è collegata al manifest IIIF che contiene sia l'immagine dell'illustrazione che la pagina completa del manoscritto originale.

**Standard IIIF**:
- Presentation API 2.1: [https://iiif.io/api/presentation/2.1/](https://iiif.io/api/presentation/2.1/)
- Image API 2.0: [https://iiif.io/api/image/2.0/](https://iiif.io/api/image/2.0/)

---

## Fonte testuale

Le illustrazioni fanno riferimento all'edizione:

**Titolo**: I promessi sposi ; Storia della colonna infame, inedita : storia milanese del secolo 17. scoperta e rifatta da Alessandro Manzoni

**Descrizione**: 864 p. : ill. ; 29 cm  
**Editore**: Milano : dalla Tipografia Guglielmini e Redaelli  
**Data**: 1840  
**Catalogo OPAC**: IT\ICCU\VBA\0000224  

**Scheda completa**: https://dlrc.ficlit.unibo.it/s/lib/item/232045

---

### Sistema di Fallback
Se il dataset principale non dovesse caricarsi, l'applicazione caricherà automaticamente dati di esempio per mantenere tutte le funzionalità operative.

---

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mappe**: Leaflet.js
- **Visualizzazioni**: D3.js
- **Viewer IIIF**: Mirador 3
- **Dati**: GeoJSON con metadati IIIF
- **Stile**: CSS Grid, Flexbox, Gradients

## Struttura del progetto

La seguente struttura è **quella attesa per il deploy su GitHub Pages** (repository root):

```
atlante-manzoni/
├── index.html
├── README.md
├── css/
│   ├── 01-base.css
│   ├── 02-layout.css
│   ├── 03-timeline.css
│   ├── 04-controls.css
│   ├── 05-visualization.css
│   └── 06-mirador.css
├── js/
│   ├── main.js              # entrypoint (ES module)
│   ├── config.js            # stato globale + init Leaflet
│   ├── data.js              # load e processing del GeoJSON
│   ├── eventHandlers.js     # listeners UI e mappa
│   ├── fabMenu.js           # FAB menu e pannelli
│   ├── filters.js           # filtri + breadcrumbs + permalink
│   ├── cityAreas.js         # cerchi aggregati per luogo
│   ├── physics.js           # D3 force simulation
│   ├── spiderGraph.js       # visualizzazione spider
│   ├── timeline.js          # timeline narrativa
│   ├── itemCard.js          # card item + Mirador
│   ├── mirador.js           # configurazione viewer IIIF
│   └── utils.js             # funzioni di supporto
├── data/
│   └── dl_quarantana.geojson
└── assets/
    ├── AtlanteManzoni_Logo.png
    └── AtlanteManzoni_Miniatura.png
```

---

## Installazione e Avvio

### Prerequisiti
- Server web locale (per servire i file statici)
- Browser moderno con supporto ES6+

L’applicazione carica i dati via `fetch()`; **non funziona** aprendo `index.html` con doppio click.

### Opzione A — Python

```bash
python -m http.server 8000
# apri http://localhost:8000
```

### Opzione B — VS Code Live Server

* Installa l’estensione *Live Server*
* Click destro su `index.html` → *Open with Live Server*

---

## Formato Dati

Il progetto utilizza file GeoJSON arricchiti con metadati IIIF:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "sequence": "1",
        "title": "Titolo illustrazione",
        "chapter": "Cap. I",
        "page_number": 5,
        "place": "Lecco",
        "authors": ["A. Manzoni"],
        "characters": ["Personaggio"],
        "type": "Tipo illustrazione",
        "image": "path/to/image.jpg",
        "link": "https://link-to-resource",
        "iiif_manifest": "https://dlrc.ficlit.unibo.it/iiif/2/228774/manifest",
        "iiif_canvas_id": "https://dlrc.ficlit.unibo.it/iiif/2/228774/canvas/p1",
        "iiif_page_canvas_id": "https://dlrc.ficlit.unibo.it/iiif/2/228774/canvas/p2",
        "iiif_image_service": "https://dlrc.ficlit.unibo.it/iiif/2/229451"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [9.3933, 45.8566]
      }
    }
  ]
}
```

---

## Utilizzo

### Navigazione Base
- **Zoom e Pan**: Utilizza la mappa per esplorare i territori
- **Clic sui cerchi**: Visualizza dettagli delle illustrazioni
- **Menu FAB**: Accedi a timeline e filtri dal menu in basso a sinistra

### Timeline
- **Promessi Sposi**: Visualizza capitoli del romanzo
- **Colonna Infame**: Mostra capitoli dell'opera storica
- **Punti Timeline**: Clic per dettagli rapidi

### Filtri
- **Capitoli**: Filtra per capitolo specifico
- **Luoghi**: Mostra solo elementi di un luogo
- **Autori**: Filtra per autore delle illustrazioni
- **Personaggi**: Visualizza per personaggio coinvolto
- **Range Pagine**: Seleziona intervallo di pagine

### Spider Graph
- **Clic su cerchi città**: Apre vista spider per quel luogo
- **Ordinamento**: Elementi ordinati per sequenza, pagina, titolo o tipo
- **Interazione**: Clic sui nodi per aprire card dettaglio

---

## Roadmap

- [ ] Sistema di ricerca full-text
- [ ] Export delle visualizzazioni
- [ ] Modalità presentazione
- [ ] Integrazione con database esterno
- [ ] API REST per i dati
- [ ] Versione mobile app

---

## Crediti

Progetto sviluppato utilizzando i dati della Digital Library del Dipartimento di Filologia Classica e Italianistica dell'Università di Bologna.

---

## Ringraziamenti

- [Leaflet](https://leafletjs.com/) per la libreria di mappe
- [D3.js](https://d3js.org/) per le visualizzazioni
- [Mirador](https://projectmirador.org/) per il viewer IIIF
- [IIIF Consortium](https://iiif.io/) per gli standard di interoperabilità
- [OpenStreetMap](https://www.openstreetmap.org/) per i dati cartografici
- [CartoDB](https://carto.com/) per i tile della mappa
- Digital Library FICLIT per l'accesso ai dati IIIF
