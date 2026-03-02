import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'luxe_cart'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)

  useEffect(() => save(items), [items])

  const addItem = (item) => {
    // item: { product_id, variant_id, product_name, brand, size_label, unit_price, image_url }
    setItems(prev => {
      const key = `${item.product_id}-${item.variant_id ?? 'no-variant'}`
      const idx = prev.findIndex(i => `${i.product_id}-${i.variant_id ?? 'no-variant'}` === key)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + (item.quantity ?? 1) }
        return updated
      }
      return [...prev, { ...item, id: Date.now(), quantity: item.quantity ?? 1 }]
    })
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const clearCart = () => setItems([])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
