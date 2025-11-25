# REST-Web-Services-Implementation

## Funktioner

Hämta moduler från Epok
Hämta studenter (Canvas, simulerat)
Hämta personnummer (StudentITS, simulerat)
Registrera resultat i Ladok (U/G/VG)
Teacher-login samt kurser/uppgifter via separata endpoints

## Struktur

`inspera/` – HTML, CSS och JavaScript (frontend)  
`Canvas/` – HTML, CSS och JavaScript (frontend)  
`Ladok/` – HTML, CSS och JavaScript (frontend)  
`api/` – PHP REST-endpoints (epok, canvas, studentits, ladok, teachers, courses)  
`config/` – gemensamma hjälpfunktioner (`data_store.php`)  
`data/` – JSON-filer (simulerad datalagring)

1. Lägg mappen i `C:/xampp/htdocs/`
2. Starta Apache i XAMPP
3. Öppna (byt ut mappnamnet om du döpt projektet annorlunda):  
   `http://localhost/REST-Web-Services-Implementation/inspera/`  
   `http://localhost/REST-Web-Services-Implementation/Canvas/`  
   `http://localhost/REST-Web-Services-Implementation/Ladok/`

## Tekniker

- PHP
- JSON-baserad datalagring
- Fetch API (JavaScript)
- HTML/CSS
