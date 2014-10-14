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
}
