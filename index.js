const express = require("express"); // load express module
const nedb = require("nedb-promises"); // load nedb module
const bcrypt = require("bcrypt"); // load bcrypt module
const crypto = require("crypto"); // load crypto module
const cors = require("cors"); // load cors middleware

const app = express(); // init app
const db = nedb.create("users.jsonl"); // init db
app.use(express.static("public")); // enable static routing to "./public" folder
// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json());
app.use(cors());

// create route to get all user records (GET /users)
app.get("/users", (req, res) => {
  db.find({})
    .then((docs) => res.send(docs))
    .catch((error) => res.send({ error }));
});

//login route
app.post('/users/auth', (req, res) => {
  const { username, password } = req.body

  db.findOne({ _id: username })
    .then((user) => {
      if (user) {
        const isValidPassword = bcrypt.compareSync(password, user.password)
        if (isValidPassword) {
          const authToken = crypto.randomBytes(30).toString('hex')
          user.authToken = authToken
          db.updateOne({ _id: username }, user).then(() => {
            const { password, ...userWithoutPassword } = user
            res.send(userWithoutPassword)
          })
        } else {
          res.send({ error: 'Invalid password.' })
        }
      } else {
        res.send({ error: 'Username not found.' })
      }
    })
    .catch((error) => res.send({ error }))
})

// signup route
app.post('/users', (req, res) => {
  if (
    req.body.username &&
    req.body.password &&
    req.body.email &&
    req.body.name
  ) {
    db.findOne({ _id: req.body.username })
      .then((record) => {
        if (record) {
          res.send({ error: 'Username already exists.'})
        } else {

          const authToken = crypto.randomBytes(30).toString('hex')

          const dataRegistered = {
            _id: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync()),
            authToken
          }

          db.insertOne(dataRegistered)
            .then((eachRecord) =>
              res.send({
                _id: eachRecord._id,
                name: eachRecord.name,
                email: eachRecord.email
              })
            )
            .catch((error) => res.send({ error }))
        }
      })
      .catch((error) => res.send({ error }))
  } else {
    res.send({ error: 'Missing fields.' })
  }
})
// post route to add tasks for each loggedIn user
app.post("/users/:username/tasks", (req, res)=>{
  const {username} = req.params;
  const {txt, authToken} = req.body;

  db.findOne({_id: username, authToken: authToken})
  .then(user =>{
    if (user){
      const task = {id: new Date().getTime(), txt, completed: false};
      user.tasks.push(task);
      db.updateOne({_id: username}, {$set: {tasks: user.tasks}})
      .then(()=>{
        res.send({tasks: user.tasks})})
      .catch((error) =>{
        res.status(500).send({error: "erroror occurred while updating tasks!"});
      })
    } else{
      res.status(401).send({error: "Authentication failed!"}); //lack valid authentication credentials
    }
  })
  .catch(error => res.status(500).send({error})); //internal server error
})


// patch route to update tasks with each unique taskId
app.patch("/users/:username/tasks/:taskId", (req, res)=>{
  const {username, taskId} = req.params;
  const {txt, completed, authToken} = req.body;

  db.findOne({_id: username, authToken: authToken})
  .then(user => {
    if (user){
      const taskIdx = user.tasks.findIndex(task => task.id == taskId);

      if(taskIdx > -1){
        user.tasks[taskIdx] = {...user.tasks[taskIdx], txt, completed};

      db.updateOne({_id: username}, {$set: {tasks: user.tasks}}) 
      .then(()=> res.send({task: user.tasks[taskIdx]}))
      .catch(error => res.status(500).send({error: "error Occurred while updating task!"}));
    } else{
      res.status(404).send({error: "Task not found!"});
    }
  } else{
    res.status(401).send({error: "Authentication failed!"})
  }
  })
  .catch(error => res.status(500).send({error}));
});

// delete route for deleting task using each taskId
app.delete("/users/:username/tasks/:taskId", (req, res) =>{
  const {username, taskId} = req.params;
  const {authToken} = req.body;

  db.findOne({_id: username, authToken: authToken})
  .then(user =>{
    if (user){
      const filteredTasks = user.tasks.filter(task => task.id != taskId);
      db.updateOne({_id: username}, {$set: {tasks: filteredTasks}})
      .then(()=> res.send({ok: true}))
      .catch(error => res.status(500).send({error: "erroror occurred while deleting task!"}));
    } else{
      res.status(401).send({error: "Authentication failed!"});
    }
  })
  .catch(error => res.status(500).send({error}));
})


// default route
app.all('*', (req, res) => {
  res.status(404).send('Invalid URL.');
})

// start server
app.listen(3000, () => console.log('Server started on http://localhost:3000'));