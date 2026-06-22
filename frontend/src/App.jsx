import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import AdminLayout from './components/AdminLayout'
import LojaPage from './pages/LojaPage'
import ClientesPage from './pages/ClientesPage'
import ProdutosPage from './pages/ProdutosPage'
import PedidosPage from './pages/PedidosPage'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Loja pública */}
        <Route path="/" element={<LojaPage />} />

        {/* Painel administrativo interno */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/clientes" replace />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
        </Route>

        {/* Compatibilidade com links antigos */}
        <Route path="/clientes" element={<Navigate to="/admin/clientes" replace />} />
        <Route path="/produtos" element={<Navigate to="/admin/produtos" replace />} />
        <Route path="/pedidos" element={<Navigate to="/admin/pedidos" replace />} />
      </Routes>
    </CartProvider>
  )
}
