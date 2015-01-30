var moment = require('moment');

module.exports = {
  users: function (cb) {
    cb(null, {email:"admin@admin.org", name: "admin", color: "#000000", password: "cms-admin"});
  }
  , members: function (cb) {
    cb(null,
      [
        {position: 1, name:"Kapt. Ralf Gütlein", job: "Vorsitzender", image: 'photo.png'}
        , {position: 2, name:"Dr. Hannes Ross", job: "stell. Vorsitzender", image: 'photo.png'}
        , {position: 3, name:"Peter Fichtner", job: "stell. Vorsitzender", image: 'photo.png'}
        , {position: 4, name:"Martin Schöne", job: "Schatzmeister", image: 'photo.png'}
        , {position: 5, name:"Uwe Stolle", job: "Rechtskundiges Mitglied", image: 'photo.png'}
        , {position: 6, name:"Burkhard Raasch", job: "Vorsitzender des Beirates", image: 'photo.png'}
        , {position: 7, name:"Dr. Hannes Ross", job: "Reisen", image: 'photo.png'}
        , {position: 8, name:"Peter Fichtner", job: "Ausbildung", image: 'photo.png'}
        , {position: 9, name:"Kap. Dirk Homann", job: "Berufliche Kontakte", image: 'photo.png'}
        , {position: 10, name:"Elke Timmermann", job: "Veranstaltungen", image: 'photo.png'}
        , {position: 11, name:"Dr. Hans-Joachim Stietzel", job: "Kommunale Kontakte", image: 'photo.png'}
        , {position: 12, name:"Erich Baumann", job: "Öffentlichkeitsarbeit", image: 'photo.png'}
        , {position: 13, name:"Kapt. Wolfgang Gewiese", job: "Fischerei", image: 'photo.png'}
      ]
    );
  }
  , timeline: function (cb) {
    cb(null,
      [
          {
              type: 'lecture'
            , person: 'Prof. Lange'
            , title: 'Meeresverschmutzung und Auswirkung auf den Fisch'
            // , from: 'Am 20.10.14 um 20:00 Uhr'
            , from: moment('2014-10-20 20:00')['_d']
            , place: 'Captain Ahabs Culture Club Cuxhaven'
          }
        , {
              type: 'lecture'
            , person: 'Doktorandin Jenny Byl der Universität Rostock'
            , title: 'Probleme durch Schall im Meer'
            // , from: 'Am 17.11.14 um 20:00 Uhr'
            , from: moment('2014-11-17 20:00')['_d']
            , place: 'Captain Ahabs Culture Club Cuxhaven'
          }
        , {
              type: 'lecture'
            , person: 'Pistol, Polizeidirektor a.D.'
            , title: 'Ein Besuch auf Pitcairn'
            // , from: 'Am 08.12.14 um 20:00 Uhr'
            , from: moment('2014-12-08 20:00')['_d']
            , place: 'Captain Ahabs Culture Club Cuxhaven'
          }
        , {
              type: 'lecture'
            , person: 'P.Bussler'
            , title: 'Cuxhavener Gastronomie im Hafen im 19.Jahrhundert'
            // , from: 'Am 19.01.19 um 20:00 Uhr'
            , from: moment('2015-01-19 20:00')['_d']
            , place: 'Captain Ahabs Culture Club Cuxhaven'
          }
        , {
              type: 'panel discussion'
            , title: 'Podiumsdiskussion - Situation der Deutschen Schifffahrt und Beschäftigungssituation Deutscher Seeleute'
            // , from: 'Am 16.02.15 um 20:00 Uhr'
            , from: moment('2015-02-16 20:00')['_d']
            , place: 'Captain Ahabs Culture Club Cuxhaven'
          }
        , {
              type: 'travel'
            , title: 'Ostseereise nach Polen, Russland (Königsberg und Pillau), Litauen.'
            // , from: 'AVom 03.6.15 bis 11.6.15'
            , from: moment('2015-06-03')['_d']
            , to: moment('2015-06-15')['_d']
            , download: 'Ostseereise%203.6.-11.6.15.pdf'
          }
      ]
    );
  }
}
