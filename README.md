# Farbmarkierungen-auf-C.net
Das Script erzeugt zusätzliche Farbmarkierungen  in den Beiträgen im <https://Mikrocontroller.net>-Forum:

- Markierung eigener Beiträge (Farbverlauf Beitrags-Titelzeile - Orange->eigene Farbe)
- Markierung von Beiträgen, wo eigene Beiträge zitiert wurden (Farbverlauf Beitrags-Titelzeile  - eigene Farbe->Orange)
- Markierungen von Beiträgen selbst definierbarer VIP-Benutzer (Farbverlauf Beitrags-Titelzeile  - definierte Farbe->Orange)
- Markierung von Beiträgen des TO (Farbverlauf Beitrags-Titelzeile  - definierte Farbe->Orange)
- Markierungen alter Beiträge (dunkleres grau (anhängig vom Alter) in der Beitrags-Kopfzeile)


## Changelog

```
changelog:
      v4: by Krapo
          tidied up release 
      v5: by vlad_tepesch
          added some includes to also work on https and english version of site
      v6: by vlad_tepesch
          changed coloring by age to use different shades for older or younger posts
          changed age colorting to color post info field instead of complete background
          inserted variable for different colors into param section
          changed some colors
      v7: by vlad_tepesch
          optimizations
          using topic ID to detect thread opener -> solves issue with wrong coloring on multi-page-threads
          individual colors for USERNAME_HIGHLIGHT
      v8: by vlad_tepesch
          fix the width of the colored headers after µC.net style update around 2019-11-18
      v9: by vlad_tepesch
          added snippet to shwo own user id
```


## Installation

- Grease Monkey installieren
- [User script] installieren und in Editor öffnen
- im Bereich `- Individuelle Anpassungen -` anpassungen vornehmen:
  - Benutzernamen anpassen
  - Benutzerid anpassen (kann auf der eigenen Benutzereinstellungen-Seite abgelesen werden)
  - Suchmuster für die Suche nach Zitaten anpassen 
  - (eventuell Farben anpassen)
  - (eventuell Liste mit VIPs anpassen (Standard: Andreas und Mods))
  
[user script]: https://github.com/vladtepesch/Farbmarkierungen-auf-C.net/raw/master/Farbmarkierungen%20auf%20%C2%B5C.net.user.js 
