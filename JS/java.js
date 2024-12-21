// Definir las variables globales para manejar los elementos del DOM
const numbersContainer = document.getElementById('numbersContainer');
const selectionOption = document.getElementById('selectionOption');
const registerBtn = document.getElementById('registerBtn');
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');
const paymentMethodSelect = document.getElementById('paymentMethod');
const paymentDetailContainer = document.getElementById('paymentDetailContainer');
const paymentDetailInput = document.getElementById('paymentDetail');
const paymentImageInput = document.getElementById('paymentImage');
const paymentImagePreview = document.getElementById('paymentImagePreview');

// URL de Google Sheets
const SHEET_URL = "#";

let numerosOcupados = [];

// Detalles únicos por método de pago
const paymentDetails = {
    binance: "22312412",
    paix: "123456789",
    bybit: "BYBIT12345",
    nequi: "987654321",
};
// Función para cargar los números ocupados desde Google Sheets
async function cargarNumerosOcupados() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        numerosOcupados = data.map(item => item.NúmerosSeleccionados.split(','))
            .flat()
            .map(num => num.trim().padStart(3, '0')); // Asegurar formato de tres dígitos
        return numerosOcupados;
    } catch (error) {
        console.error('Error cargando números ocupados:', error);
        Swal.fire('Error', 'No se pudieron cargar los números ocupados. Intenta más tarde.', 'error');
        return [];
    }
}

// Función para generar los números del 000 al 999 y marcarlos según su estado
async function generarNumeros() {
    await cargarNumerosOcupados();

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 101; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        const number = i.toString().padStart(3, '0');
        numberDiv.textContent = number;

        if (numerosOcupados.includes(number)) {
            numberDiv.classList.add('occupied');
        }

        numberDiv.addEventListener('click', () => {
            if (numberDiv.classList.contains('occupied')) {
                Swal.fire('Número ocupado', `El número ${number} ya está ocupado.`, 'error');
            } else {
                toggleSelection(numberDiv);
            }
        });

        fragment.appendChild(numberDiv);
    }
    numbersContainer.appendChild(fragment);
}

// Mostrar detalle según el método de pago seleccionado
function mostrarDetallePago() {
    const method = paymentMethodSelect.value;
    if (method) {
        paymentDetailInput.value = paymentDetails[method];
        paymentDetailContainer.classList.remove('hidden');
    } else {
        paymentDetailContainer.classList.add('hidden');
        paymentDetailInput.value = "";
    }
}

// Alternar la selección de números
function toggleSelection(element) {
    const selectedNumbers = document.querySelectorAll('.number.selected');
    const maxNumbers = parseInt(selectionOption.value);

    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
    } else if (selectedNumbers.length < maxNumbers) {
        element.classList.add('selected');
    } else {
        Swal.fire('Límite alcanzado', `Solo puedes seleccionar ${maxNumbers} número(s).`, 'warning');
    }

    registerBtn.disabled = document.querySelectorAll('.number.selected').length === 0;
}

// Mostrar el modal con los datos seleccionados
function mostrarModal() {
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent.padStart(3, '0'));

    document.getElementById('modalSelectedNumbers').textContent = `Números seleccionados: ${selectedNumbers.join(', ')}`;
    document.getElementById('modalTotalValue').textContent = `Total a pagar: $${(selectedNumbers.length * 20000).toLocaleString()}`;
    modal.style.display = 'block';
}

// Subir la imagen seleccionada a un servidor y obtener la URL
async function subirImagen(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        // Cambia esta URL por la del servicio donde vas a subir las imágenes
        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: 'Client-ID TU_CLIENT_ID', // Reemplazar con el Client ID de Imgur
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            return data.data.link; // URL de la imagen subida
        } else {
            throw new Error('No se pudo subir la imagen');
        }
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        Swal.fire('Error', 'No se pudo subir la imagen. Intenta nuevamente.', 'error');
        return null;
    }
}

// Enviar datos al servidor al completar el formulario
async function enviarFormulario(e) {
    e.preventDefault();

    // Obtener los números seleccionados
    const selectedNumbers = [...document.querySelectorAll('.number.selected')].map(el => el.textContent.padStart(3, '0'));

    // Calcular el total a pagar
    const total = selectedNumbers.length * 20000;

    // Usar la URL de la imagen de la vista previa
    const paymentImageURL = paymentImagePreview.src;

    // Obtener los datos del formulario
    const formData = {
        Nombres: document.getElementById('Nombres').value,
        Apellido: document.getElementById('Apellido').value,
        Email: document.getElementById('Email').value,
        Ciudad: document.getElementById('Ciudad').value,
        País: document.getElementById('País').value,
        Responsable: document.getElementById('Nombre_de_responsable').value,
        CelularResponsable: document.getElementById('Celular_de_responsable').value,
        Premio: document.getElementById('Premio').value,
        NúmerosSeleccionados: selectedNumbers.join(','),
        Total: total,
        PaymentMethod: document.getElementById('paymentMethod').value,
        PaymentDetail: document.getElementById('paymentDetail').value,
        PaymentImageURL: paymentImageURL, // Enviar la URL de la imagen subida
    };

    try {
        // Enviar los datos a Google Sheets
        await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        // Actualizar la lista de números ocupados
        numerosOcupados.push(...selectedNumbers);

        // Marcar los números seleccionados como ocupados
        selectedNumbers.forEach(num => {
            const numberDiv = [...document.querySelectorAll('.number')].find(el => el.textContent === num);
            if (numberDiv) {
                numberDiv.classList.remove('selected');
                numberDiv.classList.add('occupied');
            }
        });

        // Mostrar el modal con los detalles
        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            html: `
                <p><b>Nombres:</b> ${formData.Nombres}</p>
                <p><b>Apellido:</b> ${formData.Apellido}</p>
                <p><b>Email:</b> ${formData.Email}</p>
                <p><b>Ciudad:</b> ${formData.Ciudad}</p>
                <p><b>País:</b> ${formData.País}</p>
                <p><b>Responsable:</b> ${formData.Responsable}</p>
                <p><b>Celular Responsable:</b> ${formData.CelularResponsable}</p>
                <p><b>Premio:</b> ${formData.Premio}</p>
                <p><b>Números Seleccionados:</b> ${selectedNumbers.join(', ')}</p>
                <p><b>Total a pagar:</b> $${total.toLocaleString()}</p>
                <p><b>Método de pago:</b> ${formData.PaymentMethod}</p>
                <p><b>Detalle del pago:</b> ${formData.PaymentDetail}</p>
                <p><b>Imagen de pago:</b> <img src="${formData.PaymentImageURL}" alt="Imagen de pago" style="max-width: 200px;"></p>
            `
        }).then(() => {
            modal.style.display = 'none';
            modalForm.reset();
            registerBtn.disabled = true;
        });
    } catch (error) {
        Swal.fire('Error', 'No se pudieron guardar los datos.', 'error');
    }
}

// Manejar el evento de cambio del input de archivo
paymentImageInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('image/')) {
            const imageUrl = await subirImagen(file); // Subir la imagen y obtener la URL
            if (imageUrl) {
                paymentImagePreview.src = imageUrl;
                paymentImagePreview.style.display = 'block';
            } else {
                paymentImageInput.value = '';
                paymentImagePreview.style.display = 'none';
            }
        } else {
            Swal.fire('Archivo no válido', 'Por favor selecciona una imagen.', 'error');
            paymentImageInput.value = '';
            paymentImagePreview.style.display = 'none';
        }
    } else {
        paymentImagePreview.style.display = 'none';
    }
});


// Función para cerrar el modal
function closeModal() {
    modal.style.display = 'none';
}

// Agregar eventos de interacción
paymentMethodSelect.addEventListener('change', mostrarDetallePago);
registerBtn.addEventListener('click', mostrarModal);
modalForm.addEventListener('submit', enviarFormulario);

// Inicializar la generación de números
generarNumeros();
