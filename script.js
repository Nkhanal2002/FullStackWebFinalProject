'use strict'
const $ = document.querySelector.bind(document)

//target different elements
const logInPage = $('.logInPage')
const signUpPage = $('.signUpPage')
const logInBtn = $('#login-btn')
const signUpBtn = $('#signup-btn')
const logInLink = $('.logInLink')
const signUpLink = $('.signUpLink')
const addTaskBtn = $('.addTask-btn')
const signOutBtn = $('.signOut-btn')
const addTaskContainer = $('.addTaskContainer')
const editTaskContainer = $('.editTaskContainer')
const createCrossMark = $('#createCrossMark')
const editCrossMark = $('#editCrossMark')
const createTaskBtn = $('#submitTaskBtn')
const editTaskBtn = $('#submitEditTaskBtn')
const tasksContainer = $('.tasks')
const inputAddTask = $('.inputAddTask')
const inputEditTask = $('.inputEditTask')
const credentialsContainer = $('.credentialsContainer')
const mainPage = $('.mainPage')

//clear targetInput Values
const clearInputVals = () => {
  let targetInputElements = document.querySelectorAll('.targetInput')
  for (let eachTargetElement of targetInputElements) {
    eachTargetElement.value = ''
  }
}

// show Error
const showError = (err) => {
  $('#error').innerText = err
}

// logInScreen
const openLogInScreen = () => {
  signUpPage.classList.add('hidden-class')
  logInPage.classList.remove('hidden-class')
  clearInputVals()
  showError('')
}
// signUpScreen
const openSignUpScreen = () => {
  //hide credentialsContainer screen, clear inputs, clear error
  logInPage.classList.add('hidden-class')
  signUpPage.classList.remove('hidden-class')
  clearInputVals()
  showError('')
}

// mainPageScreen
const openMainPageScreen = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    //display user's name
    $('#name').innerText = `${user.name}!`
  }
  credentialsContainer.classList.add('hidden-class')
  mainPage.classList.remove('hidden-class')
  loadTasks()
}

// logIn link action
logInLink.addEventListener('click', openLogInScreen)

// signUp link action
signUpLink.addEventListener('click', openSignUpScreen)

// logIn button action
logInBtn.addEventListener('click', (e) => {
  e.preventDefault()
  const username = $('#loginUsername').value
  const password = $('#loginPassword').value
  if (username && password) {
    // use POST /users/auth to authentication
    fetch('http://localhost:3000/users/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then((res) => res.json())
      .then((doc) => {
        if (doc.error) {
          showError(doc.error)
        } else {
          localStorage.setItem('authToken', doc.authToken)
          localStorage.setItem('isLogIn', true)
          localStorage.setItem('user', JSON.stringify(doc))
          openMainPageScreen(doc)
        }
      })
      .catch((err) => showError('ERROR: ' + err))
  }
})
// signUp button action
signUpBtn.addEventListener('click', (e) => {
  e.preventDefault()
  // grab all user info from input fields, and POST it to /users
  var data = {
    username: $('#signUpUsername').value,
    password: $('#signUpPassword').value,
    name: $('#signUpName').value,
    email: $('#signUpEmail').value
  }

  //POST /users
  fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error)
      } else {
        localStorage.setItem('authToken', doc.authToken)
        localStorage.setItem('isSignUp', true)
        localStorage.setItem('user', JSON.stringify(doc))
        openMainPageScreen(doc)
      }
    })
    .catch((err) => showError('ERROR: ' + err))
})

// signOut button action
signOutBtn.addEventListener('click', () => {
  //remove all necessary items from the local storage after signing out
  localStorage.removeItem('authToken')
  localStorage.removeItem('isLogIn')
  localStorage.removeItem('isSignUp')
  mainPage.classList.add('hidden-class') //hide mainPage
  credentialsContainer.classList.remove('hidden-class') //show credentialsContainer
  openLogInScreen()
})
// addTask button action
addTaskBtn.addEventListener('click', () => {
  addTaskContainer.classList.toggle('hidden-class') //display addTaskContainer
  editTaskContainer.classList.add('hidden-class') //hides the editTaskContainer
})

//createCrossMark icon action
createCrossMark.addEventListener('click', () => {
  console.log('clicked')
  //hides the add and edit task containers
  addTaskContainer.classList.add('hidden-class')
})

//editCrossMark icon action
editCrossMark.addEventListener('click', () => {
  editTaskContainer.classList.add('hidden-class')
})

//createTask button action
createTaskBtn.addEventListener('click', (e) => {
  e.preventDefault()
  if (inputAddTask.value.trim() !== '') {
    addTask(inputAddTask.value.trim())
    inputAddTask.value = '' //clear input value after adding
    addTaskContainer.classList.add('hidden-class')
  }
})

function addTask(taskTxt) {
  let user = JSON.parse(localStorage.getItem('user'))
  if (!user) return
  fetch(`http://localhost:3000/users/${user._id}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      txt: taskTxt,
      authToken: user.authToken
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        showError(data.error)
      } else {
        localStorage.setItem('tasks', JSON.stringify(data.tasks))
        showTasks(data.tasks)
      }
    })
    .catch((error) => showError('Failed to add task!'))
}

function loadTasks() {
  const user = JSON.parse(localStorage.getItem('user'))
  // console.log({ user });
  if (!user) {
    return
  }

  fetch(`http://localhost:3000/users/${user._id}/tasks/${user.authToken}`)
    .then((res) => res.json())
    .then((tasks) => {
      // console.log({ tasks });
      if (tasks.error) {
        showError(tasks.error)
      } else {
        showTasks(tasks.tasks)
      }
    })
    .catch((error) => {
      console.log(error)
      showError('Failed to load tasks!')
    })

}

function showTasks(tasks) {
  // console.log("showta", tasks);
  const tasksContainer = document.querySelector('.mainTasks')
  tasksContainer.innerHTML = ''

  tasks.forEach((task) => {
    let taskDivContainer = document.createElement('div')

    taskDivContainer.setAttribute('data-index', task.id) //use data attribute for identification

    //add all necessary utility classes to divContainer for better UI
    taskDivContainer.classList.add(
      'flex',
      'flex-row',
      'rounded-sm',
      'shadow-md',
      'bg-slate-50',
      'p-3',
      'sm:p-4',
      'my-3',
      'mx-auto',
      'justify-between',
      'items-center',
      'max-w-[35rem]'
    )
    taskDivContainer.innerHTML = `<p class="inputValPara">${task.txt}<p>
      <div class = "icons flex gap-4">
      <i class="editIcon text-base sm:text-lg fa-solid fa-pen-to-square cursor-pointer hover:text-slate-600 active:text-slate-600"></i>
      <i class="deleteIcon text-base sm:text-lg fa-solid fa-trash hover:cursor-pointer text-red-400 hover:text-red-500 active:text-red-500"></i> 
      <div>
      `

    let deleteIcon = taskDivContainer.querySelector('.deleteIcon')
    deleteIcon.addEventListener('click', () => {
      // $(".mainTasks").removeChild(taskDivContainer);
      const idx = taskDivContainer.getAttribute('data-index')
      // console.log(idx);
      deleteTask(idx)
      loadTasks()
    })

    let editIcon = taskDivContainer.querySelector('.editIcon')
    editIcon.addEventListener('click', () => {
      const idx = taskDivContainer.getAttribute('data-index')
      editTaskPrompt(task, idx)
      console.log(idx)
      loadTasks
    })
    tasksContainer.appendChild(taskDivContainer) //append the taskdiv container as the children of the mainPage
  })
}
let currentEditingIdx = null //start edit index to null
function editTaskPrompt(task, idx) {
  inputEditTask.value = task.txt
  currentEditingIdx = idx
  editTaskContainer.classList.remove('hidden-class')
}

//editTask button action
editTaskBtn.addEventListener('click', (e) => {
  e.preventDefault()
  if (inputEditTask.value.trim() !== '' && currentEditingIdx !== null) {
    editTask(inputEditTask.value.trim(), currentEditingIdx)
    editTaskContainer.classList.add('hidden-class')
  }
})

function editTask(updatedText, idx) {
  let user = JSON.parse(localStorage?.getItem('user') || null)
  console.log({ user })
  fetch(`http://localhost:3000/users/${user._id}/tasks/${idx}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      txt: updatedText,
      authToken: user.authToken
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        showError(data.error)
      } else {
        localStorage.setItem('tasks', JSON.stringify(data.tasks))
        // console.log(data.tasks)
        loadTasks()
      }
    })
    .catch((error) => showError('Failed to edit task!'))
}

function deleteTask(idx) {
  let user = JSON.parse(localStorage?.getItem('user'))

  fetch(`http://localhost:3000/tasks/${user._id}/${idx}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      authToken: user.authToken
    })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        loadTasks()
      } else {
        showError(data.error || 'Failed to delete task!')
      }
    })
    .catch((error) => showError('Failed to delete task!'))
}

//DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  if (
    localStorage.getItem('isLogIn') === 'true' ||
    localStorage.getItem('isSignUp') === 'true'
  ) {
    openMainPageScreen()
  } else {
    openLogInScreen()
  }
})