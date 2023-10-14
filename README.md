# SQLite-to-Mermaid


## Project Overview
This Node.js microservice project serves mermaid ERDiagrams from SQLlite BLOBs. It is designed to be wrapped in an API using Express (todo)
Currently it outputs ERDs in ./out/ these can be tested via https://mermaid.live

### Prerequisites
To run this project, you need to have Node.js installed on your machine. You can download it from nodejs.org.

### Installation
Clone the project repository to your local machine:

```bash
git clone https://github.com/hdbham/SQLite-to-Mermaid
```
Navigate to the project directory:

```bash
cd SQLite-to-Mermaid
```
Install project dependencies:

```bash
npm install
```
### run
```bash
node index.js
```
TODO: API Implementation
The project is designed to be wrapped in an API using Express. This section will be updated with API implementation details.


Example Schema 
```mermaid
erDiagram
    albums {
        AlbumId INTEGER PK
        Title NVARCHAR(160)
        ArtistId INTEGER FK
    }
    artists {
        ArtistId INTEGER PK
        Name NVARCHAR(120)
    }
    customers {
        CustomerId INTEGER PK
        FirstName NVARCHAR(40)
        LastName NVARCHAR(20)
        Company NVARCHAR(80)
        Address NVARCHAR(70)
        City NVARCHAR(40)
        State NVARCHAR(40)
        Country NVARCHAR(40)
        PostalCode NVARCHAR(10)
        Phone NVARCHAR(24)
        Fax NVARCHAR(24)
        Email NVARCHAR(60)
        SupportRepId INTEGER FK
    }
    employees {
        EmployeeId INTEGER PK
        LastName NVARCHAR(20)
        FirstName NVARCHAR(20)
        Title NVARCHAR(30)
        ReportsTo INTEGER FK
        BirthDate DATETIME
        HireDate DATETIME
        Address NVARCHAR(70)
        City NVARCHAR(40)
        State NVARCHAR(40)
        Country NVARCHAR(40)
        PostalCode NVARCHAR(10)
        Phone NVARCHAR(24)
        Fax NVARCHAR(24)
        Email NVARCHAR(60)
    }
    genres {
        GenreId INTEGER PK
        Name NVARCHAR(120)
    }
    invoices {
        InvoiceId INTEGER PK
        CustomerId INTEGER FK
        InvoiceDate DATETIME
        BillingAddress NVARCHAR(70)
        BillingCity NVARCHAR(40)
        BillingState NVARCHAR(40)
        BillingCountry NVARCHAR(40)
        BillingPostalCode NVARCHAR(10)
        Total NUMERIC(10-2)
    }
    invoice_items {
        InvoiceLineId INTEGER PK
        InvoiceId INTEGER FK
        TrackId INTEGER FK
        UnitPrice NUMERIC(10-2)
        Quantity INTEGER
    }
    media_types {
        MediaTypeId INTEGER PK
        Name NVARCHAR(120)
    }
    playlists {
        PlaylistId INTEGER PK
        Name NVARCHAR(120)
    }
    playlist_track {
        PlaylistId INTEGER PK
        TrackId INTEGER FK
    }
    tracks {
        TrackId INTEGER PK
        Name NVARCHAR(200)
        AlbumId INTEGER FK
        MediaTypeId INTEGER FK
        GenreId INTEGER FK
        Composer NVARCHAR(220)
        Milliseconds INTEGER
        Bytes INTEGER
        UnitPrice NUMERIC(10-2)
    }
    albums ||--o{ artists : FK
    customers ||--o{ employees : FK
    employees ||--o{ employees : FK
    invoices ||--o{ customers : FK
    invoice_items ||--o{ tracks : FK
    invoice_items ||--o{ invoices : FK
    playlist_track ||--o{ tracks : FK
    playlist_track ||--o{ playlists : FK
    tracks ||--o{ media_types : FK
    tracks ||--o{ genres : FK
    tracks ||--o{ albums : FK

```
