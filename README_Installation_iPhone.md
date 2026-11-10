# The Elder Scrolls – True-Solo-Rundenassistent V4

**Grundlage:** offizielle deutsche Anleitung *The Elder Scrolls: Betrayal of the Second Era*, Version 1.0, insbesondere S. 13, 34–51, 57–65, 69–70, 74–84 und 86. Dies ist eine **inoffizielle, manuell bediente Spielhilfe**, keine automatische Regelauswertung.

## Auf dem iPhone installieren

1. `Second_Era_iPhone_App_V4.zip` entpacken.
2. Alle Dateien aus dem App-Ordner gemeinsam auf einen Webserver mit **HTTPS** hochladen (z. B. GitHub Pages, Netlify oder eigener Webspace). Dateien und Ordnerstruktur beibehalten.
3. Die HTTPS-Adresse auf dem iPhone in **Safari** aufrufen.
4. Über **Teilen → Zum Home-Bildschirm** die App hinzufügen.
5. Die Web-App einmal vollständig mit Netzwerk laden. Danach sollte sie mit dem Offline-Cache auch ohne Netz funktionieren. **Der reale Offlinebetrieb auf einem iPhone wurde hier nicht getestet.**

Die ZIP kann **nicht direkt als native iOS-App installiert** werden. Die Datei `Second_Era_Rundenassistent_V4_Standalone.html` ist eine vereinfachte Browser-Testfassung und keine vollständig installierbare PWA.

## App verwenden

- Der Tagesablauf folgt **Morgenphase → Provinzphase → Begegnungsphase → Belohnungsphase → Abendphase**. In der Provinzphase: erste passende Begegnung der offiziellen Hierarchie auswählen und dann nach dem Text entscheiden, ob ein friedlicher Ausgang oder eine Schlacht stattfindet.
- **Offene Checkboxen dürfen übersprungen werden.** Der Assistent bestätigt damit keine Spielhandlung. In der Abendphase: Wenn alles abgehakt wurde, erfolgt der Tageswechsel automatisch; andernfalls über **Tag abschließen** mit Bestätigung.
- **Schlacht**: Im Schlacht-Tab den Typ und das Ziel nach Karte/Gazette auswählen, Schlacht aufbauen, Schlachtrunden und ggf. einzelne Aktivierungen wiederholen. Der Rundenzähler endet bei der Übermüdungsrunde 6 und bleibt dort, auch wenn die nächste Runde beginnt.
- **Schlossknacken**: Typ und maximale Versuche von der Zahlenschloss-Karte übernehmen. Der Assistent würfelt nicht automatisch.
- **Belohnungen**: Normale EP erhöhen Gruppen-EP und persönliche gesparte EP; Bonus-EP nur die persönlichen EP. Bei Aufklärung können Scherben-EP gesondert gebucht werden, auch bei gescheiterter Begegnung, solange mindestens ein Abenteurer unbesiegt ist. Gesparte EP werden am Ende der Belohnungsphase auf maximal 3 begrenzt, überschüssige EP soweit möglich 1:1 in Fokus umgewandelt.
- **Gildenunterstützung**: Einmal je Kampagne, nur Partie 1/2 und nur in Schlacht oder während Rasten. Im **EP & Fokus**-Tab auslösen. Die physischen Spielhandlungen müssen selbst durchgeführt werden.
- **Kampagnenende**: Bei gescheitertem Gildenquest-Abschnitt oder erfolgloser Gildenquest bis zum Ende von Tag 12 zeigt die App eine Niederlage (soweit keine Quest-Ausnahme greift). Bei erfolgreicher Gildenquest entfällt die Abendphase.

## Bestehende V2-/V3-Spielstände

Die App behält den alten lokalen Speicherschlüssel und wandelt die bekannten V2/V3-Datenformate beim Laden um, **wenn V4 unter derselben Webadresse und im selben Browserspeicher wie die vorige Version gestartet wird**. Dabei bleiben Tageszahl, EP, Notizen und die vorhandenen Checkboxdaten soweit möglich erhalten. Bevor du ein Update installierst, exportiere den bestehenden Spielstand:

**Regeln → Spielstand exportieren.** Danach in V4 bei Bedarf **Spielstand importieren**.

Eine andere Domain, ein anderes Safari-Profil oder die zum Home-Bildschirm hinzugefügte App können voneinander getrennte Speicherbereiche verwenden. Die App synchronisiert keine Daten. Das Löschen von Websitedaten kann Spielstände entfernen.

## Dateien

- `index.html`, `styles.css`, `app.js`: Benutzeroberfläche und komplette Logik.
- `sw.js`: Service Worker für Offline-Cache.
- `manifest.webmanifest`, `icon-*`, `icon.svg`: Installationsmetadaten und Symbole.
- `TESTBERICHT.md`, `REGELABGLEICH_V4.md`: Prüfung und Regelintegration.
- `tests/test_v4.py`, `tests/test_sw.cjs`, `tests/v4_results.json`: reproduzierbare automatisierte Tests.

## Wichtig zu den Regeln

Die App ersetzt **nicht** den Text der konkreten Gildenquest, Nebenquest, Provinz-Gazette oder Begegnungskarte. Der im Regelbuch S. 10 beschriebene Vorrang lautet: **Errata/FAQ → Spielmaterial → Gazette → Anleitung**. Besondere Bedingungen können andere Schritte erfordern. Das gilt insbesondere für die Besonderheiten einzelner Finales, der Gildenunterstützung und der Schlachtziele.

**Testergebnis:** 35/35 automatisierte Chromium-Funktionstests erfolgreich. Service-Worker-Installations-/Offline-Cache-Ereignisse separat simuliert. Ein vollständiger Offline-Neustart über einen realen Webserver konnte hier nicht getestet werden (lokales Netzwerk im Testbrowser gesperrt). Nicht auf physischer iPhone-Hardware oder mit Safari getestet.
