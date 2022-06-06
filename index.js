const express = require("express");
const app = express();
const fs = require("fs");
const { v4: uuid } = require("uuid");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/user/create", (req, res) => {
  fs.readFile("./db.json", (err, data) => {
    let parsed = JSON.parse(data);
    let newUser = req.body;
    id = parsed.users.length + 1;
    newUser = { ...newUser, id: parsed.users.length + 1 };
    fs.writeFile(
      "./db.json",
      JSON.stringify({ users: [...parsed.users, newUser] }),
      (err) => {
        if (err) console.log(err);
      }
    );
  });
  res.status(201).send("User Created");
});
app.post("/user/login", (req, res) => {
  let { username, password } = req.body;
  if (username == undefined || password == undefined) {
    return res.status(400).send("please provide username and password");
  }
  fs.readFile("./db.json", (err, data) => {
    let parsed = JSON.parse(data);
    let obj = parsed.users.filter((el) => {
      return el.username == username && el.password == password;
    });
    if (obj.length == 0) {
      return res.status(401).send({ status: "Invalid Credentials" });
    }
    let token = uuid();
    let user = { ...obj[0], token };
    let filtered = parsed.users.filter((el) => {
      return el.username !== username && el.password !== password;
    });
    fs.writeFile(
      "./db.json",
      JSON.stringify({ users: [...filtered, user] }),
      (err) => {
        if (err) console.log(err);
      }
    );
    res.status(201).send({ status: "Login Successful", token: token });
  });
});
app.post("/user/logout/", (req, res) => {
  const key = req.query.apikey;
  fs.readFile("./db.json", (err, data) => {
    let parsed = JSON.parse(data);
    let obj = parsed.users.filter((el) => {
      return el.token == key;
    });
    let { name, role, username, password, age, id } = obj[0];
    let user = { name, role, username, password, age, id };
    let filtered = parsed.users.filter((el) => {
      return el.token !== key;
    });
    fs.writeFile(
      "./db.json",
      JSON.stringify({ users: [...filtered, user] }),
      (err) => {
        if (err) console.log(err);
      }
    );
    res.send({ status: "Logged Out  Successfully" });
  });
});
app.get(`/votes/party/:partyname`, (req, res) => {
  {
    fs.readFile("./db.json", (err, data) => {
      let parsed = JSON.parse(data);

      let filtered = parsed.users.filter((el) => {
        return el.party == req.params.partyname;
      });
      res.send(JSON.stringify(filtered));
    });
  }
});
app.get(`/votes/voters`, (req, res) => {
  {
    fs.readFile("./db.json", (err, data) => {
      let parsed = JSON.parse(data);

      let filtered = parsed.users.filter((el) => {
        return el.role == "voter";
      });
      res.send(JSON.stringify(filtered));
    });
  }
});
app.post(`/votes/vote/:user`, (req, res) => {
  fs.readFile("./db.json", (err, data) => {
    let parsed = JSON.parse(data);
    let obj = parsed.users.filter((el) => {
      return el.name == req.params.user;
    });
    let { name, role, party, age, id, votes } = obj[0];
    let user = { name, role, party, votes: votes + 1, age, id };
    let filtered = parsed.users.filter((el) => {
      return el.name !== req.params.user;
    });
    fs.writeFile(
      "./db.json",
      JSON.stringify({ users: [...filtered, user] }),
      (err) => {
        if (err) console.log(err);
      }
    );
    res.send("UPdated");
  });
});
app.get("/votes/count/:user", (req, res) => {
  let user = req.params.user;
  fs.readFile("./db.json", (err, data) => {
    let parsed = JSON.parse(data);
    let filtered = parsed.users.filter((el) => {
      return el.name == user;
    });
    if (filtered.length == 0) {
      return res.send("{ status: cannot find user }");
    } else {
      let count = filtered[0].votes;
      return res.send(`{ status: ${count} }`);
    }
  });
});
app.get("/db", (req, res) => {
  fs.readFile("./db.json", (err, data) => {
    res.send(data);
  });
});
app.post("/db", (req, res) => {
  fs.writeFile("./db.json", JSON.stringify(req.body), (err) => {
    if (err) console.log(err);
  });
});
app.listen(8080, () => {
  console.log("Started");
});
