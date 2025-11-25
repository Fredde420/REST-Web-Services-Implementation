# REST-Web-Services-Implementation

## Funktioner

- Hämta moduler från Epok
- Hämta studenter och omdömen från Canvas (simulerat)
- Hämta personnummer från StudentITS (simulerat)
- Registrera resultat i Ladok (U/G/VG)

## Struktur

`inspera/` – HTML, CSS och JavaScript (frontend)
`canvas/` – HTML, CSS och JavaScript (frontend)
`ladok/` – HTML, CSS och JavaScript (frontend)
`api/` – PHP REST-endpoints
`config/` – gemensamma hjälpfunktioner
`data/` – JSON-filer som utgör den simulerade databasen

## Hur man kör projektet

1. Lägg mappen i `C:/xampp/htdocs/`
2. Starta Apache i XAMPP
3. Öppna:  
   `http://localhost/rest-web-services-implementation/inspera/`
   `http://localhost/rest-web-services-implementation/canvas/`
   `http://localhost/rest-web-services-implementation/ladok/`

## Tekniker

- PHP
- JSON-baserad datalagring
- Fetch API (JavaScript)
- HTML/CSS
