# Hunger in Nord-Afrika · Mobil

Eigenständiger, für Touchscreens angepasster Nachbau der historischen Landwirtschaftssimulation. Keine Originalprogrammdateien oder Originalgrafiken werden verwendet. Die EGA-inspirierte Grafik ist als SVG neu gezeichnet.

## Spielen

`dist/index.html` über einen statischen Webserver bereitstellen. Keine Installation, Abhängigkeiten oder externe Dienste erforderlich. Die veröffentlichte Version unterstützt iPhone und Android, Hoch- und Querformat, lokale Spielstände, JSON-Export und -Import sowie einen Offline-Cache nach erfolgreichem ersten Laden. Offline-Verfügbarkeit hängt vom Browser und dessen Speicherverwaltung ab.

## Rekonstruktion

Dokumentierte Mechaniken: zehn Hangfelder, Wald, Weide, Hirse, Gemüse, Geräte, Tierhandel, Schule, Terrassen, Wasserlöcher, Jahresernte und vier Startstufen. Quellen: https://gw.eduhi.at/programm/didmat/afrika.htm und https://legendarygam.es/podcast/1874/ .

Das Originalmodell liegt nicht vor. Ertragsfaktoren, Preise, Ereigniswahrscheinlichkeiten, Altersentwicklung und Verlustregeln sind eigenständig rekonstruiert. Abweichungen: Planung bis zur Ernte änderbar, Touchbedienung, Export/Import, Jahresbuch und Offline-Unterstützung. Zwei aufeinanderfolgende Mangeljahre beenden diese Version. Historische vereinfachende Annahmen sind keine Beschreibung heutiger Lebensverhältnisse.

## Technik und Prüfung

Buildloses HTML/CSS/JS. `engine.js` kapselt die Simulation mit reproduzierbarem Zufallsgenerator. `app.js` steuert Oberfläche und lokalen Speicher. `sw.js` speichert Ressourcen für Offline-Zugriff.

Prüfen: `node tests/engine.cjs` und `node tests/ui.cjs`. Der zweite Test verwendet eine DOM-Testumgebung ohne Browser und prüft keine visuelle Darstellung. Ein echter mobiler Browsertest steht noch aus.
