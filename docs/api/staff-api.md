# Staff API

Basis: `/api/v1/staff`

| Methode | Endpoint | Zweck | Status |
| --- | --- | --- | --- |
| GET | `/orders?standId=&status=` | Offene Bestellungen | Skeleton |
| POST | `/scan` | QR-Code prüfen | Skeleton |
| POST | `/orders/{orderId}/pickup` | Abholung bestätigen | Skeleton |
| PATCH | `/inventory` | Bestand ändern | Skeleton |
| POST | `/products/{productId}/out-of-stock` | Produkt ausverkauft markieren | Skeleton |
| POST | `/deliveries` | Lieferung eingetroffen | Skeleton |

Staff-Zugriff ist standgebunden. Jeder Endpunkt muss serverseitig prüfen, ob der Mitarbeiter dem angefragten Stand zugeordnet ist.
