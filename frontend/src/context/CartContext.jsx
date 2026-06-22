import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]) // [{ produto, quantidade }]

  const addToCart = (produto) => {
    const existente = itens.find(i => i.produto.idProduto === produto.idProduto)
    const limite = produto.estoque ?? 0

    if (existente) {
      if (existente.quantidade >= limite) return false // já está no limite do estoque
      setItens(prev => prev.map(i =>
        i.produto.idProduto === produto.idProduto ? { ...i, quantidade: i.quantidade + 1 } : i
      ))
      return true
    }

    if (limite <= 0) return false
    setItens(prev => [...prev, { produto, quantidade: 1 }])
    return true
  }

  const updateQuantidade = (idProduto, quantidade) => {
    setItens(prev => {
      if (quantidade <= 0) return prev.filter(i => i.produto.idProduto !== idProduto)
      return prev.map(i => {
        if (i.produto.idProduto !== idProduto) return i
        const limite = i.produto.estoque ?? 0
        return { ...i, quantidade: Math.min(quantidade, limite) }
      })
    })
  }

  const removeFromCart = (idProduto) => {
    setItens(prev => prev.filter(i => i.produto.idProduto !== idProduto))
  }

  const clearCart = () => setItens([])

  const total = useMemo(
    () => itens.reduce((soma, i) => soma + Number(i.produto.preco) * i.quantidade, 0),
    [itens]
  )

  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade, 0),
    [itens]
  )

  return (
    <CartContext.Provider value={{
      itens, addToCart, updateQuantidade, removeFromCart, clearCart, total, quantidadeTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de um <CartProvider>')
  return ctx
}
