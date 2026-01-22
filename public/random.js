const jokeBox = document.getElementById("jokeBox");
const nextJokeBtn = document.getElementById("nextJokeBtn");

nextJokeBtn.addEventListener("click", async () => {
  try {
    nextJokeBtn.disabled = true;
    nextJokeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading';

    const res = await fetch("/api/jokes/random");
    const data = await res.json();

    jokeBox.style.opacity = 0;

    setTimeout(() => {
      jokeBox.textContent = data.joke;
      jokeBox.style.opacity = 1;
    }, 200);

  } catch (err) {
    jokeBox.textContent = "😢 Failed to load joke";
  } finally {
    nextJokeBtn.disabled = false;
    nextJokeBtn.innerHTML = '<i class="fas fa-dice"></i> Next Joke';
  }
});

