

let productosMap = {};
let funcionesDatos = {};

// Función para mostrar el carrito
function mostrarCarrito() {
  const carrito = funcionesDatos.obtenerCarrito();
  const contenedor = document.getElementById('carrito-contenido');
  
  if (!contenedor) return; // Si no existe el contenedor, no hacer nada
  
  contenedor.innerHTML = '';

  if (Object.keys(carrito).length === 0) {
    contenedor.innerHTML = '<p>El carrito está vacío.</p>';
    return;
  }

  let total = 0;
  const tabla = document.createElement('table');
  tabla.className = 'tabla-carrito'; // Agregar clase CSS
  tabla.innerHTML = `<tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th>Acciones</th></tr>`;

  for (const id in carrito) {
    const prod = productosMap[id];
    if (!prod) continue;
    const cantidad = carrito[id].cantidad;
    const subtotal = prod.precio * cantidad;
    total += subtotal;
    const fila = document.createElement('tr');
      fila.innerHTML = `
        <td><img src="${prod.imagen}" alt="${prod.nombre}" style="width:80px;height:auto;vertical-align:middle;margin-right:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.12);"> <span style="vertical-align:middle;">${prod.nombre}</span></td>
        <td>${cantidad}</td>
        <td>$${prod.precio.toLocaleString('es-AR')}</td>
        <td>$${subtotal.toLocaleString('es-AR')}</td>
        <td><button class="eliminar btn-eliminar" data-id="${id}">Eliminar</button></td>
      `;
    tabla.appendChild(fila);
  }
  contenedor.appendChild(tabla);
  const totalDiv = document.createElement('div');
  totalDiv.className = 'carrito-total';
  totalDiv.innerHTML = `<h3>Total: $${total.toLocaleString('es-AR')}</h3>`;
  contenedor.appendChild(totalDiv);
}

// Función para inicializar el carrito
async function inicializarCarrito() {
  // Verificar que datosProductos esté disponible
  if (!window.datosProductos) {
    console.error('datosProductos no está disponible');
    return;
  }

  // Obtener funciones desde data.js
  const { cargarProductos, obtenerCarrito, guardarCarrito, actualizarContador, mostrarCargando, mostrarError } = window.datosProductos;
  funcionesDatos = { obtenerCarrito, guardarCarrito, actualizarContador };

  try {
    // Cargar productos de forma asíncrona
    const contenedor = document.getElementById('carrito-contenido');
    if (contenedor) {
      mostrarCargando(contenedor, 'Cargando carrito...');
    }
    
    const { porId } = await cargarProductos();
    productosMap = porId;

    // Mostrar carrito una vez que los productos están cargados
    mostrarCarrito();
    
  } catch (error) {
    console.error('Error al cargar productos para el carrito:', error);
    const contenedor = document.getElementById('carrito-contenido');
    if (contenedor) {
      mostrarError(contenedor, 'Error al cargar el carrito');
    }
  }

  // Evento para eliminar productos (versión simple como el original)
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('eliminar')) {
      const id = e.target.dataset.id;
      let carrito = funcionesDatos.obtenerCarrito();
      delete carrito[id];
      funcionesDatos.guardarCarrito(carrito);
      mostrarCarrito();
      funcionesDatos.actualizarContador();
    }
  });

  // Actualizar contador inicial
  funcionesDatos.actualizarContador();
}

// Inicializar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
  await inicializarCarrito();
});
