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

// home path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// urls path
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
})

// getting new urls
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
})

// creating new urls
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls/${newURL}`);
})

// getting urls with specific id
app.get("/urls/:id", (req,res) => {
  let id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
})

// go to /u page with specific id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

// get user login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

// edit link
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;

  res.redirect("/urls");
})

// delete link
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
})

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