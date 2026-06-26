import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getProdutos } from '../api/api'
import { useCart } from '../context/CartContext'
import CartDrawer, { BottleIcon } from '../components/store/CartDrawer'
import CheckoutModal from '../components/store/CheckoutModal'
import Toast from '../components/Toast'
import './LojaPage.css'

function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'https:' ? url.trim() : null
  } catch {
    return null
  }
}

function formatMoeda(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`
}

function getPercentualOff(produto) {
  if (!produto.precoOriginal || Number(produto.precoOriginal) <= Number(produto.preco)) return null
  return Math.round((1 - Number(produto.preco) / Number(produto.precoOriginal)) * 100)
}

function TimerOferta() {
  const [tempo, setTempo] = useState({ h: 14, m: 23, s: 58 })

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(atual => {
        let { h, m, s } = atual
        s -= 1
        if (s < 0) {
          s = 59
          m -= 1
        }
        if (m < 0) {
          m = 59
          h = Math.max(h - 1, 0)
        }
        return { h, m, s }
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

  const doisDigitos = (valor) => String(valor).padStart(2, '0')

  return (
    <div className="commercial-timer-box">
      <span>As ofertas acabam em:</span>
      <div className="timer-countdown-display">
        <span className="timer-unit-num">{doisDigitos(tempo.h)}</span>
        <span>:</span>
        <span className="timer-unit-num">{doisDigitos(tempo.m)}</span>
        <span>:</span>
        <span className="timer-unit-num">{doisDigitos(tempo.s)}</span>
      </div>
    </div>
  )
}

function ProductImage({ produto, className }) {
  const url = sanitizeImageUrl(produto.imagemUrl)

  if (url) {
    return <img src={url} className={className} alt={produto.nome} />
  }

  return (
    <div className={`${className} product-image-fallback`} aria-hidden="true">
      <BottleIcon />
    </div>
  )
}

export default function LojaPage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('Todos')
  const [busca, setBusca] = useState('')
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [checkoutAberto, setCheckoutAberto] = useState(false)
  const [toast, setToast] = useState(null)

  const { addToCart, updateQuantidade, quantidadeTotal, itens: itensCarrinho } = useCart()

  const carregarProdutos = () => {
    setLoading(true)
    getProdutos()
      .then(res => {
        if (Array.isArray(res.data)) {
          setProdutos(res.data)
        } else {
          setProdutos([])
          setToast({ message: 'Erro ao carregar dados do catálogo.', type: 'error' })
        }
      })
      .catch(() => setToast({ message: 'Não foi possível carregar o catálogo agora.', type: 'error' }))
      .finally(() => setLoading(false))
  }


  useEffect(() => {
    carregarProdutos()
  }, [])

  const categorias = useMemo(() => {
    const tipos = [...new Set(produtos.map(p => p.tipo).filter(Boolean))].sort()
    return ['Todos', ...tipos]
  }, [produtos])

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter(produto => {
      const combinaCategoria = categoria === 'Todos' || produto.tipo === categoria
      const combinaBusca = !termo || `${produto.nome} ${produto.tipo || ''}`.toLowerCase().includes(termo)
      return combinaCategoria && combinaBusca
    })
  }, [produtos, categoria, busca])

  const produtosDestaque = useMemo(() => produtos.slice(0, 3), [produtos])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2400)
  }

  const handleAddToCart = (produto) => {
    const sucesso = addToCart(produto)
    if (!sucesso) {
      showToast(`Estoque máximo de "${produto.nome}" já está no carrinho.`, 'error')
    }
  }

  return (
    <div className="loja">
      <div className="top-notice-bar">
        Atenção: ofertas exclusivas para a convocação de estoque deste mês.
      </div>

      <header className="store-header">
        <div className="header-logo-section">
          <img src="/assets/requints-logo.jpg" className="store-logo-img" alt="Requint's Distribuidora" />
          <div className="logo-bold">
            REQUINT'S
            <span>DISTRIBUIDORA</span>
          </div>
        </div>

        <div className="search-wrapper">
          <svg className="search-lens" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="O que você está procurando hoje?"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        <button className="header-cart-btn" onClick={() => setCarrinhoAberto(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>Carrinho</span>
          <span className="cart-badge-num">{quantidadeTotal}</span>
        </button>
      </header>

      <section className="campaign-hero">
        <div className="campaign-container">
          <div className="campaign-left-text">
            <div className="campaign-years-badge">
              17 <span>ANOS DE HISTÓRIA</span>
            </div>
            <h1 className="campaign-main-h1">
              A Convocação <span>dos Campeões</span>
            </h1>
            <p>
              Os rótulos mais procurados reunidos em uma campanha com valores diretos do depósito.
            </p>
            <div className="coupon-box">CUPOM: CASAEMFESTA</div>
          </div>

          <div className="champions-squad-grid">
            {(produtosDestaque.length ? produtosDestaque : [{ idProduto: 'a', nome: 'Licor 43' }, { idProduto: 'b', nome: 'Chivas 18Y' }, { idProduto: 'c', nome: "Jack Daniel's" }]).map((produto, index) => (
              <div className="shield-card" key={produto.idProduto}>
                <span className="shield-number">{index === 0 ? 43 : index === 1 ? 18 : 7}</span>
                <ProductImage produto={produto} className="shield-product-img" />
                <h4>{produto.nome}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="offers-section">
        <div className="offers-heading-bar">
          <div className="offers-title-flex">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <h2>Ofertas Relâmpago</h2>
          </div>
          <TimerOferta />
        </div>

        <nav className="category-filter-row" aria-label="Categorias">
          {categorias.map(c => (
            <button
              key={c}
              className={`filter-bubble-btn ${c === categoria ? 'active' : ''}`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="loading">Carregando catálogo...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="empty">
            <h3>Nenhum produto encontrado</h3>
            <p>{produtos.length === 0 ? 'O catálogo ainda está sendo montado.' : 'Tente outra busca ou categoria.'}</p>
          </div>
        ) : (
          <div className="showcase-products-grid">
            {produtosFiltrados.map(produto => {
              const semEstoque = (produto.estoque ?? 0) <= 0
              const quantidadeNoCarrinho = itensCarrinho.find(i => i.produto.idProduto === produto.idProduto)?.quantidade ?? 0
              const noLimite = !semEstoque && quantidadeNoCarrinho >= produto.estoque
              const percentualOff = getPercentualOff(produto)

              return (
                <article className="premium-product-card" key={produto.idProduto}>
                  {percentualOff && (
                    <div className="orange-discount-sticker">
                      {percentualOff}%<br /><span>OFF</span>
                    </div>
                  )}

                  <div className="diamond-bg-frame">
                    <ProductImage produto={produto} className="main-bottle-render" />
                  </div>

                  <h3 className="product-title-heading">{produto.nome}</h3>

                  <div className="commercial-pricing-zone">
                    <span className="pricing-label-muted">Por apenas:</span>
                    {percentualOff && (
                      <span className="pricing-strike-currency">{formatMoeda(produto.precoOriginal)}</span>
                    )}
                    <div className="pricing-bold-display">
                      <span>R$</span> {Number(produto.preco || 0).toFixed(2).split('.')[0]}
                      <span>,{Number(produto.preco || 0).toFixed(2).split('.')[1]}</span>
                    </div>
                    <span className="pix-condition-alert">No pix</span>

                    {semEstoque ? (
                      <button className="grid-buy-action-btn" disabled>Esgotado</button>
                    ) : quantidadeNoCarrinho > 0 ? (
                      <div className="grid-quantity-panel">
                        <button className="grid-panel-btn" onClick={() => updateQuantidade(produto.idProduto, quantidadeNoCarrinho - 1)}>-</button>
                        <span className="grid-panel-value">{quantidadeNoCarrinho}</span>
                        <button className="grid-panel-btn" disabled={noLimite} onClick={() => handleAddToCart(produto)}>+</button>
                      </div>
                    ) : (
                      <button className="grid-buy-action-btn" onClick={() => handleAddToCart(produto)}>Comprar</button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <CartDrawer
        aberto={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        onCheckout={() => { setCarrinhoAberto(false); setCheckoutAberto(true) }}
      />

      {checkoutAberto && (
        <CheckoutModal
          onClose={() => setCheckoutAberto(false)}
          onPedidoConfirmado={carregarProdutos}
        />
      )}

      <footer className="global-store-footer">
        <span>© 2026 Casa da Bebida. Todos os direitos reservados.</span>
        <Link to="/admin">Painel administrativo</Link>
      </footer>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}
