const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");
const idauth = urlParams.get("authorId");
let username = getCurrentUser();
const basUrl = "https://localhost:7008/api";
//const basUrl = "https://fakesocialwepapp.azurewebsites.net"
setupNavbar();
getPost();
getPosts();
getUser();
//getAllPostsForUser();

//logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logged out! Godbey 👋", "danger");
  toggleLoader(true);
  setTimeout(() => {
    setupNavbar();
    window.location.reload();
  }, "1000");
}
//login
function loginBtn() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const params = {
    username: username,
    password: password,
  };
  axios
    .post(`${basUrl}/Auth/login`, params)
    .then((response) => {
      //save the token and user in localStorage
      localStorage.setItem("token", response.data.token);
      //if u want to save a object u will do like that
      localStorage.setItem("user", JSON.stringify(response.data));
      //To close the modal
      const modal = document.getElementById("login-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      setupNavbar();
      toggleLoader(true);
      showAlert(
        `Welcome back  <span class="username-welcome">${username}</span> 👋🏻`,
        "success"
      );
      setTimeout(() => {
        window.location.reload();
      }, "1000");
    })
    .catch((error) => {
      console.log(error);
      showAlert(error, "danger");
    });
}

//get all posts
function getPosts() {
  toggleLoader(true);
  //get all posts
  axios.get(`${basUrl}/posts`).then((response) => {
    console.log("data", response.data);
    toggleLoader(false);
    // get the last post into the start page 
    const posts = response.data.sort(function(a,b){ return b.id - a.id});
   
    for (post of posts) {
      const author = post.author;
      let postTitle = "";
      //show or hide (edit) button
      //Chcek if user is logged in or not
      let user = getCurrentUser();

      let isMyPost = user != null && post.author.id == user.id;
      let editButton = ``;
      if (isMyPost) {
        editButton = `
        <button class="btn btn-danger" id="deleteBtn" onclick="deletePost('${encodeURIComponent(
          JSON.stringify(post)
        )}')" style="float:right; margin-left:5px;"><i class="bi bi-trash-fill"></i></button>
  
        <button class="btn btn-secondary" id="editBtn" onclick="editPost('${encodeURIComponent(
          JSON.stringify(post)
        )}')" style="float:right;"><i class="bi bi-pen"></i></button>
 `;
      }

      if (post.title != null) {
        postTitle = post.title;
      }

      let content = `
       <!--Post-->
 <div class="cr" >
          <div class="card shadow allPosts bg-dark styleCard mt-2" id="card" >
            <div class="card-header" >
         <span class="userstartpage" onclick="userCliked(${author.id})">
         <b class="text-warning"> <i class="bi bi-person-circle"></i>  ${author.userName} </b>
         </span>
         ${editButton}
            <div class="card-body" onclick="getCurrentPost(${post.id})" >
              <h6 style="color: rgb(141, 139, 139)" class="mt-1">
              🗓️  ${post.created}
              </h6>
              <h5 class="text-white">${postTitle}</h5>
              <p class="text-white">
               ${post.content}
              </p>
              <hr />
              <span class="comment text-secondary" >
             <b> <i class="bi bi-pen-fill"></i> Comment (${post.count})</b>
              </span>
            </div>
            </div>
          
            </div>
       `;

      document.getElementById("posts").innerHTML += content;
    }
  });
}

//profile.js start
function userCliked(authorId) {
  window.location.href = `profile.html?authorId=${authorId}`;
}
function getUser() {
  const id = getCurrenUser();
  axios.get(`${basUrl}/Auth/${id}`).then((response) => {
    console.log("user info", response.data);
  
    const user = response.data[0];
    // document.getElementById("user-profile").innerHTML = user.username;
    document.getElementById("user-profile").innerHTML = user.userName + "'s";
    document.getElementById("main-info-username").innerHTML = user.userName;
    document.getElementById("posts-count").innerHTML = user.countPost;
    document.getElementById("comments-count").innerHTML = user.countComment;
    document.getElementById("name-posts").innerHTML = user.userName + "'s";
  // get the last post into the start page 
    const post = response.data.find((x) => x.id).post.sort(function(a,b){ return b.id - a.id})


    document.getElementById("user-posts").innerHTML = "";
    for (posts of post) {
      //const author = post.author;
      let postTitle = "";
      //show or hide (edit) button
      //Chcek if user is logged in or not
      let user = getCurrentUser();
      let isMyPost = user != null && posts.authorId == user.id;
      let editButton = ``;

      if (isMyPost) {
        editButton = `
        <button class="btn btn-danger" id="deleteBtn" onclick="deletePost('${encodeURIComponent(
          JSON.stringify(posts)
        )}')" style="float:right; margin-left:5px;"><i class="bi bi-trash-fill"></i></button>
        <button class="btn btn-secondary" id="editBtn" onclick="editPost('${encodeURIComponent(
          JSON.stringify(posts)
        )}')" style="float:right;"><i class="bi bi-pen"></i></button>
    `;
      }
      if (posts.title != null) {
        postTitle = posts.title;
      }

      let content = `
       <!--Post-->
          <div class="card shadow bg-dark  mb-5">
            <div class="card-header">  
           <span class="userstartpage" >
           <b class = "text-warning"><i class="bi bi-person-circle"></i> ${posts.userName}</b>
           </span>
           ${editButton}
            <div class="card-body" onclick="getCurrentPost(${posts.id})">
              <h6 style="color: rgb(141, 139, 139)" class="mt-1">
               ${posts.created}
              </h6>
              <h5 class="text-white">${postTitle}</h5>
              <p class="text-white">
               ${posts.content}
              </p>
              <hr />
              <span  class="comment text-secondary" onclick="getCurrentPost(${posts.id})">
              <b><i class="bi bi-pen-fill"></i> Comment's (${posts.comment.length})</b>
              </span>
            </div>
          </div>
       `;
      document.getElementById("user-posts").innerHTML += content;
    }
  });
}

//get curren profile page
function profilePage() {
  const user = getCurrentUser();
  window.location.href = `profile.html?authorId=${user.id}`;
}

//get current user
function getCurrentUser() {
  let name = null;
  const storageUser = localStorage.getItem("user");
  if (storageUser != null) {
    //convert user from string to json
    name = JSON.parse(storageUser);
  }
  return name;
}

function getCurrenUser() {
  //get the curren user with id
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("authorId");
  return id;
}

// function getAllPostsForUser() {
//   toggleLoader(true);
//   //get all posts
//   axios.get(`${basUrl}/Auth/${username.id}`).then((response) => {
//     toggleLoader(false);
//     const posts = response.data.data;
//     console.log("user post " ,response.data.data);
//     document.getElementById("user-posts").innerHTML = "";
//     for (post of posts) {
//       const author = post.author;
//       let postTitle = "";
//       //show or hide (edit) button
//       //Chcek if user is logged in or not
//       let user = getCurrentUser();
//       let isMyPost = user != null && post.author.id == user.id;
//       let editButton = ``;

//       if (isMyPost) {
//         editButton = `
//           <button class="btn btn-danger" id="deleteBtn" onclick="deletePost('${encodeURIComponent(
//             JSON.stringify(post)
//           )}')" style="float:right; margin-left:5px;">Delete <i class="bi bi-trash-fill"></i></button>

//           <button class="btn btn-secondary" id="editBtn" onclick="editPost('${encodeURIComponent(
//             JSON.stringify(post)
//           )}')" style="float:right;">Edit <i class="bi bi-pen"></i></button>
//    `;
//       }
//       if (post.title != null) {
//         postTitle = post.title;
//       }

//       let content = `
//          <!--Post-->
//             <div class="card shadow styleCard">
//               <div class="card-header" >
//                 <img
//                   src="${author.profile_image}"
//                   alt=""
//                   class="rounded-circle border border-1"
//                   style="width: 50px"
//                 />

//                 <b class = "username_">${author.username}</b>
//                 <div class="edit-del">
//                 ${editButton}
//                 </div>

//               <div class="card-body" onclick="getCurrentPost(${post.id})">
//                 <img
//                   src="${post.image}"
//                   class="w-100"
//                   alt=""
//                 />
//                 <h6 style="color: rgb(141, 139, 139)" class="mt-1">
//                  ${post.created_at}
//                 </h6>
//                 <h5>${postTitle}</h5>
//                 <p>
//                  ${post.body}
//                 </p>
//                 <hr />
//                 <span> <i class="bi bi-pen-fill"></i> (${post.comments_count}) Comments  <span id = "post-tag-${post.id}"></span></span>
//               </div>
//             </div>
//          `;
//       document.getElementById("user-posts").innerHTML += content;
//       const currentPostTagsId = `post-tag-${post.id}`;
//       document.getElementById(currentPostTagsId).innerHTML = "";

//       for (tag of post.tags) {
//         console.log(tag.name);
//         let tagsContent = `
//               <button class = "btn btn-sm rounded-5 tag">${tag.name}</button>
//               `;
//         document.getElementById(currentPostTagsId).innerHTML += tagsContent;
//       }
//     }
//   });
// }
//profile.js end

//Alert
function showAlert(customMessage, type) {
  const alertPlaceholder = document.getElementById("success-alert");
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  alert(customMessage, type);

  // todo: after 3 seconds close the alert
  setTimeout(() => {
    //close the alert
    // const alertToHide = bootstrap.Alert.getOrCreateInstance("#success-alert");
    // const alertToHide = document.getElementById("success-alert")
    // const modalAlert = bootstrap.Alert.getInstance(alertToHide)
    // modalAlert.hide()
    //   alertToHide.close()
  }, 3000);
}
//navbar
function setupNavbar() {
  //get the token from the localStorage
  const token = localStorage.getItem("token");
  const loginDiv = document.getElementById("logged-in-div");
  const logoutBtn = document.getElementById("logout-div");
  const addBtn = document.getElementById("add-btn");
  if (token == null) {
    //if user is guest (not logged in)
    loginDiv.style.setProperty("display", "flex", "important");
    logoutBtn.style.setProperty("display", "none", "important");
    addBtn.style.setProperty("display", "none", "important");
  } else {
    //for logged in user
    loginDiv.style.setProperty("display", "none", "important");
    logoutBtn.style.setProperty("display", "flex", "important");
    addBtn.style.setProperty("display", "flex", "important");
    const user = getCurrentUser();
    document.getElementById(
      "nav-username"
    ).innerHTML = `Welcome <span class="nav-username">${user.username} </span> 👋`;
  }
}

//register
function registerUser() {
  const username = document.getElementById("username-register").value;
  const password = document.getElementById("password-register").value;
  const passwordConfirm = document.getElementById(
    "passwordConfirm-register"
  ).value;
  const params = {
    username: username,
    password: password,
    confirmPassword: passwordConfirm,
  };
  axios
    .post(`${basUrl}/Auth/register`, params)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      //if u want to save a object u will do like that, convert json to string
      localStorage.setItem("user", JSON.stringify(response.data));
      //To close the modal
      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      toggleLoader(true);
      setupNavbar();
      showAlert(
        `Hi  <span class= "username-welcome">${username}</span>👋! Welcome to our social web site 🤗`,
        "success"
      );
      setTimeout(() => {
        window.location.reload();
      }, "1000");
    })
    .catch((error) => {
      console.log(error.response);
      showAlert(error, "danger");
    });
}

// addBtn clicked
function addBtn() {
  let user = getCurrentUser();
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-id").value = "";
  document.getElementById("postModalTitle").innerHTML = "Create A New Post";
  document.getElementById("title").value = "";
  document.getElementById("body").value = "";
  document.getElementById("userId").value = user.authorId;

  let editPostModal = new bootstrap.Modal(
    document.getElementById("createPost-modal"),
    {}
  );
  editPostModal.toggle();
}

//create a new post
function createNewPostBtn() {
  let user = getCurrentUser();
  let postId = document.getElementById("post-id").value;
  let isCreate = postId == null || postId == "";
  const title = document.getElementById("title").value;
  const conten = document.getElementById("body").value;
  const authorId = (document.getElementById("userId").value = user.id);
  const user_name = (document.getElementById("user-name").value =
    user.username);
  let formData = new FormData();
  formData.append("title", title);
  formData.append("content", conten);
  formData.append("authorId", authorId);
  formData.append("userName", user_name);
  const headers = {
    authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  };
  let urlPost = ``;
  let urlPut = ``;
  //create new post
  if (isCreate) {
    urlPost = "https://localhost:7008/api/Posts/Create";
    axios
      .post(urlPost, formData, {
        headers: headers,
      })
      .then((response) => {
        //To close the modal
        const modal = document.getElementById("createPost-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        toggleLoader(true);
        showAlert("New post has been created", "primary");
        setTimeout(() => {
          window.location.reload();
        }, "1000");
      })
      .catch((error) => {
        showAlert(error, "danger");
      });
  }
  // edit the post
  if (!isCreate) {
    urlPut = `https://localhost:7008/api/Posts/edit?id=${postId}`;
    axios
      .put(urlPut, formData, {
        headers: headers,
      })
      .then((response) => {
        //To close the modal
        const modal = document.getElementById("createPost-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        toggleLoader(true);
        showAlert("The post has been edited", "primary");
        setTimeout(() => {
          window.location.reload();
        }, "1000");
      })
      .catch((error) => {
        showAlert(error, "danger");
      });
  }
}

//delete the post
function deletePost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById("delete-post-id-input").value = post.id;
  let editPostModal = new bootstrap.Modal(
    document.getElementById("deletePost-modal"),
    {}
  );
  editPostModal.toggle();
}

//Confirm delete post
function confirmPostdelete() {
  // const token = localStorage.getItem("token");
  const postId = document.getElementById("delete-post-id-input").value;
  const headers = {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  axios
    .delete(`${basUrl}/Posts/DeletePost?id=${postId}`, {
      headers: headers,
    })
    .then((response) => {
      //To close the modal
      const modal = document.getElementById("deletePost-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      toggleLoader(true);
      showAlert("The Post Has Been Deleted Successfully", "success");
      setTimeout(() => {
        window.location.reload();
      }, "1000");
    })
    .catch((error) => {
      showAlert(error, "danger");
    });
}

//edit the post
function editPost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById(
    "post-modal-submit-btn"
  ).innerHTML = `Save <i class="bi bi-download"></i>`;
  document.getElementById("post-id").value = post.id;
  document.getElementById("postModalTitle").innerHTML = "Edit Post";
  document.getElementById("title").value = post.title;
  document.getElementById("body").value = post.content;
  document.getElementById("userId").value = post.authorId;
  let editPostModal = new bootstrap.Modal(
    document.getElementById("createPost-modal"),
    {}
  );
  editPostModal.toggle();
}

// for loader icon
function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}

//get the details post
function getCurrentPost(postId) {
  window.location.href = `postDetails.html?postId=${postId}`;
}

function getPost() {
  toggleLoader(true);
  //get teh current post
  axios.get(`${basUrl}/posts/${id}`).then((response) => {
    toggleLoader(false);
      
    const post = response.data[0];
    const comment = post.comment;
    const author = post.author;
    let user = getCurrentUser();
    document.getElementById("username-span").innerHTML = author.userName;
    let postTitle = "";
    if (post.title != null) {
      postTitle = post.title;
    }
    let commentsContent = ``;

    for (comments of comment) {
      commentsContent += `<div class="p-3">
      <b class="usernameComment">   <i class="bi bi-person-badge"></i> ${comments.userName}</b>
 
      <div class="bodyComment text-white">
      ${comments.commentBody}
      </div>
</div>
`;
    }

    let editButton = ``;
    let isMyPost = user != null && post.author.id == user.id;
    if (isMyPost) {
      editButton = `
      <button class="btn btn-danger" id="deleteBtn" onclick="deletePost('${encodeURIComponent(
        JSON.stringify(post)
      )}')" style="float:right; margin-left:5px;"><i class="bi bi-trash-fill"></i></button>
      <button class="btn btn-secondary" id="editBtn" onclick="editPost('${encodeURIComponent(
        JSON.stringify(post)
      )}')" style="float:right;"><i class="bi bi-pen"></i></button>
  `;
    }

    const postContent = `
        <div class="card shadow bg-dark mt-4 mb-4">
               <div class="card-header">
              <span class="usernamePostdetails"> <i class="bi bi-person-circle"></i>  ${post.author.userName}</span>
               ${editButton}
               </div>
              
               <div class="card-body">
                 <h6 style="color: rgb(141, 139, 139)" class="mt-1">
                 ${post.created}
                 </h6>
                 <h5 class="text-white"> ${postTitle}</h5>
                 <p class="text-white"> ${post.content}</p>
                 <hr class="text-white" />
                 <span class="text-info "> <i class="bi bi-pen-fill"></i>  Comments</span>
               </div>
        
             <div>
       
       ${commentsContent}
          
           </div>
           
           <div class="input-group mt-2 " id="add-comment">
          <input id="comment-input" type="text"  placeholder="Add your comment here..." class="form-control"  />
           <input  type="hidden" id="authorId" value="${username.id}"   />
          <input  type="hidden" id="postid" value="${id}"   />
          <input  type="hidden" id="username" value="${username.username}"   />
          <button class="btn btn-outline-success " type="button" onclick="createCommentClicked()">Comment <i class="bi bi-send-fill"></i></button>
         </div>
         </div>
      
       
        `;
    document.getElementById("post").innerHTML = postContent;
  });
}
//Post Details Start

//create comment
function createCommentClicked() {
  toggleLoader(true);
  let idauther = (document.getElementById("authorId").value = username.id);
  let body = document.getElementById("comment-input").value;
  let postid = (document.getElementById("postid").value = id);
  let authorname = (document.getElementById("username").value =
    username.username);
  let params = {
    commentBody: body,
    postId: postid,
    userName: authorname,
    authorId: idauther,
  };
  let token = localStorage.getItem("token");
  let url = "https://localhost:7008/api/Comment";
  axios
    .post(url, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      showAlert("The comment has been created successfully", "success");
      getPost();
    })
    .catch((error) => {
      //  const errorMessage = error.response.data.message;

      showAlert(error.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}
//Post Details End








function topClick(){
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}