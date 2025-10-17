// ===================================
// ELEMENTOS DO DOM
// ===================================

const cartBtn = document.getElementById("cart-btn");
const cartCounter = document.getElementById("cart-count");
const statusBadge = document.getElementById("status-badge");

// ===================================
// VARIÁVEIS GLOBAIS
// ===================================

let cart = [];

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

window.addEventListener('scroll', function() {
    const navbar = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        navbar.style.padding = '0.5rem 0';
    } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        navbar.style.padding = '1rem 0';
    }
});

// ===================================
// SMOOTH SCROLL
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// MODAL DO CARRINHO COM SWEETALERT2
// ===================================

cartBtn.addEventListener("click", function() {
    showCartModal();
});

function showCartModal() {
    if (cart.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrinho Vazio',
            text: 'Adicione itens ao carrinho para continuar!',
            confirmButtonText: 'Ver Cardápio',
            confirmButtonColor: '#D4AF37',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
            }
        });
        return;
    }
    
    const cartItemsHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 12px; margin-bottom: 0.75rem;">
            <div style="text-align: left; flex-grow: 1;">
                <h5 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 700; color: #2C2C2C;">${item.name}</h5>
                <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">Quantidade: ${item.quantity}</p>
                <p style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #D4AF37;">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
            </div>
            <button onclick="removeItemCart('${item.name}')" style="background: #DC3545; color: white; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    Swal.fire({
        title: '<i class="fas fa-shopping-cart"></i> Meu Carrinho',
        html: `
            <div style="max-height: 400px; overflow-y: auto; padding: 0.5rem;">
                ${cartItemsHTML}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1rem; background: white; border-radius: 12px; margin: 1.5rem 0; border: 2px solid #D4AF37;">
                <span style="font-size: 1.3rem; font-weight: 700; color: #2C2C2C;">Total:</span>
                <span style="font-size: 2rem; font-weight: 900; color: #D4AF37;">${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div style="text-align: left; margin-top: 1.5rem;">
                <label style="font-weight: 600; color: #2C2C2C; margin-bottom: 0.5rem; display: block;">
                    <i class="fas fa-map-marker-alt"></i> Endereço de Entrega
                </label>
                <input type="text" id="swal-address" class="swal2-input" placeholder="Digite seu endereço completo..." style="width: 100%; padding: 1rem; border: 2px solid #dee2e6; border-radius: 12px; font-size: 1rem;">
            </div>
        `,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: '<i class="fab fa-whatsapp"></i> Finalizar Pedido',
        cancelButtonText: 'Continuar Comprando',
        confirmButtonColor: '#D4AF37',
        cancelButtonColor: '#6c757d',
        customClass: {
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel'
        },
        showClass: {
            popup: 'animate__animated animate__zoomIn'
        },
        hideClass: {
            popup: 'animate__animated animate__zoomOut'
        },
        preConfirm: () => {
            const address = document.getElementById('swal-address').value;
            if (!address || address.trim() === '') {
                Swal.showValidationMessage('Por favor, digite seu endereço completo');
                return false;
            }
            return address;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            checkoutOrder(result.value);
        }
    });
}

// ===================================
// ADICIONAR AO CARRINHO
// ===================================

document.addEventListener("click", function(event) {
    if (event.target.closest(".add-to-cart-btn")) {
        const button = event.target.closest(".add-to-cart-btn");
        const name = button.getAttribute("data-name");
        const price = parseFloat(button.getAttribute("data-price"));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }
    
    updateCartCounter();
    
    // Toast de sucesso com SweetAlert2
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
    
    Toast.fire({
        icon: 'success',
        title: 'Item adicionado!',
        text: `${name} foi adicionado ao carrinho`
    });
    
    // Animação do botão do carrinho
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 300);
}

// ===================================
// REMOVER ITEM DO CARRINHO
// ===================================

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);
    
    if (index !== -1) {
        const item = cart[index];
        
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        
        updateCartCounter();
        showCartModal(); // Reabrir o modal atualizado
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
        
        Toast.fire({
            icon: 'info',
            title: 'Item removido',
            text: `${name} foi removido do carrinho`
        });
    }
}

// ===================================
// ATUALIZAR CONTADOR DO CARRINHO
// ===================================

function updateCartCounter() {
    cartCounter.innerText = cart.length;
}

// ===================================
// FINALIZAR PEDIDO
// ===================================

function checkoutOrder(address) {
    const isOpen = checkRestaurantOpen();
    
    if (!isOpen) {
        Swal.fire({
            icon: 'error',
            title: 'Restaurante Fechado',
            text: 'Ops! O restaurante está fechado no momento. Horário de funcionamento: 18:00 às 22:00',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#DC3545',
            showClass: {
                popup: 'animate__animated animate__shakeX'
            }
        });
        return;
    }
    
    if (cart.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrinho Vazio',
            text: 'Adicione itens ao carrinho antes de finalizar o pedido!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#D4AF37'
        });
        return;
    }
    
    // Montar mensagem do pedido
    const cartItems = cart.map((item) => {
        return `*${item.name}*\nQuantidade: ${item.quantity}\nPreço: R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    }).join("\n");
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const message = encodeURIComponent(
        `🍔 *NOVO PEDIDO - BULL BURGER*\n\n` +
        `${cartItems}\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `*TOTAL: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}*\n\n` +
        `📍 *Endereço de Entrega:*\n${address}`
    );
    
    const phone = "5511977218265";
    
    // Confirmação final
    Swal.fire({
        icon: 'success',
        title: 'Pedido Confirmado!',
        text: 'Você será redirecionado para o WhatsApp para finalizar seu pedido.',
        confirmButtonText: 'Abrir WhatsApp',
        confirmButtonColor: '#25D366',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#6c757d',
        showClass: {
            popup: 'animate__animated animate__bounceIn'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Abrir WhatsApp
            window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
            
            // Limpar carrinho
            cart = [];
            updateCartCounter();
            
            // Mensagem de sucesso
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            
            Toast.fire({
                icon: 'success',
                title: 'Pedido enviado!',
                text: 'Aguarde o contato via WhatsApp'
            });
        }
    });
}

// ===================================
// VERIFICAR HORÁRIO DE FUNCIONAMENTO
// ===================================

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 22;
}

function updateRestaurantStatus() {
    const isOpen = checkRestaurantOpen();
    
    if (isOpen) {
        statusBadge.classList.remove("closed");
        statusBadge.classList.add("open");
        statusBadge.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Aberto Agora - 18:00 às 22:00</span>
        `;
    } else {
        statusBadge.classList.remove("open");
        statusBadge.classList.add("closed");
        statusBadge.innerHTML = `
            <i class="fas fa-clock"></i>
            <span>Fechado - Abre às 18:00</span>
        `;
    }
}

// Atualizar status ao carregar a página
updateRestaurantStatus();

// Atualizar status a cada minuto
setInterval(updateRestaurantStatus, 60000);

// ===================================
// ANIMAÇÕES DE ENTRADA
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Observar elementos para animação
document.querySelectorAll('.menu-item-card, .feature-card, .contact-card').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
});

// ===================================
// INICIALIZAÇÃO
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
    console.log('🍔 Bull Burger - Sistema carregado com sucesso!');
    
    // Adicionar animação CSS do Animate.css via CDN
    const animateCSS = document.createElement('link');
    animateCSS.rel = 'stylesheet';
    animateCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(animateCSS);
});

