import { Pedido } from '../models/Pedido.js';
import { Cliente } from '../models/Cliente.js';
import { Producto } from '../models/Producto.js';

// Formatear fecha
function formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${d.getFullYear()}`;
}

// Obtener Pedidos
async function renderPedidos(): Promise<void> {
    try {
        const response = await fetch('/api/pedidos'); // Endpoint del controlador
        if (!response.ok) {
            throw new Error('Error al obtener los pedidos');
        }

        const pedidos: Pedido[] = await response.json(); // Tipado explícito con Pedido
        const tableBody = document.querySelector('#pedidosTable tbody');

        if (!tableBody) {
            console.error('No se encontró el cuerpo de la tabla');
            return;
        }

        tableBody.innerHTML = ''; // Limpiar contenido previo

        pedidos.forEach((pedido) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.cliente?.razonSocial || 'Sin cliente'}</td>
                <td>${formatDate(pedido.fechaPedido)}</td>
                <td>${pedido.nroComprobante}</td>
                <td>${pedido.formaPago}</td>
                <td>${pedido.totalPedido}</td>
                <td>
                    <button class="btn-detalles" data-id="${pedido.id}">Ver Detalles</button>
                    <button class="btn-editar" data-id="${pedido.id}">Editar</button>
                    <button class="btn-eliminar" data-id="${pedido.id}">Eliminar</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        attachButtonListeners();
    } catch (error) {
        console.error('Error al renderizar los pedidos:', error);
    }
}
function cargarBotones(): void {
    const buscarBtn = document.querySelector('#buscarBtn');
    const buscarNumero = document.querySelector('#buscarNumero') as HTMLInputElement;
    if (buscarBtn && buscarNumero) {
        buscarBtn.addEventListener('click', () => {
            const nroComprobante = parseInt(buscarNumero.value);
            if (nroComprobante) {
                verDetallesNroComprobante(nroComprobante); // Llamamos a la función para obtener el detalle del pedido
            } else {
                alert('Por favor, ingrese un número de comprobante válido.');
            }
        });
    }
    document.querySelector('#buscarFechasBtn')?.addEventListener('click', () => {
        const fechaInicio = (document.querySelector('#fechaInicio') as HTMLInputElement).value;
        const fechaFin = (document.querySelector('#fechaFin') as HTMLInputElement).value;

        // Verificar que las fechas estén correctamente seleccionadas
        if (fechaInicio && fechaFin) {
            verPedidosPorFecha(fechaInicio, fechaFin); // Llamamos a la función para obtener los pedidos
        } else {
            alert('Por favor, ingrese un rango de fechas válido.');
        }
    });

}
// Atrapar eventos
function attachButtonListeners(): void {


    // Botones de Ver Detalles
    document.querySelectorAll('.btn-detalles').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const pedidoId = (event.target as HTMLElement).getAttribute('data-id');
            if (pedidoId) verDetalles(pedidoId);
        });
    });

    // Botones de Editar
    document.querySelectorAll('.btn-editar').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const pedidoId = (event.target as HTMLElement).getAttribute('data-id');
            if (pedidoId) editarPedido(pedidoId);
        });
    });

    // Botones de Eliminar
    document.querySelectorAll('.btn-eliminar').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const pedidoId = (event.target as HTMLElement).getAttribute('data-id');
            if (pedidoId) eliminarPedido(pedidoId);
        });
    });
}

// ------------------------------------------------------

// Botón 'Ver Detalles'
async function verDetalles(pedidoId: string): Promise<void> {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener detalles del pedido');
        }
        const pedido: Pedido = await response.json();
        mostrarModalDetalles(pedido);
    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
}

// Mostrar modal con detalles
function mostrarModalDetalles(pedidos: Pedido | Pedido[]): void {
    const modal = document.getElementById('pedidoDetallesModal');
    const modalInfo = document.getElementById('modalPedidoInfo');

    if (!modal || !modalInfo) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    // Verificar si el parámetro es un arreglo o un solo pedido
    const pedidosArray = Array.isArray(pedidos) ? pedidos : [pedidos];

    // Limpiar contenido previo del modal
    modalInfo.innerHTML = '';

    // Generar información y detalles para cada pedido
    pedidosArray.forEach(pedido => {
        const pedidoContainer = document.createElement('div');
        pedidoContainer.className = 'pedido-container';

        // Información del pedido
        const infoHTML = `
            <div class="pedido-info">
                <p><strong>ID Pedido:</strong> ${pedido.id}</p>
                <p><strong>Cliente:</strong> ${pedido.cliente?.razonSocial || 'Sin cliente'}</p>
                <p><strong>CUIT:</strong> ${pedido.cliente?.cuit || 'Sin CUIT'}</p>
                <p><strong>Fecha Pedido:</strong> ${formatDate(pedido.fechaPedido)}</p>
                <p><strong>Comprobante:</strong> ${pedido.nroComprobante}</p>
                <p><strong>Forma Pago:</strong> ${pedido.formaPago}</p>
                <p><strong>Observaciones:</strong> ${pedido.observaciones || 'Sin observaciones'}</p>
                <p><strong>Total Pedido:</strong> $${pedido.totalPedido}</p>
            </div>
        `;

        // Tabla de detalles del pedido
        const tablaDetalles = `
            <table class="pedido-detalles">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${pedido.detalles.map(detalle => `
                        <tr>
                            <td>${detalle.producto?.codigoProducto}</td>
                            <td>${detalle.producto?.denominacion}</td>
                            <td>${detalle.cantidad}</td>
                            <td>$${detalle.producto?.precioVenta}</td>
                            <td>$${detalle.subtotal}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Añadir información y tabla al contenedor del pedido
        pedidoContainer.innerHTML = infoHTML + tablaDetalles;
        modalInfo.appendChild(pedidoContainer);
    });

    // Mostrar modal
    modal.style.display = 'block';
}
// Evento para cerrar modal
function setupModalCierre(): void {
    const modal = document.getElementById('pedidoDetallesModal');
    const closeModal = document.querySelector('.close-modal');

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}
// --------------------------------------------------------

// EDITAR
async function editarPedido(pedidoId: string): Promise<void> {
    try {
        // Obtener los datos del pedido desde la API
        const response = await fetch(`/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos del pedido');
        }

        const pedido = await response.json();

        // Rellenar formulario con los datos del pedido
        const form = document.getElementById('pedidoForm') as HTMLFormElement;
        const clienteSelect = form.querySelector('#cliente') as HTMLSelectElement;
        const fechaPedidoInput = form.querySelector('#fechaPedido') as HTMLInputElement;
        const nroComprobanteInput = form.querySelector('#nroComprobante') as HTMLInputElement;
        const formaPagoInput = form.querySelector('#formaPago') as HTMLInputElement;
        const observacionesTextarea = form.querySelector('#observaciones') as HTMLTextAreaElement;
        const productosContainer = document.getElementById('productosContainer') as HTMLDivElement;
        const totalPedidoInput = document.getElementById('totalPedido') as HTMLInputElement;
        const modoOperacion = form.querySelector('#modoOperacion') as HTMLInputElement;

        // Establecer el modo de operación a "editar"
        modoOperacion.value = "editar";

        // Rellenar campos principales
        clienteSelect.value = pedido.idCliente.toString();
        fechaPedidoInput.value = new Date(pedido.fechaPedido).toISOString().split('T')[0];
        nroComprobanteInput.value = pedido.nroComprobante.toString();
        formaPagoInput.value = pedido.formaPago;
        observacionesTextarea.value = pedido.observaciones || '';

        // Limpiar productos actuales del contenedor
        productosContainer.innerHTML = '';

        // Rellenar productos del pedido
        const productos = await cargarProductos();
        pedido.detalles.forEach((detalle: any) => {
            const producto = productos.find((p: any) => p.id === detalle.idProducto);
            if (producto) {
                const productoItem = crearSelectorProducto(productos);
                const productoSelect = productoItem.querySelector('select[name="producto"]') as HTMLSelectElement;
                const cantidadInput = productoItem.querySelector('input[name="cantidad"]') as HTMLInputElement;
                const subtotalInput = productoItem.querySelector('input[name="subtotal"]') as HTMLInputElement;

                productoSelect.value = detalle.idProducto.toString();
                cantidadInput.value = detalle.cantidad.toString();
                subtotalInput.value = detalle.subtotal.toString();

                productosContainer.appendChild(productoItem);
            }
        });

        // Actualizar total del pedido
        actualizarTotalPedido();

        // Manejar envío del formulario para actualizar el pedido
        form.onsubmit = async (event) => {
            event.preventDefault();

            const detalles = Array.from(
                productosContainer.querySelectorAll('.producto-item')
            ).map(item => {
                const productoSelect = item.querySelector('select[name="producto"]') as HTMLSelectElement;
                const cantidadInput = item.querySelector('input[name="cantidad"]') as HTMLInputElement;
                const productoSeleccionado = productoSelect.selectedOptions[0] as HTMLOptionElement;

                return {
                    idProducto: parseInt(productoSelect.value),
                    cantidad: parseInt(cantidadInput.value),

                    producto: {
                        id: parseInt(productoSelect.value),
                        codigoProducto: productoSeleccionado.dataset.codigo || '',
                        denominacion: productoSeleccionado.text,
                        precioVenta: productoSeleccionado.dataset.precio || '0'
                    },

                };
            });

            const pedidoActualizado = {
                idCliente: parseInt(clienteSelect.value),
                fechaPedido: new Date(fechaPedidoInput.value).toISOString(),
                nroComprobante: parseInt(nroComprobanteInput.value),
                formaPago: formaPagoInput.value,
                observaciones: observacionesTextarea.value,
                detalles,
            };

            try {
                const response = await fetch(`/api/pedidos/${pedidoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pedidoActualizado),
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el pedido');
                }

                alert('Pedido actualizado exitosamente');
                form.reset();
                productosContainer.innerHTML = '';
                totalPedidoInput.value = '0.00';
                renderPedidos(); // Asume que esta función refresca la lista de pedidos
            } catch (error) {
                console.error('Error al actualizar el pedido:', error);
                alert('Ocurrió un error al actualizar el pedido');
            }
        };
    } catch (error) {
        console.error('Error al cargar los datos del pedido:', error);
        alert('No se pudo cargar los datos del pedido para editar');
    }
}


// --------------------------------------------
// ELIMINAR
async function eliminarPedido(id: string): Promise<void> {
    const confirmDelete = confirm(`¿Estás seguro de eliminar el pedido con ID: ${id}?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar el pedido');
        alert('Pedido eliminado exitosamente');
        renderPedidos();
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        alert('Ocurrió un error al intentar eliminar el pedido');
    }
}

// ------------------------------------------
// CREATE
// Cargar clientes
async function cargarClientes(): Promise<Cliente[]> {
    try {
        const response = await fetch('/api/clientes');
        return await response.json();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        return [];
    }
}

// Cargar productos
async function cargarProductos(): Promise<Producto[]> {
    try {
        const response = await fetch('/api/productos');
        return await response.json();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        return [];
    }
}

// Crear selector de producto
function crearSelectorProducto(productos: Producto[]): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('producto-item');

    // Selector de producto
    const productoSelect = document.createElement('select');
    productoSelect.name = 'producto';
    productoSelect.required = true;
    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id.toString();
        option.textContent = `${producto.codigoProducto} - ${producto.denominacion} ($${producto.precioVenta})`;
        option.dataset.precio = producto.precioVenta.toString();
        productoSelect.appendChild(option);
    });

    // Input de cantidad
    const cantidadInput = document.createElement('input');
    cantidadInput.type = 'number';
    cantidadInput.name = 'cantidad';
    cantidadInput.min = '1';
    cantidadInput.required = true;

    // Subtotal
    const subtotalInput = document.createElement('input');
    subtotalInput.type = 'number';
    subtotalInput.name = 'subtotal';
    subtotalInput.readOnly = true;

    // Botón eliminar
    const eliminarBtn = document.createElement('button');
    eliminarBtn.type = 'button';
    eliminarBtn.textContent = 'Eliminar';
    eliminarBtn.addEventListener('click', () => {
        container.remove(); // Eliminar el contenedor del producto
        actualizarTotalPedido(); // Actualizar el total del pedido
    });

    // Calcular subtotal en tiempo real
    productoSelect.addEventListener('change', calcularSubtotal);
    cantidadInput.addEventListener('input', calcularSubtotal);

    function calcularSubtotal() {
        const precioUnitario = parseFloat(
            (productoSelect.selectedOptions[0] as HTMLOptionElement).dataset.precio || '0'
        );
        const cantidad = parseInt(cantidadInput.value) || 0;
        const subtotal = precioUnitario * cantidad;
        subtotalInput.value = subtotal.toFixed(2);
        actualizarTotalPedido();
    }

    container.append(
        document.createTextNode('Producto: '),
        productoSelect,
        document.createTextNode(' Cantidad: '),
        cantidadInput,
        document.createTextNode(' Subtotal: '),
        subtotalInput,
        eliminarBtn
    );

    return container;
}

// Actualizar total del pedido
function actualizarTotalPedido() {
    const subtotales = document.querySelectorAll('input[name="subtotal"]');
    const totalInput = document.getElementById('totalPedido') as HTMLInputElement;

    const total = Array.from(subtotales).reduce((sum, input) => {
        return sum + parseFloat((input as HTMLInputElement).value || '0');
    }, 0);

    totalInput.value = total.toFixed(2);
}

// Manejar envío del formulario
async function handleSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const modoOperacion = form.querySelector('#modoOperacion') as HTMLInputElement;
    const clienteSelect = form.querySelector('#cliente') as HTMLSelectElement;
    const fechaPedido = form.querySelector('#fechaPedido') as HTMLInputElement;
    const nroComprobante = form.querySelector('#nroComprobante') as HTMLInputElement;
    const formaPago = form.querySelector('#formaPago') as HTMLSelectElement;
    const observaciones = form.querySelector('#observaciones') as HTMLTextAreaElement;

    if (modoOperacion.value === 'crear') {
        const detalles = Array.from(
            document.querySelectorAll('.producto-item')
        ).map(item => {
            const productoSelect = item.querySelector('select[name="producto"]') as HTMLSelectElement;
            const cantidadInput = item.querySelector('input[name="cantidad"]') as HTMLInputElement;
            const productoSeleccionado = productoSelect.selectedOptions[0] as HTMLOptionElement;

            return {
                idProducto: parseInt(productoSelect.value),
                producto: {
                    id: parseInt(productoSelect.value),
                    codigoProducto: productoSeleccionado.dataset.codigo || '',
                    denominacion: productoSeleccionado.text,
                    precioVenta: productoSeleccionado.dataset.precio || '0'
                },
                cantidad: parseInt(cantidadInput.value)
            };
        });

        const pedido = {
            idCliente: parseInt(clienteSelect.value),
            fechaPedido: new Date(fechaPedido.value).toISOString(),
            nroComprobante: parseInt(nroComprobante.value),
            formaPago: formaPago.value,
            observaciones: observaciones.value,
            detalles: detalles
        };

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Extrae el mensaje del backend
                throw new Error(errorData.message || 'Error al crear pedido');
            }

            const pedidoCreado = await response.json();
            alert('Pedido creado exitosamente');
            // Reiniciar el formulario
            form.reset(); // Resetear campos estándar
            const productosContainer = document.getElementById('productosContainer');
            if (productosContainer) {
                productosContainer.innerHTML = ''; // Eliminar productos dinámicos
            }

            // Restablecer el total del pedido
            const totalPedidoInput = document.getElementById('totalPedido') as HTMLInputElement;
            if (totalPedidoInput) {
                totalPedidoInput.value = '0.00';
            }

            renderPedidos();
        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
        }

    } else if (modoOperacion.value === 'editar') {
        // Lógica para editar un pedido (PUT)
        const pedidoId = (form.querySelector('#idPedido') as HTMLInputElement).value;
        editarPedido(pedidoId);
    }

}

// Inicializar formulario
async function inicializarFormulario() {
    const clientes = await cargarClientes();
    const productos = await cargarProductos();

    const clienteSelect = document.getElementById('cliente') as HTMLSelectElement;
    clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id.toString();
        option.textContent = cliente.razonSocial;
        clienteSelect.appendChild(option);
    });

    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    const productosContainer = document.getElementById('productosContainer');
    const pedidoForm = document.getElementById('pedidoForm');

    if (agregarProductoBtn && productosContainer) {
        agregarProductoBtn.addEventListener('click', () => {
            const nuevoProducto = crearSelectorProducto(productos);
            productosContainer.appendChild(nuevoProducto);
        });
    }

    if (pedidoForm) {
        pedidoForm.addEventListener('submit', handleSubmit);
    }
}

// Búsqueda por número de comprobante
async function verDetallesNroComprobante(nroComprobante: number): Promise<void> {
    try {
        const response = await fetch(`/api/pedidos/comprobante/${nroComprobante}`);

        if (!response.ok) {
            const errorResponse = await response.json();  // Obtener el JSON con el mensaje de error
            alert(errorResponse.message || 'Pedido no encontrado');
            return;  // Detener la ejecución si no se encuentra el pedido
        }

        const pedido: Pedido = await response.json();
        mostrarModalDetalles(pedido);
    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
}
async function verPedidosPorFecha(fechaInicio: string, fechaFin: string): Promise<void> {

    try {
        // Construir la URL con las fechas de inicio y fin
        const url = `/api/pedidos/rangoFecha/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorResponse = await response.json();  // Obtener el JSON con el mensaje de error
            alert(errorResponse.message || 'Pedidos por fecha no encontrado');
            return;
        }

        const pedidos: Pedido[] = await response.json();

        // Mostrar detalles si hay pedidos, o alerta si no hay
        if (pedidos.length > 0) {
            mostrarModalDetalles(pedidos);  // Mostrar los detalles de los pedidos
        } else {
            alert('No se encontraron pedidos en este rango de fechas.');
        }
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        alert('Hubo un error al obtener los pedidos. Intente nuevamente.');
    }
}
// Función que se llama al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    renderPedidos(); // Renderizar pedidos
    setupModalCierre(); // Configurar los eventos del modal
    inicializarFormulario();
    cargarBotones();
});
async function generarPDF(): Promise<void> {
    try {
        // Hacer la solicitud al backend para generar el PDF
        const response = await fetch('http://localhost:3000/api/pedidos/pdf/pdf', {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf', // Asegúrate de que el cliente espera un archivo PDF
            }
        });

        if (!response.ok) {
            throw new Error('Error al generar el PDF');
        }

        // Crear un Blob para manejar el archivo PDF
        const pdfBlob = await response.blob();

        // Crear un enlace de descarga para el PDF generado
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = 'pedidos.pdf'; // Nombre del archivo que se descargará
        a.click();
        URL.revokeObjectURL(pdfUrl); // Liberar la URL del Blob

    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
}

// Asociar la función al botón en el frontend
document.getElementById('generar-pdf')?.addEventListener('click', generarPDF);
