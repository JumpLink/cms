module.exports = {
  users: function (cb) {
    cb(null, {email:"admin@admin.org", name: "admin", color: "#000000", password: "cms-admin"});
  }
}
