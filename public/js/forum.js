const questionInput = document.querySelector(".question-bar");
const submitQuestionButton = document.querySelector(".btn-submit");

async function getQuestions() {
  try {
    const response = await fetch("/forum");
    const questions = await response.json();
    return questions;
  } catch (error) {
    console.error("Failed to get Questions:", error);
  }
}

async function postQuestion(questionData) {
  fetch("/question", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(questionData),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Question created successfully");
        window.location.href = "/forum";
      } else {
        console.error("Failed to create Question");
      }
    })
    .catch((error) => {
      console.error("Failed to create Question:", error);
    });
}

questionInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && questionInput.value.trim() !== "") {
    const question = questionInput.value;
    const questionData = { question: question };
    console.log(question);
    await postQuestion(questionData);
  }
});

submitQuestionButton.addEventListener("click", async () => {
  const question = questionInput.value;
  const questionData = { question: question };
  console.log(question);
  await postQuestion(questionData);
});
