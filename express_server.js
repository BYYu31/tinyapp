const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// generate random 6 digit code
function generateRandomString() {
  const alphanumeric = 'abcdefghijklmnopkrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTYUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 6; i ++) {
    result += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
  }
  return result;
}

// database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// helper function - email lookup

const emailLookUp = (email, dataBase) => {
  for (let user in dataBase) {
    if (dataBase[user].email === email) {
      return dataBase[user];
    }
  }
};

// home path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// get urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: usersDatabase,
    user_id: req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});

// getting new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: usersDatabase, user_id: req.cookies['user_id']
  };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});

// getting register link
app.get("/register", (req, res) => {
  const templateVars = {
    users: usersDatabase,
    user_id: req.cookies['user_id']
  };
  if (req.cookies['user_id']) {
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
  if (emailLookUp(req.body.email, usersDatabase)) {
    return res.status(400).send(`${req.body.email} is in use.`);
  }
  let newID = generateRandomString();

  // generate new ID
  usersDatabase[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };

  console.log(usersDatabase);
  res.cookie("user_id", newID).redirect("/urls");
});

// creating urls page
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  console.log("result is: " + req.cookies['user_id']);
  if (req.cookies['user_id']) {
    res.redirect(`/urls/${newURL}`);
  } else {
    res.send("Please login to use this function.");
  }
});

// getting urls with specific id
app.get("/urls/:id", (req,res) => {
  let id = req.params.id;
  if (!urlDatabase[id]) {
    res.send("this short url doesn't exist yet");
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[id],
    users: usersDatabase,
    user_id: req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});

// go to /u page with specific id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", { user_id: req.cookies['user_id']});
  }
})

// get user login
app.post("/login", (req, res) => {
  const user = emailLookUp(req.body.email, usersDatabase);

  if (!user) {
    return res.status(403).send("Invalid credentials");
  }
  if (user.password !== req.body.password) {
    return res.status(403).send("Invalid credentials");
  }
  res.cookie('user_id', user.id).redirect("/urls");
  
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// edit link
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;

  res.redirect("/urls");
});

// delete link
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// getting urls.json file
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});