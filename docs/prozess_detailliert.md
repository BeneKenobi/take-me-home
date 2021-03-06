# Detaillierter Prozessablauf

```mermaid
sequenceDiagram
    autonumber
    actor N as Nutzer
    participant A as App
    participant B as Betriebssystem/Browser
    participant W as REST Schnittstelle
    N->>A:Öffne App
    activate A
    A->>N:Zeige initiale GUI
    A-)B:Ermittle gespeicherten Wert für das Ziel
    activate B
    B--)A:Gespeicherter Wert für Ziel aus persistentem Speicher
    Note over B,A: Der Wert ist ein leerer String falls kein Wert im persistenten Speicher gesetzt ist
    A->>N:Zeige Wert für Ziel in GUI
    A-)B:Frage um Erlaubnis zur Loaktionsabfrage
    deactivate A
    opt Erlaubnis zur Lokationsabfrage wurde nicht zuvor erteilt oder verweigert
        B-)N:Frage um Erlaubnis zur Lokationsabfrage
        activate N
        N--)B:Erteile oder verweigere Erlaubnis zur Lokationsabfrage
        deactivate N
    end
    alt Erlaubnis für Lokationsabfrage verweigert
        B--)A:Erlaubnis verweigert
        deactivate B
        A->>N:Zeige Meldung über nicht erteilte Erlaubnis zur Lokationsabfrage 
    else Erlaubnis für Lokationsabfrage erteilt
        activate B
        B--)A:Erlaubnis erteilt
        deactivate B
        activate A
        A->>N:Zeige Meldung dass jetzt die Lokation ermitelt wird
        A-)B:Ermittle aktuelle Position
        deactivate A
        activate B
    end
    B--)A:Aktuelle Position
    deactivate B
    activate A
    A->>N:Entferne Meldung über Lokationsermittlung
    A->>N:Zeige Karte mit Startposition an
    alt Wert für Ziel bereits gesetzt
        A-)W:Ermittle Koordinaten von Ziel
        deactivate A
        activate W
    else Wert für Ziel noch nicht gesetzt 
        N-)A:Setze Ziel über Eingabefeld und speichern
        activate A
        A-)B:Speichere Ziel in persistenetem Speicher
        A-)W:Ermittle Koordinaten zum Ziel
        deactivate A
    end
    W--)A:Koordinaten des Ziels
    deactivate W
    activate A
    A->>N:Zeige Karte mit Start- und Zielposition an
    A-)W:Ermittle Reisezeit mit dem Auto
    activate W
    W--)A:Reisezeit mit dem Auto
    deactivate W
    A-)W:Ermittle Reisezeit zu Fuß
    activate W
    W--)A:Reisezeit mit dem Verkehrsmittel zu Fuß
    deactivate W
    A-)W:Ermittle Reisezeit mit dem Fahrrad
    activate W
    W--)A:Reisezeit mit dem Fahrrad
    deactivate W
    A-)W:Ermittle Reisezeit mit öffentlichen Verkehrsmitteln
    activate W
    W--)A:Reisezeit mit öffentlichen Verkehrsmitteln
    deactivate W
    A->>N:Zeige Buttons mit Reisezeiten an
    N-)A:User klickt/drückt einen Button mit Reisezeit
    A->>B:Starte Teilen-Dialog mit Text zur Reisezeit
    B->>N:Zeige Teilen-Dialog
```
