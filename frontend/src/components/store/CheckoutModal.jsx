import { useState } from 'react'
import Modal from '../Modal'
import { useCart } from '../../context/CartContext'
import { DESCONTO_PIX } from '../../constants/loja'
import { getClientes, criarCliente, criarPedido } from '../../api/api'

const emptyForm = { nome: '', cpf: '', telefone: '', endereco: '', cep: '' }

export default function CheckoutModal({ onClose, onPedidoConfirmado }) {
  const { itens, total, clearCart } = useCart()
  const [form, setForm] = useState(emptyForm)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)

  const formatMoeda = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`
  const descontoPix = total * DESCONTO_PIX
  const totalComDesconto = total - descontoPix

  const extrairApenasNumeros = (val) => {
    if (!val || typeof val !== 'string') return null
    const numeros = val.replace(/\D/g, '')
    return numeros || null
  }

  const mascararCpf = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const mascararCep = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
  }

  const mascararTelefone = (val) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const buscarOuCriarCliente = async () => {
    const cpfLimpo = extrairApenasNumeros(form.cpf)

    // Evita CPF duplicado: se já existe um cliente com esse CPF, reaproveita o cadastro
    if (cpfLimpo) {
      const res = await getClientes()
      const existente = res.data.find(c => extrairApenasNumeros(c.cpf) === cpfLimpo)
      if (existente) return existente.idCliente
    }

    const payload = {
      nome: form.nome.trim(),
      dataNascimento: null,
      cpf: cpfLimpo,
      telefone: form.telefone?.trim() || null,
      endereco: form.endereco?.trim() || null,
      cep: form.cep?.trim() || null,
    }
    const res = await criarCliente(payload)
    return res.data.idCliente
  }

  const finalizarPedido = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) {
      setErro('Informe seu nome para continuar.')
      return
    }
    if (itens.length === 0) {
      setErro('Seu carrinho está vazio.')
      return
    }

    setEnviando(true)
    setErro('')
    try {
      const idCliente = await buscarOuCriarCliente()
      const res = await criarPedido({
        idCliente,
        dataPedido: new Date().toISOString().slice(0, 10),
        itens: itens.map(i => ({ idProduto: i.produto.idProduto, quantidade: i.quantidade })),
      })
      setPedidoConfirmado(res.data)
      clearCart()
      onPedidoConfirmado?.()
    } catch (err) {
      const dados = err.response?.data
      const msg = typeof dados === 'string'
        ? dados
        : dados?.mensagem || (dados && typeof dados === 'object' ? Object.values(dados)[0] : null)
        || 'Não foi possível finalizar o pedido. Tente novamente.'
      setErro(msg)
    } finally {
      setEnviando(false)
    }
  }

  if (pedidoConfirmado) {
    return (
      <Modal title="Pedido confirmado" onClose={onClose}>
        <div className="checkout-success">
          <span className="checkout-success-icon">✓</span>
          <h3>Pedido <span className="id-tag">PD<strong>{String(pedidoConfirmado.idPedido).padStart(4, '0')}</strong></span> registrado!</h3>
          <p>Recebemos seu pedido no valor de <strong className="mono-num">{formatMoeda(totalComDesconto)}</strong> (pagando no Pix). Nossa equipe vai entrar em contato para combinar a entrega.</p>
          <button className="btn btn-primary" onClick={onClose}>Continuar comprando</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Finalizar pedido" onClose={onClose}>
      <form onSubmit={finalizarPedido}>
        <div className="checkout-summary">
          {itens.map(({ produto, quantidade }) => (
            <div className="checkout-summary-row" key={produto.idProduto}>
              <span>{quantidade}× {produto.nome}</span>
              <span className="mono-num">{formatMoeda(produto.preco * quantidade)}</span>
            </div>
          ))}
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span className="mono-num">{formatMoeda(total)}</span>
          </div>
          <div className="checkout-summary-row" style={{ color: 'var(--promo)' }}>
            <span>Desconto no Pix (5%)</span>
            <span className="mono-num">− {formatMoeda(descontoPix)}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span className="mono-num">{formatMoeda(totalComDesconto)}</span>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 22 }}>
          <div className="field span-2">
            <label>Nome completo</label>
            <input required maxLength={100} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="field">
            <label>CPF</label>
            <input maxLength={14} value={form.cpf} onChange={e => setForm({ ...form, cpf: mascararCpf(e.target.value) })} placeholder="000.000.000-00" />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input maxLength={15} value={form.telefone} onChange={e => setForm({ ...form, telefone: mascararTelefone(e.target.value) })} placeholder="(00) 00000-0000" />
          </div>
          <div className="field span-2">
            <label>Endereço de entrega</label>
            <input maxLength={150} value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="field">
            <label>CEP</label>
            <input maxLength={9} value={form.cep} onChange={e => setForm({ ...form, cep: mascararCep(e.target.value) })} placeholder="00000-000" />
          </div>
        </div>

        {erro && <p className="checkout-error">{erro}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
