# Combinación

Un juego corto y sin palabras en el subte de Buenos Aires.

Te bajás de la línea A y el tren de la H sale en 10 minutos. El recorrido es uno solo, de punta a punta, y en el camino pasan cosas que casi nadie mira: un documento en el piso, una persona durmiendo en un rincón, alguien que pregunta por la línea, un artista, alguien buscando en la basura, una pelea, un vendedor con su hijo, una persona que no puede usar el ascensor, una señora a la que no le anda la tarjeta y un niño que perdió a quien lo acompañaba. Además hay un pasillo recién trapeado y una fila en el molinete.

El reloj marca cuánto falta para que salga el tren de la H y solo baja cuando perdés tiempo: ayudar cuesta 2 minutos y resbalarte, 30 segundos. Si llega a 0, el tren se va justo cuando llegás al andén y el próximo viene en 5 minutos. Si llegás con tiempo de sobra, el tren está demorado.

## Controles

- Flechas o clic para caminar.
- Espacio o clic sostenido para actuar.
- En el plano, arrastrá con el mouse por el camino correcto.
- Escape cierra lo que esté abierto o pone pausa (también P).
- R para volver a empezar.

## Créditos

- Idea, mecánica y selección de sonidos: Daiana García.
- Pixel art, programación y GUI hechos con Claude.
- Tipografías Silkscreen y VT323 (SIL Open Font License, ver `assets/fonts`).
- Preact (licencia MIT, ver `vendor/PREACT-LICENSE`).

El sitio es estático: `index.html` carga las pantallas de `dc/` con un intérprete chico (`runtime.js`). Necesita un servidor web (GitHub Pages, o `python3 -m http.server` en la carpeta): abriendo el archivo directo desde la computadora no carga.
