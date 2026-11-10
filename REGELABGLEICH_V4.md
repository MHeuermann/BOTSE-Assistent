# Regelabgleich V4 – offizielle deutsche Anleitung 1.0

## Umgesetzte Korrekturen

| Bereich | V4-Regelabbildung | Referenz |
|---|---|---|
| Tagesfolge und Zähler | fünf offizielle Phasen; Tageszähler startet auf 1; ab Tag 2 jeweils +1 | S. 34–36 |
| Begegnungshierarchie | Gildenquest → Nebenquest → Stadt → Provinzort → keine Begegnung; beim riskanten Ort 2× friedlich, 3× konfliktreich, 1× Fahrende Händler | S. 34–38 |
| Begrifflichkeiten | Schlacht, Aktivieren, Ermüdung, Übermüdung, Erschöpfungsleiste, Erholungswert, Überzeugungsprobe, Gildenunterstützung; Stadtaktionen mit offizieller Benennung | S. 22–25, 39–40, 50, 57–60, 86 |
| Stadt | Stadteffekt → Laden/Lehrer → Nebenquest → bis 2 reguläre Stadtaktionen; freie Aktionen extra, Marktplatz nur einmal | S. 39–40 |
| Überzeugungsprobe | ausdrückliche Aufforderung, erlaubte Würfel → Fokus → Ergebnis → Effekte | S. 86 |
| Schlacht | Typ Scharmützel/Gewölbe/Verlies, Schlachtziel, Aufbau → Abenteurer → Gefährten → Gegner → Rundenende, einzelne Aktivierungen | S. 54–65, 74–84 |
| Übermüdungsrunde | Rundenzähler bleibt auf der 6, bei jeder weiteren Runde 1 Übermüdung und anschließend Daedrischen Schaden nach Würfelanzahl | S. 57, 64 |
| Gewölbe | Erkundungskarte/Matte, Platzprüfung, Effekte, Kisten/Gegner, Himmelsscherben | S. 74–80 |
| Schlachtende | Priorität: alle Abenteurer besiegt, Ziel erreicht, Rückzug; Aufklärung als Sonderfall | S. 59, 83–84 |
| Schlossknacken | max. Versuche gemäß Zahlenschloss, 3 Dietrich-Würfel, Schlüsselziffer, Kosten 1 Ermüdung pro ±1, 6↔1 kostet 5 | S. 69–70 |
| EP | Erstpartie regulär 2 Gruppen-EP, Intro 1; normaler EP-Gewinn Gruppe+persönlich, Bonus nur persönlich, am Phasenende höchstens 3 freie EP | S. 13, 42 |
| Aufklärung | 1 EP pro gesammelter Scherbe bis zum Ziel, auch bei gescheiterter Begegnung, solange mindestens 1 Abenteurer unbesiegt | S. 42, 83 |
| Abendphase | Provinzsymbol, Rasten nach Schwierigkeit, Umorganisieren, Abend-Effekte; Finale-Ausnahme | S. 44, 51 |
| Gildenunterstützung | einmalig in Partie 1/2, während Schlacht/Rasten, Hauptstichwort statt normalem Stichwort | S. 50 |
| Verlust/Finale | Quest-Abschnitt oder Tag-12-Frist = Kampagnenverlust außer Karten-Ausnahme; Finale ohne Provinzbewegung und ohne gewöhnliches 12-Tage-Limit | S. 47, 51 |

## Bedienungsentscheidungen (keine automatischen Spielregeln)

- Freies Weitergehen bei unvollständigen Checklisten. Das ist bewusst ein **UI-Verhalten**, keine Behauptung, die Spielhandlung sei erledigt.
- Auswahl von Begegnung, Ausgang, Schlacht-Typ, Ziel und Queststatus erfolgt manuell anhand der Spielmaterialien. Die App liest die konkrete Gazette/Questkarte nicht selbst.
- Die App führt **keine Würfelwürfe, LP- oder Gegner-Logik** aus. Sie leitet nur durch offizielle Schritte, verwaltet Zähler und erfasste Werte.
- Neue Kampagnen beginnen regulär mit 2 Gruppen-EP; die Intro-Variante kann vor Spielbeginn gewählt werden. Alte Spielstände werden nicht ungefragt auf diesen neuen Anfangswert überschrieben.

## Teststatus

- 35/35 UI-/Funktionstests im Headless-Chromium, inklusive mehrerer Tage, Testfall Übermüdungsrunde, 12-Tage-Verlust, Gewölbe-/Stadt-/Riskant-Fällen, Aufklärung und Altstandmigration.
- Service-Worker-Cache-/Offline-Antwort **simuliert** (kein echter Browser-Offline-Neustart).
- Echte Safari-/iPhone-Prüfung und Netz-Offlinetest stehen aus.
