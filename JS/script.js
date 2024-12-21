// Elementos del DOM
const openModalButton = document.getElementById("openModalButton");


// Temporizador
const countdown = () => {
  const launchDate = new Date("Dec 27, 2024 00:00:00").getTime(); // Fecha límite
  const now = new Date().getTime();
  const timeLeft = launchDate - now;

  if (timeLeft < 0) {
    clearInterval(timer);
    document.querySelector(".countdown").style.display = "none";
    disableButton(); // Deshabilita el botón
    return;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = days < 10 ? "0" + days : days;
  document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
  document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
  document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
};

// Deshabilitar botón
const disableButton = () => {
  openModalButton.disabled = true;
  openModalButton.innerText = "Registro cerrado";
  openModalButton.classList.add("disabled");
};


// Llamar la función de temporizador cada segundo
const timer = setInterval(countdown, 1000);

// Función para abrir el modal
function openModal() {
            const modal = document.getElementById('payment-modal');
            modal.querySelector('input[type="checkbox"]').checked = true;
        }

    // Función para cerrar el modal
    function closeModal() {
        const modal = document.getElementById('payment-modal');
        modal.querySelector('input[type="checkbox"]').checked = false;
    }
