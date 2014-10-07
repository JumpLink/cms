invoice
=======

## Try it out
```
git clone https://github.com/JumpLink/invoice.git
cd invoice/src
npm install
bower install
node app
```
and visit http://localhost:1337/

## Custom user fields
```
invoice.approver.name           rechnung.genehmiger.name / firmenname
invoice.approver.address1       rechnung.genehmiger.addresse1
invoice.approver.place          rechnung.genehmiger.ort
invoice.approver.email          E-Mail
invoice.approver.web            Web / Homepage
invoice.approver.phone          Telefon
invoice.approver.fax            Fax
invoice.approver.ustid          UstID

invoice.approver.bank.owner     Kntoinhaber
invoice.approver.bank.name      Bankname
invoice.approver.bank.iban      IBAN
invoice.approver.bank.bic       BIC

invoice.recipient.name          rechnung.empfänger.name / firmenname
invoice.recipient.address1      rechnung.empfänger.addresse1
invoice.recipient.place         rechnung.empfänger.ort

invoice.currency         Währung
invoice.date             Datum
invoice.deadline         Fristdatum
invoice.number           Rechnungsnummer

invoice.tax              Steuer
invoice.taxrate          Steuersatz
invoice.amount           Summe (Netto)
invoice.totalamount      Gesamtsumme (Brutto)

invoice.task.number       Nummber
invoice.task.title        Titel / Name
invoice.task.description  Beschreibung
invoice.task.cost         Preis

transformed to 

invoice.task.1.number
invoice.task.1.title
invoice.task.1.description
invoice.task.1.cost

invoice.task.2.number
and so on..

invoice.translate.invoice      Rechnung
invoice.translate.amount       Summe
invoice.translate.totalamount  Gesamtsumme
invoice.translate.tax          Umsatzsteuer
invoice.translate.phone        Telefon
invoice.translate.fax          Fax
```
