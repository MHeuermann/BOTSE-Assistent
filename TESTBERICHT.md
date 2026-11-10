# Testbericht V4 – The Elder Scrolls True Solo Rundenassistent

**Datum:** 8. November 2026  
**Stand:** V4 (Datenformat Version 5)  
**Grundlage:** Offizielle deutsche Anleitung Version 1.0, 98 Seiten.

## Resultat

**35 von 35 Browser-Funktionstests bestanden, 0 fehlgeschlagen.** Testframework: Playwright/Chromium, mobile 390×844-Ansicht, lokale DOM-Interaktion und simulierter `localStorage`. Reproduzierbare Tests: `tests/test_v4.py`, Ergebnisse: `tests/v4_results.json`.

Geprüft wurden:

- Erste Partie mit 2 Gruppen-EP, Intro mit 1 EP.
- Tagesablauf und Tageszähler 1→2→3, Weitergehen bei offenen Häkchen, automatischer Abend-Reset genau einmal.
- Begegnungshierarchie, Konfliktbegegnung ohne automatische Schlacht, riskante Orte und Fahrende Händler.
- Schlacht-Typen/-Ziele, Gewölbe-Erkunden und mehrfaches Aktivieren.
- Rundenzähler 6 und wiederholte Übermüdungsrunden.
- Offizielle Reihenfolge des Schlachtendes.
- Schlossknacken mit Schlüsselziffer und Versuchslimit.
- Stadtaktionen, Marktplatzgrenze und Überzeugungsprobe.
- Gruppen-/persönliche/Bonus-EP, Ausgaben, Fokusmaximum und Überhang.
- Aufklärung: Himmelsscherben-EP, Zielgrenze, Keine-EP-bei-vollständiger-Niederlage, Doppelbuchungsschutz.
- Gildenunterstützung im zulässigen Zeitpunkt und einmalige Nutzung.
- Niederlage bei gescheitertem Gildenquest-Abschnitt oder am Tag 12, Übergang nach Questabschluss, Finale-Ausnahmen.
- Migration von V3-Datensätzen; lokale Speicherung über simulierten Neustart.
- iPhone-ähnliche Bildschirmansicht ohne horizontales Überlaufen.

## Service Worker

`tests/test_sw.cjs` überprüfte die Installation, zwischengespeicherte Dateien, die Aktivierung und eine Offline-Cache-Antwort **in einer isolierten Simulation** erfolgreich.

Ein **echter Browser-Offline-Neustart** wurde versucht. Die Chromium-Testumgebung verweigerte das Laden des lokalen Webservers mit `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Deshalb konnte der reale Offlinebetrieb der PWA nicht verifiziert werden.

## Nicht getestet

- Safari auf einem physischen iPhone; Installation auf dem Home-Bildschirm und Offline-Flugmodus-Test.
- Tatsächliche Spielbalancierung, sämtliche Provinz-/Quest-/Karten-Sonderfälle und offizielle Errata gegen konkrete Spielpartien (Spielkarten und Gazette-Texte sind nicht Bestandteil dieser App).
- Netz-Hosting auf einem vom Nutzer verwendeten HTTPS-Server.

## Fachliche Einschränkung

Der Rundenassistent trifft keine verbindlichen Entscheidungen aus dem Questtext. Er ist eine Checklisten-Anwendung mit Zählern und bedingten Unterabläufen. Bei Konflikten haben gemäß dem Regelbuch offizielle Errata/FAQs und Spielmaterial Vorrang vor der Anleitung (S. 10).
