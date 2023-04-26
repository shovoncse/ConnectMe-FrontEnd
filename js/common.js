let user = localStorage.getItem("cm-data");
if (user && user != 'undefined') {
    user = JSON.parse(user);
} else {
    resetLocalStorage();
}

// dom loaded
document.addEventListener('DOMContentLoaded', async () => {
    // nav bar & left sidebar
    try {
        if (user.image) {
            document.querySelector('#nav-user-logo').src = user.image;

            const leftlogo = document.querySelector('.left .profile-photo img');
            if (leftlogo) {
                leftlogo.src = user.image;
                const userName = document.getElementById("user-name");
                userName.innerHTML = user.name;
                const userProfession = document.getElementById("user-profession");
                userProfession.innerHTML = user.profession;
            }
            const postAreaLogo = document.querySelector('#home-post-area-img');
            if (postAreaLogo) {
                postAreaLogo.src = user.image;
            }
        }

        if (user.accessToken) {
            const requestOptions = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + user.accessToken
                }
            };

            await apiRequest(`http://localhost:3001/api/users/verify_username/${user.username}`, requestOptions);
        }
    } catch (e) {
        console.log(e);
    }

})

// set loader function
function loader(status) {
    const loaderHtml = '<div class="loader"><img src="https://i.gifer.com/ZZ5H.gif"/></div>';

    const loader = document.querySelector('.loader');

    if (loader) {
        if (status) {
            loader.style.display = 'flex';
        } else {
            loader.style.display = 'none';
        }
    } else {
        const body = document.querySelector('body');
        body.insertAdjacentHTML('beforeend', loaderHtml);
    }
}

// function reset local storage and redirect to login page
function resetLocalStorage() {
    localStorage.removeItem("cm-data");
    localStorage.removeItem("cm-token");
    loader(false);
    window.location.href = "../connectme-frontend/login.html";
}

// function for api request
async function apiRequest(url, requestOptions) {
    try {
        let res = await fetch(url, requestOptions)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(error => {
                        throw new Error(error.message);
                    });
                }
            })
            .then(data => {
                return data;
            })
            .catch(error => {
                if (error.status == 401) {
                    resetLocalStorage();
                }
                return error.message;
            });
        return res;
    } catch (error) {
        return error;
    }
}


// SIDEBAR
const menuItems = document.querySelectorAll('.menu-item');
const changeActiveItem = () => {
    menuItems.forEach((item) => {
        item.classList.remove('active');
    });
};

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        changeActiveItem();
        item.classList.add('active');
        if (item.id != 'notifications') {
            document.querySelector('.notifications-popup').style.display = 'none';
        }
        else {
            document.querySelector('.notifications-popup').style.display = 'block';
            document.querySelector('#notifications .notification-count').style.display = 'none';
        }
    })
})


// home menu dropdown
function toggleDropdown(id) {
    var dropdownMenu = document.getElementById(id);
    dropdownMenu.classList.toggle("show");
}

// post delete
async function deletePost(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {

            const requestOptions = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + user.accessToken
                }
            };

            const deletePost = await apiRequest(`http://localhost:3001/api/posts/${id}`, requestOptions);

            if (deletePost) {
                const post = document.getElementById('post_' + id);
                post.remove();

                // add no post message if no post
                const posts = document.querySelectorAll('.feeds');
                if (posts.length == 0) {
                    const profilePosts = document.getElementById("profile-posts");
                    profilePosts.insertAdjacentHTML("afterend", `<p class="no-post-found">No posts found</p>`);

                }

                showAlert("Your post has been deleted.", "success", 1000);
            } else {
                showAlert(deletePost, "error");
            }
        }
    })
}


let loggedInUser = user;
// home post html
function generatePostHtml({ _id, image, postContent, updatedAt, user }) {
    return `
    <div class="feeds" id="post_${_id}">
   <div class="feed">
      <div class="head">
         <div class="user">
            ${loggedInUser.username == user.username ? `
            <div class="profile-photo" onclick="window.location.href='profile.html'"> 
               <img src="${user.image}" alt=""> 
            </div>
            ` : `
            <div class="profile-photo" onclick="window.location.href='profile.html?id=${user.username}'"> 
               <img src="${user.image}" alt=""> 
            </div>
            `}
            <div class="ingo">
               ${loggedInUser.username == user.username ? `
               <h3 class="c-pointer" onclick="window.location.href='profile.html'" >${user.name}</h3>
               ` : `
               <h3 class="c-pointer" onclick="window.location.href='profile.html?id=${user.username}'" >${user.name}</h3>
               `}
               <small> ${getRelativeTime(updatedAt)}</small> 
            </div>
         </div>
         ${loggedInUser.username == user.username ?
         `
         <div class="dropdown">
            <span class="dropdown-toggle" onclick="toggleDropdown('${_id}')"><i
               class="uil uil-ellipsis-h"></i></span>
            <div class="dropdown-menu" id="${_id}">
               <a class="dropdown-item" href="#" onclick="window.location.href='update-post.html?id=${_id}'">Edit</a>
               <a class="dropdown-item" href="#" onclick="deletePost('${_id}')">Delete</a>
            </div>
         </div>
         ` : ``
         }
      </div>
      <div id="post-content" class="post-content">
         <p>${postContent}</p>
      </div>
      <div class="photo"> ${image ? `<img src="${image}" alt="">` : ''} </div>
      <div class="action-buttons">
         <div class="interation-button"> <span> <i class="uil uil-heart"></i></span> <span> <i class="uil uil-comment-dots"></i> </span> <span> <i class="uil uil-share-alt"></i></span> </div>
         <div class="bookmark"> <span> <i class="uil uil-bookmark c-pointer"></i></span> </div>
      </div>
      <div class="comments">
         <div class="row">
            <div class="col-md-12">
               <div class="comment-add">
                  <div class="comment-body"> <input type="text" placeholder="Add a comment..." class="comment-box"> <span class="uil-message" onclick="newComment('${_id}')"></span> </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
    `
}

// new comment
async function newComment(id) {
    loader(true);
    const comment = document.querySelector(`#post_${id} .comment-box`).value;
    if (comment) {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + user.accessToken
            },
            body: JSON.stringify({ commentContent: comment })
        };
        
        const newComment = await apiRequest(`http://localhost:3001/api/posts/${id}`, requestOptions);
        loader(false);
        if (newComment.commentContent) {
            const commentHtml = generateCommentHtml(newComment);
            const comments = document.querySelector(`#post_${id} .comments`);
            comments.insertAdjacentHTML("afterend", commentHtml);
            document.querySelector(`#post_${id} .comment-box`).value = "";
        } else {
            showAlert(newComment.message, "error");
        }

    }
    loader(false);
}

// generate comment html
function generateCommentHtml({ _id, commentContent, updatedAt, user }) {
    return `
<div class="comment" id="comment_${_id}">
    <div class="comment-body">
        <img src="${user.image}"><div class="comment-content">
            <div class="info">
                <h3>${user.name}</h3>
                <small>${getRelativeTime(updatedAt)}</small>
            </div><div class="comment-text-area"><p>${commentContent}</p><span> 
            <i class="c-pointer comment-reaction-btn uil uil-heart"></i><span> <i class="uil uil-comment-dots"></i> </span>
            </div>
        </div>
    </div>
</div>
    `
}




// get relative time
function getRelativeTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    } else if (hours > 0) {
        return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
    } else if (minutes > 0) {
        return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
    } else {
        return "just now";
    }
}

// image upload
function imageUploadInput(uploadBtnId = 'upload-btn', imagePreviewId = 'image-preview') {


    const uploadBtn = document.getElementById(uploadBtnId);
    const imagePreview = document.getElementById(imagePreviewId);
    const deleteBtn = document.createElement('div');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '&times;';

    uploadBtn.addEventListener('change', () => {
        const file = uploadBtn.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const image = document.createElement('img');
            image.src = reader.result;
            imagePreview.innerHTML = '';
            imagePreview.appendChild(image);
            imagePreview.style.display = 'block';
            imagePreview.appendChild(deleteBtn);
        };
    });

    deleteBtn.addEventListener('click', () => {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
        document.getElementById('file-input').reset();
    });
}

// image host to cloud
async function imageHostToCloud(inputId) {
    const input = document.getElementById(inputId);

    const apiKey = '02598d03c9a3fd5b85ebb55a67fb5755';
    const apiUrl = 'https://api.imgbb.com/1/upload';
    let imageUrl = '';

    if (input.files[0]) {
        const formData = new FormData();
        formData.append('image', input.files[0]);
        formData.append('key', apiKey);

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        imageUrl = data.data.url;
    }

    return imageUrl;
}


// reset form
function resetForm(txtInputId, imagePreviewId, formId) {
    const form = document.getElementById(formId);
    const imagePreview = document.getElementById(imagePreviewId);
    const txtInput = document.getElementById(txtInputId);

    txtInput.value = ""
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    form.reset();
}

// alert
function showAlert(txt, icon, timer = 3000, showConfirmButton = false) {
    Swal.fire({
        icon: icon,
        text: txt,
        showConfirmButton: showConfirmButton,
        timer: timer
    })
}