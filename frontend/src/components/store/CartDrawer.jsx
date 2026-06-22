import { useCart } from '../../context/CartContext'
import { META_FRETE, DESCONTO_PIX } from '../../constants/loja'

export default function CartDrawer({ aberto, onClose, onCheckout }) {
  const { itens, updateQuantidade, removeFromCart, total } = useCart()

  const formatMoeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

  const descontoPix = total * DESCONTO_PIX
  const totalComDesconto = total - descontoPix
  const faltaFrete = Math.max(META_FRETE - total, 0)
  const progressoFrete = Math.min((total / META_FRETE) * 100, 100)

  return (
    <>
      <div
        className={`cart-overlay ${aberto ? 'cart-overlay-open' : ''}`}
        onClick={onClose}
      />
      <aside className={`cart-drawer ${aberto ? 'cart-drawer-open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Seu carrinho</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {itens.length > 0 && (
          <div className="shipping-progress-box">
            <div className="shipping-progress-label">
              {faltaFrete === 0
                ? <strong>Frete grátis garantido!</strong>
                : <>Faltam <strong>{formatMoeda(faltaFrete)}</strong> para o frete grátis</>}
            </div>
            <div className="shipping-progress-track">
              <div className="shipping-progress-fill" style={{ width: `${progressoFrete}%` }} />
            </div>
          </div>
        )}

        {itens.length === 0 ? (
          <div className="cart-empty">
            <p>Seu carrinho está vazio.</p>
            <span>Adicione produtos do catálogo para começar.</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {itens.map(({ produto, quantidade }) => (
                <div className="cart-item" key={produto.idProduto}>
                  <div className="cart-item-icon" aria-hidden="true">
                    {produto.imagemUrl ? <img src={produto.imagemUrl} alt="" /> : <BottleIcon />}
                  </div>
                  <div className="cart-item-info">
                    <strong>{produto.nome}</strong>
                    <span className="mono-num cart-item-price">{formatMoeda(produto.preco)} / un</span>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantidade(produto.idProduto, quantidade - 1)}
                      >−</button>
                      <span className="mono-num">{quantidade}</span>
                      <button
                        type="button"
                        disabled={quantidade >= (produto.estoque ?? 0)}
                        onClick={() => updateQuantidade(produto.idProduto, quantidade + 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <span className="mono-num cart-item-subtotal">
                      {formatMoeda(produto.preco * quantidade)}
                    </span>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeFromCart(produto.idProduto)}
                      title="Remover"
                    >&times;</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span className="mono-num">{formatMoeda(total)}</span>
              </div>
              <div className="cart-total-row promo-row">
                <span>Desconto no Pix (5%)</span>
                <span className="mono-num">− {formatMoeda(descontoPix)}</span>
              </div>
              <div className="cart-total-row grand-total">
                <span>Total</span>
                <strong>{formatMoeda(totalComDesconto)}</strong>
              </div>
              <button className="btn btn-primary cart-checkout-btn" onClick={onCheckout}>
                Finalizar pedido
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

export function BottleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2h4v3.2c0 .5.2 1 .6 1.4l1.2 1.2c.7.7 1.2 1.8 1.2 2.8V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10.6c0-1 .4-2.1 1.2-2.8l1.2-1.2c.4-.4.6-.9.6-1.4V2Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
      />
      <line x1="7.5" y1="13" x2="16.5" y2="13" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10" y1="4.3" x2="14" y2="4.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
