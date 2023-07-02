const express = require("express");
const session = require("cookie-session");
const { getUserByEmail,generateRandomString, urlsForUser } = require("./helpers");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'user_id',
  keys: ['mySuperComplicatedText', 'Woopwoopisthedog','narutoBleachOnePieceShonenJump'],
  maxAge: 24 * 60 * 60 * 1000
}));


// url database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

// user database
const usersDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



// home path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// get urls
app.get("/urls", (req, res) => {
  const filteredURL = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = {
    urls: filteredURL,
    users: usersDatabase,
    user_id: req.session['user_id']
  };
  if (req.session['user_id']) {
    res.render("urls_index", templateVars);
  } else {
    res.send('Please log in');
  }
  
});

// getting new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: usersDatabase, user_id: req.session['user_id']
  };
  if (req.session['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});

// getting register link
app.get("/register", (req, res) => {
  const templateVars = {
    users: usersDatabase,
    user_id: req.session['user_id']
  };
  if (req.session['user_id']) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

// post to register endpoint
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please provide valid email and password');
  }
  if (getUserByEmail(req.body.email, usersDatabase)) {
    return res.status(400).send(`${req.body.email} is in use.`);
  }
  let newID = generateRandomString();

  // generate new ID
  usersDatabase[newID] = {
    id: newID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10)
  };
  req.session.user_id = newID;
  res.redirect("/urls");
});

// creating urls page
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  if (req.session['user_id']) {
    urlDatabase[newURL] = {
      userID: req.session['user_id'],
      longURL: req.body.longURL
    };
    res.redirect(`/urls/${newURL}`);
  } else {
    res.send("Please login to use this function.");
  }
});

// getting urls with specific id
app.get("/urls/:id", (req,res) => {
  let id = req.params.id;
  const filteredULR = urlsForUser(req.session['user_id'], urlDatabase);

  if (!req.session['user_id']) {
    res.send('Please log in first');
  }
  if (!filteredULR[id]) {
    res.send('this is not your link yo!');
  }
  if (!urlDatabase[id].longURL) {
    res.send("this short url doesn't exist yet");
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    users: usersDatabase,
    user_id: req.session['user_id']
  };
  res.render("urls_show", templateVars);
});

// go to /u page with specific id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// go to login page
app.get("/login", (req, res) => {
  if (req.session['user_id']) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", { user_id: req.session['user_id']});
  }
});

// get user login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, usersDatabase);

  if (!user) {
    res.status(403).send("Invalid credentials");
    return;
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Invalid credentials, wrong password");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// edit link
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const filteredULR = urlsForUser(req.session['user_id'], urlDatabase);
  if (filteredULR[id]) {
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("don't EDIT cuz it's not your link!");
  }

});

// delete link
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const filteredULR = urlsForUser(req.session['user_id'], urlDatabase);
  if (filteredULR[id]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send("don't DELETE cuz it's not your link!");
  }
});

// getting urls.json file
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// home
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});