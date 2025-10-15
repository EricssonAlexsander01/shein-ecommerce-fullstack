document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Elementos do DOM (onde as informações serão exibidas)
    const productsListContainer = document.getElementById('carrinho-lista-produtos');
    const subtotalEl = document.getElementById('subtotal');
    const freteEl = document.getElementById('frete');
    const descontoEl = document.getElementById('desconto');
    const totalFinalEl = document.getElementById('total-final');
    const cartHeaderCountEl = document.getElementById('cart-header-count');
    
    // Variáveis de Regra (Podem ser configuradas)
    const FRETE_GRATIS_MIN = 100.00;
    const FRETE_PADRAO = 15.00;
    const DESCONTO_CUPOM = 10.00; // Simulação de desconto fixo

    // 2. Carrega os itens do LocalStorage (dados persistentes do carrinho)
    let cartItems = JSON.parse(localStorage.getItem('mySheinCarrinho')) || [];
    
    // 3. Funções Utilitárias
    
    // Formata o valor para o padrão Brasileiro (R$)
    const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Salva o estado atual do carrinho no LocalStorage
    function salvarCarrinho() {
        localStorage.setItem('mySheinCarrinho', JSON.stringify(cartItems));
    }

    // 4. FUNÇÃO DE ATUALIZAÇÃO DO RESUMO LATERAL
    function atualizarResumo() {
        // a. Calcular Subtotal
        let subtotalValue = cartItems.reduce((acc, item) => acc + (item.price * item.quantidade), 0);
        
        // b. Calcular Frete
        let freteValue = subtotalValue >= FRETE_GRATIS_MIN ? 0 : FRETE_PADRAO; 
        
        // c. Calcular Desconto
        let descontoAplicado = DESCONTO_CUPOM;
        
        // d. Calcular Total Final
        let totalFinalValue = subtotalValue - descontoAplicado + freteValue;

        // Atualizar o DOM
        subtotalEl.textContent = formatBRL(subtotalValue);
        
        // Atualiza a exibição do desconto (sempre negativo para visual)
        descontoEl.textContent = `- ${formatBRL(descontoAplicado)}`;
        
        // Atualiza a exibição do frete
        if (freteValue === 0) {
            freteEl.textContent = 'Grátis';
            freteEl.style.color = '#388e3c'; // Cor verde para Grátis
        } else {
            freteEl.textContent = formatBRL(freteValue);
            freteEl.style.color = '#555';
        }
        
        totalFinalEl.textContent = formatBRL(totalFinalValue);
        
        // Atualiza a contagem no título da seção
        cartHeaderCountEl.textContent = cartItems.length;
    }
    
    // 5. FUNÇÃO DE RENDERIZAÇÃO DA LISTA DE PRODUTOS
    function renderizarCarrinho() {
        productsListContainer.innerHTML = '';
        
        // Mensagem se o carrinho estiver vazio
        if (cartItems.length === 0) {
            productsListContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <p>Seu carrinho está vazio. </p>
                    <a href="index.html" class="btn-checkout-final" style="max-width: 300px; display: inline-block;">VOLTAR ÀS COMPRAS</a>
                </div>
            `;
        }

        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantidade;
            
            // ATENÇÃO: A imagem e a variante são genéricas pois não foram salvas no LocalStorage na página de detalhes.
            // Para um projeto completo, esses dados (image, variant) precisariam ser salvos no item.
            const imageUrl = item.image || 'img/imgblusa_principal.png.png';
            const variantText = item.variant || `Qtde: ${item.quantidade}`; 
            
            const itemHTML = `
                <div class="item-card" data-item-id="${item.id}">
                    <img src="${imageUrl}" alt="${item.nome}"> 
                    <div class="item-details-main">
                        <h4>${item.nome}</h4>
                        <p>${variantText}</p>
                    </div>
                    <div class="item-actions">
                        <div class="quantity-controls">
                            <button data-action="decrease" data-id="${item.id}">-</button>
                            <input type="number" value="${item.quantidade}" min="1" data-id="${item.id}" readonly>
                            <button data-action="increase" data-id="${item.id}">+</button>
                        </div>
                        <div class="item-price-total">${formatBRL(itemTotal)}</div>
                        <button class="remove-item-btn" data-action="remove" data-id="${item.id}">&times;</button>
                    </div>
                </div>
            `;
            productsListContainer.innerHTML += itemHTML;
        });
        
        // Chamada de atualização após o HTML ser renderizado
        atualizarResumo();
        salvarCarrinho();
    }

    // 6. OUVINTE DE EVENTOS (Para as interações de + / - / Remover)
    productsListContainer.addEventListener('click', (event) => {
        const target = event.target;
        const action = target.getAttribute('data-action');
        const itemId = parseInt(target.getAttribute('data-id'));

        // Se o clique não foi em um botão de ação, ignora.
        if (!action) return; 

        // Encontra o item no array pelo ID
        let itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;

        switch (action) {
            case 'increase':
                cartItems[itemIndex].quantidade++;
                break;
            case 'decrease':
                if (cartItems[itemIndex].quantidade > 1) {
                    cartItems[itemIndex].quantidade--;
                }
                break;
            case 'remove':
                // Remove o item do array
                cartItems.splice(itemIndex, 1);
                break;
        }

        // Após qualquer alteração, renderiza e atualiza novamente
        renderizarCarrinho();
    });

    // 7. INICIALIZAÇÃO: Renderiza o carrinho ao carregar a página
    renderizarCarrinho();
});