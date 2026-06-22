import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getProdutos } from '../api/api'
import { useCart } from '../context/CartContext'
import { META_FRETE } from '../constants/loja'
import CartDrawer, { BottleIcon } from '../components/store/CartDrawer'
import CheckoutModal from '../components/store/CheckoutModal'
import Toast from '../components/Toast'
import './LojaPage.css'

export default function LojaPage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('Todos')
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [checkoutAberto, setCheckoutAberto] = useState(false)
  const [toast, setToast] = useState(null)

  const { addToCart, updateQuantidade, quantidadeTotal, itens: itensCarrinho } = useCart()

  const carregarProdutos = () => {
    setLoading(true)
    getProdutos()
      .then(res => setProdutos(res.data))
      .catch(() => setToast({ message: 'Não foi possível carregar o catálogo agora.', type: 'error' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregarProdutos() }, [])

  const categorias = useMemo(() => {
    const tipos = [...new Set(produtos.map(p => p.tipo).filter(Boolean))].sort()
    return ['Todos', ...tipos]
  }, [produtos])

  const produtosFiltrados = useMemo(() => {
    if (categoria === 'Todos') return produtos
    return produtos.filter(p => p.tipo === categoria)
  }, [produtos, categoria])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2200)
  }

  const handleAddToCart = (produto) => {
    const sucesso = addToCart(produto)
    if (!sucesso) {
      showToast(`Estoque máximo de "${produto.nome}" já está no carrinho.`, 'error')
    }
  }

  const formatMoeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

  return (
    <div className="loja">
      <div className="shipping-announce">
        Frete grátis em compras acima de {formatMoeda(META_FRETE)}
      </div>

      <header className="loja-header">
        <div className="loja-brand">
          <span className="brand-mark">DB</span>
          <div className="brand-text">
            <strong>Depósito</strong>
            <small>de Bebidas</small>
          </div>
        </div>

        <nav className="loja-categorias">
          {categorias.map(c => (
            <button
              key={c}
              className={`categoria-pill ${categoria === c ? 'categoria-pill-active' : ''}`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </nav>

        <button className="cart-button" onClick={() => setCarrinhoAberto(true)}>
          <BottleIcon />
          <span>Carrinho</span>
          {quantidadeTotal > 0 && <span className="cart-button-badge">{quantidadeTotal}</span>}
        </button>
      </header>

      <section className="loja-hero">
        <span className="page-eyebrow">Catálogo direto do depósito</span>
        <h1>Bebidas selecionadas,<br /><span>preço de quem distribui.</span></h1>
        <p>Compre direto do estoque do depósito — sem intermediário, com o preço de atacado repassado pra você.</p>
      </section>

      <section className="loja-catalogo">
        {loading ? (
          <div className="loading">CARREGANDO CATÁLOGO...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="empty">
            <h3>Nenhum produto encontrado</h3>
            <p>{produtos.length === 0 ? 'O catálogo ainda está sendo montado.' : 'Tente outra categoria.'}</p>
          </div>
        ) : (
          <div className="produto-grid">
            {produtosFiltrados.map(p => {
              const semEstoque = (p.estoque ?? 0) <= 0
              const estoqueBaixo = !semEstoque && p.estoque < 10
              const noCarrinho = itensCarrinho.find(i => i.produto.idProduto === p.idProduto)?.quantidade ?? 0
              const noLimite = !semEstoque && noCarrinho >= p.estoque
              const temDesconto = p.precoOriginal && p.precoOriginal > p.preco
              const percentualOff = temDesconto ? Math.round((1 - p.preco / p.precoOriginal) * 100) : null

              return (
                <article className="produto-card" key={p.idProduto}>
                  {temDesconto && (
                    <div className="discount-sticker">{percentualOff}%<span>OFF</span></div>
                  )}

                  <div className="produto-card-visual">
                    {p.imagemUrl ? (
                      <img
                        src={p.imagemUrl}
                        alt={p.nome}
                        className="produto-card-img"
                        onError={e => {
                          e.target.style.display = 'none'
                          e.target.nextElementSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="produto-card-icon-fallback" style={{ display: p.imagemUrl ? 'none' : 'flex' }}>
                      <BottleIcon />
                    </div>
                  </div>

                  <div className="produto-card-body">
                    {p.tipo && <span className="produto-tipo">{p.tipo}</span>}
                    <h3>{p.nome}</h3>

                    <div className="preco-bloco">
                      {temDesconto && <span className="preco-original">{formatMoeda(p.precoOriginal)}</span>}
                      <span className="preco-atual">{formatMoeda(p.preco)}</span>
                      <span className="preco-pix-tag">no pix</span>
                    </div>

                    <div className="produto-card-footer">
                      {semEstoque ? (
                        <button className="btn btn-primary produto-add-btn" disabled>Esgotado</button>
                      ) : noCarrinho > 0 ? (
                        <div className="qty-inline">
                          <button onClick={() => updateQuantidade(p.idProduto, noCarrinho - 1)}>−</button>
                          <span>{noCarrinho}</span>
                          <button disabled={noLimite} onClick={() => handleAddToCart(p)}>+</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary produto-add-btn" onClick={() => handleAddToCart(p)}>
                          Adicionar
                        </button>
                      )}
                    </div>

                    {estoqueBaixo && (
                      <div className="produto-card-tags">
                        <span className="badge badge-low produto-badge">Últimas unidades</span>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <footer className="loja-footer">
        <span>Sistema de Gestão — Depósito de Bebidas</span>
        <Link to="/admin">Painel administrativo</Link>
      </footer>

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

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  )
}
