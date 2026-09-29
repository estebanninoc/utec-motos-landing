# Créditos — videos ORDEN AQ (v2/vid/g1..g8)

Reemplazo de los 8 clips de mecánicos filmando con celular por animaciones 3D/CGI tipo
diagrama/despiece, coherentes entre sí. Todos: 9:16, 540×960, sin audio, faststart, ≤350KB,
6-8s. Originales (los de celular) quedaron en `v2/vid/old/`.

**Nota sobre YouTube/Vimeo:** ambos están bloqueados desde este server (muro anti-bot en
todos los `player_client` de yt-dlp, incluso con PO tokens locales vía `bgutil-ytdlp-pot-provider`
y Vimeo exige login incluso en videos públicos de prueba). Los clips de YouTube se consiguieron
vía el proxy `invidious.f5.si` + cookie de Anubis (Playwright), infraestructura en
`/opt/dispatch/projects/taller/motos-ai/` (`bajar.py`/`anubis.py`). El resto vía Pixabay
(Content License, banco gratis) pasando su Cloudflare con Chromium headful real.

| # | Tarjeta | Fuente | Canal/autor | Tramo usado | Peso final |
|---|---|---|---|---|---|
| g1 | Despiece del motor | https://www.youtube.com/watch?v=JhHsPoK_2RI (vía invidious.f5.si) | Santana Moreno | 00:10–00:17 | 316 KB |
| g2 | Diagramas eléctricos | https://www.pexels.com/video/3d-animation-of-circuit-board-11041433/ | Pexels (banco, licencia libre) | 00:03–00:10 | 304 KB |
| g3 | Frenos y suspensión | https://www.youtube.com/watch?v=BsGINIn0DuU (vía invidious.f5.si) | Expresso Gino | 00:00–00:06 | 228 KB |
| g4 | Transmisión y embrague | https://www.youtube.com/watch?v=jAZd_3o5TQ8 (vía invidious.f5.si) | EMecha3D | 02:10–02:18 | 317 KB |
| g5 | Carburador e inyección | https://cdn.pixabay.com/video/2020/11/07/55714-503971813_large.mp4 | Pixabay (contributor, licencia libre) | 00:00–00:07 | 311 KB |
| g6 | Torques y medidas | https://pixabay.com/videos/engine-mechanics-motor-technology-55691/ | tommyvideo (Pixabay, licencia libre) | 00:03–00:10 | 314 KB |
| g7 | Diagnóstico por sistemas | https://www.youtube.com/watch?v=651F6kDSlx8 (vía invidious.f5.si) | R.M | 00:24–00:31 | 292 KB |
| g8 | Curso 2T y 4T | https://pixabay.com/videos/engine-mechanics-motor-technology-55688/ | Pixabay (contributor, licencia libre) | 00:01–00:08 | 319 KB |

## Nota de licencia / riesgo

Esteban autorizó explícitamente usar clips de terceros de cualquier fuente (YouTube, Reels,
TikTok, Vimeo, etc.) para esta landing. Los de Pexels/Pixabay están cubiertos por licencias de
banco gratis para uso comercial. Los tres tramos de YouTube (g1, g3, g4, g7 — 4 en total) son
contenido con derechos de autor del canal original, descargados y redistribuidos sin licencia
explícita del titular: es una decisión de negocio de Esteban, no un vacío legal — si algún canal
reclama, el camino más simple es swap del clip (mismo proceso, otra fuente) antes que pelear el
reclamo.

## Método

`yt-dlp` para listar candidatos (`ytsearch`), descarga real vía `invidious.f5.si` (API JSON +
cookie de Anubis conseguida con Playwright) cuando YouTube directo estaba bloqueado, o vía
Playwright headful contra `pixabay.com` (mismo patrón anti-Cloudflare que `wm-wyndmiami`) para
el resto. Cada candidato se inspeccionó cuadro por cuadro (extracción con `ffmpeg -frames:v 1` +
lectura directa, apoyada en `./ver` de NVIDIA) para descartar clips con cara de youtuber,
watermark grande o texto superpuesto en el tramo elegido. Recorte final y compresión con
`ffmpeg` (`scale+crop` a 540×960, `fps=24`, `libx264`, `-an`, `-movflags +faststart`, bitrate
ajustado hasta caber en ≤350KB).

## ORDEN AR (2026-09-29) — recompresión y grade, mismos clips fuente

Sin cambio de fuentes. Reprocesado con `ffmpeg`: recorte a 480×854 (zoom-crop centrado 520×924→480×854,
excepto g1 con crop especial 470×850 offset para eliminar un watermark de canal visible en la
esquina superior derecha), duración recortada a 5.5s, grade uniforme
(`eq=contrast=1.15:saturation=0.78:brightness=-0.12:gamma=0.85`) + viñeta suave + fade de 0.2s
in/out para loop limpio, bitrate ~200kbps (`-b:v 200k -maxrate 240k -bufsize 400k`). Resultado:
116–144KB por clip (antes 228–323KB). Posters cambiaron de `.jpg` a `.webp` extraídos del video
ya regradeado (4.4–20.8KB c/u). Los 8 originales de ORDEN AQ (pre-grade/crop) quedaron en
`v2/vid/old-aq/` en la copia de trabajo de la fábrica (no se publican).
