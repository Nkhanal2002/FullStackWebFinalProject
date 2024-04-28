"use strict";
const $ = document.querySelector.bind(document);

//target different elements
const logInPage = $(".logInPage");
const signUpPage = $(".signUpPage");
const logInBtn = $("#login-btn");
const signUpBtn = $("#signup-btn");
const logInLink = $(".logInLink");
const signUpLink = $(".signUpLink");
const addTaskBtn = $(".addTask-btn");
const signOutBtn = $(".signOut-btn");
const addTaskContainer = $(".addTaskContainer");
const crossMark = $(".crossMark");
const createTaskBtn = $("#submitTaskBtn");
const tasksContainer = $(".tasks");
const inputTask = $(".inputTask");
const mainContainer = $(".mainContainer");
const mainPage = $(".mainPage");
const editIcon = $("#editIcon");
const deleteIcon = $("#deleteIcon");

// logInScreen
const openLogInScreen = () => {
  signUpPage.classList.add("hidden-class");
  logInPage.classList.remove("hidden-class");
};
// signUpScreen
const openSignUpScreen = () => {
  logInPage.classList.add("hidden-class");
  signUpPage.classList.remove("hidden-class");
};
// mainPageScreen
const openMainPageScreen = (doc) =>{
  //hide other screens, clear inputs, clear error
  logInPage.classList.add("hidden-class");
  // signUpPage.classList.add("hidden-class");
  showError("");

  //show mainPageScreen
  mainPage.classList.remove("hidden-class");

  //display name
  $("#name").innerText = doc.name;


}
// show Error
const showError = (err) => {
  $("#error").innerText = err;
};

// logIn link action
logInLink.addEventListener("click", openLogInScreen);

// signUp link action
signUpLink.addEventListener("click", openSignUpScreen);

// logIn button action
logInBtn.addEventListener("click", () => {
    const username = $(".loginUsername").value;
    const password = $(".loginPassword").value;
      // mainContainer.classList.add("hidden-class"); //hide mainContainer
      // mainPage.classList.remove("hidden-class"); //show mainPage

      //clear input values
      // $(".inputUsername").value = "";
      // $(".inputPassword").value = "";
      if (username && password){
        // use POST /users/auth to authentication
      fetch("http://localhost:3000/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((doc) => {
          if (doc.error) {
            showError(doc.error);
          } else {
            localStorage.setItem("authToken", doc.authToken);
            openMainPageScreen(doc);
          }
        })
        .catch((err) => showError("ERROR: " + err));
      }
      
    });


// signUp button action
signUpBtn.addEventListener("click", () => {
  // grab all user info from input fields, and POST it to /users
  var data = {
    username: $(".signUpUsername").value,
    password: $(".signUpPassword").value,
    name: $(".signUpName").value,
    email: $(".signUpEmail").value,
  };
  
  
  //POST /users

  fetch("http://localhost:3000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error);
      } else {
        localStorage.setItem("authToken", doc.authToken);
        openMainPageScreen(doc);
      }
    })
    .catch((err) => showError("ERROR: " + err));
});

// signOut button action
signOutBtn.addEventListener("click", () => {
  mainPage.classList.add("hidden-class"); //hide mainPage
  mainContainer.classList.remove("hidden-class"); //show mainContainer
});
// addTask button action
addTaskBtn.addEventListener("click", () => {
  addTaskContainer.classList.remove("hidden-class"); //display addTaskContainer
});

//crossMark icon action
crossMark.addEventListener("click", () => {
  addTaskContainer.classList.add("hidden-class"); //hide addTaskContainer
});

//createTask button action
createTaskBtn.addEventListener("click", () => {
  if (inputTask.value) {
    let divContainer = document.createElement("div");
    divContainer.classList.add(
      "flex",
      "flex-row",
      "rounded-sm",
      "shadow-md",
      "bg-slate-50",
      "p-3",
      "sm:p-4",
      "my-3",
      "mx-auto",
      "justify-between",
      "items-center",
      "max-w-[35rem]"
    );
    divContainer.innerHTML = `<p>${inputTask.value}<p>
    <div class = "icons flex gap-4">
    <i id = "editIcon" class="text-base sm:text-lg fa-solid fa-pen-to-square cursor-pointer hover:text-slate-600 active:text-slate-600"></i>
    <i id= "deleteIcon" class="text-base sm:text-lg fa-solid fa-trash hover:cursor-pointer text-red-400 hover:text-red-500 active:text-red-500"></i> 
    <div>
    `;
    tasksContainer.appendChild(divContainer); //append the div container as the children of the mainPage
    addTaskContainer.classList.add("hidden-class"); //hide addTaskContainer
    inputTask.value = ""; //clear the input value
  }
});
