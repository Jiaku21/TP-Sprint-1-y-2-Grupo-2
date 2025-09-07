// app.js - Archivo unificado con todas las funcionalidades y carga asíncrona

// Función para mostrar productos destacados (página de inicio)
async function mostrarProductosDestacados() {
    const contenedor = document.getElementById("productos-container");
    if (!contenedor) return; // Solo ejecutar si el contenedor existe

    // Verificar que datosProductos esté disponible
    if (!window.datosProductos) {
        console.error('datosProductos no está disponible');
        return;
    }

    const { cargarProductos, obtenerCarrito, guardarCarrito, actualizarContador, mostrarCargando, mostrarError } = window.datosProductos;

    try {
        // Mostrar estado de carga
        mostrarCargando(contenedor, 'Cargando productos destacados...');

        // Cargar productos de forma asíncrona
        const { lista: productosCompletos } = await cargarProductos();

        // Array de productos destacados (seleccionamos 6 productos)
        const productosDestacados = productosCompletos.slice(0, 6);

        // Limpiar contenedor y renderizar productos
        contenedor.innerHTML = "";
        const idsAgregados = new Set();
        
        productosDestacados.forEach(prod => {
            if (!idsAgregados.has(prod.id)) {
                idsAgregados.add(prod.id);
                const article = document.createElement("article");
                article.classList.add("producto");
                article.setAttribute("data-id", prod.id);
                article.innerHTML = `
                    <a href="producto.html?id=${prod.id}">
                        <img src="${prod.imagen}" alt="${prod.nombre}">
                        <h3>${prod.nombre}</h3>
                        <p class="precio">$${prod.precio.toLocaleString("es-AR")}</p>
                    </a>
                    <button type="button" data-add-cart="${prod.id}">
                        Añadir al Carrito
                    </button>
                `;
                contenedor.appendChild(article);
            }
        });

        console.log('✅ Productos destacados renderizados exitosamente');

    } catch (error) {
        console.error('❌ Error al cargar productos destacados:', error);
        mostrarError(contenedor, 'Error al cargar productos destacados');
    }
}

// Función para inicializar la página de productos (catálogo)
async function inicializarProductos() {
    const contenedor = document.querySelector(".catalogo-grid");
    if (!contenedor) return; // Si no existe el contenedor, salir
    
    // Verificar que datosProductos esté disponible
    if (!window.datosProductos) {
        console.error('datosProductos no está disponible');
        return;
    }

    const { cargarProductos, obtenerCarrito, guardarCarrito, actualizarContador, mostrarCargando, mostrarError } = window.datosProductos;

    try {
        // Mostrar estado de carga
        mostrarCargando(contenedor, 'Cargando catálogo de productos...');

        // Cargar productos de forma asíncrona
        const { lista: productosLista } = await cargarProductos();

        // Limpiar contenedor
        contenedor.innerHTML = "";

        // Generar el HTML para cada producto
        productosLista.forEach(prod => {
            const card = document.createElement("div");
            card.className = "producto";

            card.innerHTML = `
            <a href="producto.html?id=${prod.id}">
              <img src="${prod.imagen}" alt="${prod.nombre}">
              <h3>${prod.nombre}</h3>
            </a>
            <p class="precio">$${prod.precio.toLocaleString("es-AR")}</p>
            <label>
            Cantidad: <input type="number" min="1" max="10" value="1">
            </label>
            <button class="agregar-carrito" data-id="${prod.id}">Agregar al carrito</button>
            `;

            contenedor.appendChild(card);
        });

        // Evento para agregar al carrito
        contenedor.addEventListener('click', function(e) {
            if (e.target.classList.contains('agregar-carrito')) {
                const id = e.target.dataset.id;
                const cantidadInput = e.target.parentElement.querySelector('input[type="number"]');
                const cantidad = parseInt(cantidadInput.value, 10);

                let carrito = obtenerCarrito();
                if (carrito[id]) {
                    carrito[id].cantidad += cantidad;
                } else {
                    carrito[id] = { cantidad };
                }
                guardarCarrito(carrito);
                actualizarContador();
                // Mensaje de confirmación
                e.target.textContent = 'Agregado!';
                setTimeout(() => {
                    e.target.textContent = 'Agregar al carrito';
                }, 1200);
            }
        });

        console.log('✅ Catálogo de productos renderizado exitosamente');

    } catch (error) {
        console.error('❌ Error al cargar catálogo:', error);
        mostrarError(contenedor, 'Error al cargar el catálogo de productos');
    }
}

// Función para inicializar la página de producto individual
async function inicializarProducto() {
  const contenedor = document.getElementById("detalle-container");
  if (!contenedor) return; // Si no existe el contenedor, salir

  // Verificar que datosProductos esté disponible
  if (!window.datosProductos) {
    console.error('datosProductos no está disponible');
    return;
  }

  const { cargarProductoPorId, obtenerCarrito, guardarCarrito, actualizarContador, mostrarCargando, mostrarError } = window.datosProductos;

  // 1. Obtener el ID del producto desde la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    console.error('ID del producto no encontrado en la URL');
    mostrarError(contenedor, 'ID del producto no encontrado');
    return;
  }

  try {
    // Mostrar estado de carga
    mostrarCargando(contenedor, 'Cargando detalle del producto...');

    // 2. Cargar producto de forma asíncrona
    const producto = await cargarProductoPorId(id);

    if (!producto) {
      console.error('Producto no encontrado');
      mostrarError(contenedor, 'Producto no encontrado');
      return;
    }

    // 3. Generar el HTML
    contenedor.innerHTML = `
      <div class="producto-detalle">
        <div class="detalle-imagen">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="detalle-info">
          <h1>${producto.nombre}</h1>
          <p>${producto.descripcion}</p>
          <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
          <label>
            Cantidad: <input type="number" min="1" max="10" value="1" id="cantidad-producto">
          </label>
          <button id="agregar-carrito-detalle">Añadir al Carrito</button>
        </div>
      </div>
    `;

    // Lógica para agregar al carrito desde la página de detalle
    const btn = document.getElementById('agregar-carrito-detalle');
    if (btn) {
      btn.addEventListener('click', function() {
        const cantidad = parseInt(document.getElementById('cantidad-producto').value, 10) || 1;
        let carrito = obtenerCarrito();
        if (carrito[id]) {
          carrito[id].cantidad += cantidad;
        } else {
          carrito[id] = { cantidad };
        }
        guardarCarrito(carrito);
        actualizarContador();
        
        // Mensaje de confirmación
        btn.textContent = 'Producto añadido!';
        setTimeout(() => {
          btn.textContent = 'Añadir al Carrito';
        }, 1200);
      });
    }

    // Actualizar contador
    actualizarContador();

    console.log('✅ Producto detalle renderizado exitosamente');

  } catch (error) {
    console.error('❌ Error al cargar producto detalle:', error);
    mostrarError(contenedor, 'Error al cargar el detalle del producto');
  }
}

document.addEventListener("DOMContentLoaded", mostrarProductosDestacados);

// Funcionalidad para el formulario de contacto
function manejarFormularioContacto() {
    const formulario = document.querySelector('.form-contacto');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevenir el envío real del formulario
            
            // Mostrar mensaje de éxito
            mostrarMensajeExito();
            
            // Limpiar el formulario
            formulario.reset();
        });
    }
}

function mostrarMensajeExito() {
    // Crear el elemento del mensaje
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje-exito';
    mensaje.innerHTML = `
        <div class="mensaje-contenido">
            <span class="icono-exito">✓</span>
            <p>¡Mensaje enviado con éxito!</p>
            <p>Nos pondremos en contacto contigo a la brevedad.</p>
        </div>
    `;
    
    // Agregar el mensaje al body
    document.body.appendChild(mensaje);
    
    // Mostrar el mensaje con animación
    setTimeout(() => {
        mensaje.classList.add('mostrar');
    }, 100);
    
    // Ocultar el mensaje después de 4 segundos
    setTimeout(() => {
        mensaje.classList.remove('mostrar');
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.parentNode.removeChild(mensaje);
            }
        }, 300);
    }, 4000);
}

// --- Carrito funcional para productos destacados ---
function configurarCarritoDestacados() {
    // Verificar que datosProductos esté disponible
    if (!window.datosProductos) {
        console.error('datosProductos no está disponible');
        return;
    }

    const { obtenerCarrito, guardarCarrito, actualizarContador } = window.datosProductos;

    document.addEventListener('click', function(e) {
      if (e.target.matches('button[data-add-cart]')) {
        const id = e.target.getAttribute('data-add-cart');
        let carrito = obtenerCarrito();
        if (carrito[id]) {
          carrito[id].cantidad += 1;
        } else {
          carrito[id] = { cantidad: 1 };
        }
        guardarCarrito(carrito);
        actualizarContador();
        
        // Mostrar mensaje de confirmación
        e.target.textContent = '¡Agregado!';
        setTimeout(() => {
          e.target.textContent = 'Añadir al Carrito';
        }, 1200);
      }
    });
}
// --- Fin carrito funcional ---

// Inicializar la funcionalidad según la página cuando se carga el DOM
document.addEventListener("DOMContentLoaded", async function() {
    // Verificar que datosProductos esté disponible antes de continuar
    if (window.datosProductos) {
        const { actualizarContador } = window.datosProductos;
        actualizarContador();
        
        // Inicializar funcionalidades según la página usando async/await
        await mostrarProductosDestacados(); // Para página de inicio
        await inicializarProductos();       // Para página de catálogo
        await inicializarProducto();        // Para página de producto individual
        configurarCarritoDestacados(); // Para carrito en productos destacados
        
    } else {
        console.error('datosProductos no está disponible en app.js');
    }
    
    // Funcionalidad del formulario de contacto
    manejarFormularioContacto();
});
