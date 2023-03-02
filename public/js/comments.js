const submitCommentButton = document.querySelector(".btn-comment");
const commentInput = document.querySelector(".comment-text");

async function getComments() {
  try {
    const responseComments = await fetch(
      `/selectedQuestion/${selectedQuestionId}`
    );
    const comments = await responseComments.json();
    return comments;
  } catch (error) {
    console.error("Failed to get Comments:", error);
  }
}

async function postComment(commentData) {
  console.log("this is entered");
  fetch("/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Comment created successfully");
        window.location.reload();
      } else {
        console.error("Failed to create comment");
      }
    })
    .catch((error) => {
      console.error("Failed to create comment:", error);
    });
}

//     commentInput.addEventListener('keydown', async (event) => {
//     if (event.key === 'Enter' && commentInput.value.trim() !== '') {
//       const comment = commentInput.value;
//       const commentData = { comment: comment };
//       console.log(comment);
//       await postComment(commentData);
//     }
//   });

submitCommentButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const commentInput = document.querySelector(".comment-text");
  const comment = commentInput.value;
  const commentData = { comment: comment };
  await postComment(commentData);
});
