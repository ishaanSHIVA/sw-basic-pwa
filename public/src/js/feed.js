var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form")
var titleInput = document.querySelector("#title")
var locationInput = document.querySelector("#location")
var url = "https://pwa-db-a5baf-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json";



function openCreatePostModal() {
  createPostArea.style.display = "block";
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;

  }
}

function sendData() {
  console.log("Sending data...",url);
  fetch(url,{
    method: 'POST',
    headers: {'Content-Type': 'application/json',Accept: 'application/json'},
    body : JSON.stringify({
      id: new Date().toISOString(),
      title:titleInput.value,
      location: locationInput.value,
      image:"https://images.unsplash.com/photo-1659298136703-f5880b90b174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2128&q=80"
    })
  })
  .then((res) => {
     console.log("Send data ",res)
     updateUI()
  })
}

form.addEventListener("submit", function(e) {
  e.preventDefault()

  if(titleInput.value.trim()  === '' || locationInput.value.trim() === '') {
    alert("Please enter valid data!!!")
    return
  }
    closeCreatePostModal()
    console.log(titleInput.value.trim())
    console.log(locationInput.value.trim())

    
    if('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(function (sw) {
          var post = {
            title: titleInput.value,
            location: locationInput.value,
            id:new Date().toISOString(),
          }
          writeData('sync-posts',post)
            .then(() => {
              return sw.sync.register('sync-new-posts')

            })
            .then(() => {
              var SnackbarContainer = document.querySelector('#confirmation-toast')
              var data = { message: 'Your Post was saved for syncing'}
            SnackbarContainer.MaterialSnackbar.showSnackbar(data);
            })
            .catch((error) => {
              console.log(error)
            })
        })
    } else {
        sendData()
    }

})

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function onSaveButton(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-save").then((cache) => {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  console.log("Clearing cards...");
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url("${data.image}")`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "Save";
  // cardSaveButton.addEventListener("click", onSaveButton);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  console.log('updating UI for ',data)
  clearCards()
  for(var i = 0; i < data.length; i++) {
    console.log(data[i].title);
    createCard(data[i]);
  }
}

var networkRecieved = false

fetch(url)
  .then((res) => {
    if (res) {
      return res.json();
    }
  })
  .then((data) => {
    networkRecieved = true
    console.log("From web ",data)
    var dataArray = [];
    for(var key in data) {
        console.log(key,data[key])
        dataArray.push(data[key])
    }
    updateUI(dataArray)
  })
console.log("indexedDB is on ","indexedDB" in window)
if ("indexedDB" in window) {
  console.log("[indexedDB] activated")
    readAllData('posts')
      .then(data => {
        console.log("From indexDB ",data)

        if(!networkRecieved) {
          updateUI(data)
        }
      })
  }

// fetch(url)
//   .then((res) => {
//     if (res) {
//       return res.json();
//     }
//   })
//   .then((data) => {
//     networkRecieved = true
//     console.log("From web ",data);
//     clearCards()
//     createCard();
//   }); 


  // Network first then cache
// if ("caches" in window) {
//   caches.match(url)
//   .then(res => {
//     if(res) {
//       return res.json();
//     }
//   })
//   .then(data => {
//     console.log("From cache ", data);
//     if (!networkRecieved)  {
//       clearCards()
//           createCard();

//     }
//   })
// }

// Network then cache
// fetch(url)
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });
