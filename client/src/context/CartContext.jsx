import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);
const KEY = 'pv_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    total: items.reduce((sum, i) => sum + i.price, 0),
    add: (item) => setItems((prev) => [...prev, item]),
    remove: (index) => setItems((prev) => prev.filter((_, i) => i !== index)),
    clear: () => setItems([])
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
