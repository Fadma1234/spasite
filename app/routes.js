const ObjectId = require('mongodb').ObjectId
module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    // Fetch appointments from the 'spasite' collection
    db.collection('spasite').find().toArray((err, appointmentsResult) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        messages: [], // use 'appointments' now
        appointments: appointmentsResult // Pass appointments to the EJS view
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // Appointment routes ===============================================================

  app.post('/appointment', (req, res) => {
    console.log("Received appointment data:", req.body);

    db.collection('spasite').insertOne({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      appointmentDate: req.body.appointmentDate,
      appointmentTime: req.body.appointmentTime, // Added this field
      service: req.body.service                   // Added this field
    }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      console.log('Appointment saved to database');
      res.redirect('/profile'); // Redirect to profile page to see the new appointment
    })
  });


  app.put('/appointment', (req, res) => {
    console.log("Received update request:", req.body);
    const appointmentId = new ObjectId(req.body._id);
    db.collection('spasite').findOneAndUpdate(
      { '_id': appointmentId }, // Find the document by its unique ID
      {
        $set: {
          'appointmentDate': req.body.newDate, // Update with the new date
          'appointmentTime': req.body.newTime  // Update with the new time
        }
      },
      {
        sort: { _id: -1 },
        upsert: false // We are updating an existing record, not creating a new one if it doesn't exist
      },
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ message: "Update failed" });
        }
        res.send(result); // Send back a success response
      }
    );
  });

  app.delete('/appointment', (req, res) => {
    console.log("Received delete request for ID:", req.body._id);
    const appointmentId = new ObjectId(req.body._id);

    db.collection('spasite').findOneAndDelete(
      { '_id': appointmentId }, // Find by ID
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ message: "Delete failed" });
        }
        if (result.value) {
          res.send({ message: 'Appointment deleted!', deletedCount: 1 });
        } else {
          res.status(404).send({ message: 'Appointment not found' });
        }
      }
    );
  });


  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
