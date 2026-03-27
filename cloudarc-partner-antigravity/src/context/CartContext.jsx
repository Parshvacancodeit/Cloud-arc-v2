import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ restaurantId: null, restaurantName: '', items: [] });

  const addItem = (restaurantId, restaurantName, item) => {
    setCart(prev => {
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        if (!window.confirm(`Your cart has items from ${prev.restaurantName}. Start a new cart for ${restaurantName}?`)) return prev;
        return { restaurantId, restaurantName, items: [{ ...item, quantity: 1 }] };
      }
      const existing = prev.items.find(i => i.id === item.id);
      if (existing) {
        return { ...prev, items: prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { restaurantId, restaurantName, items: [...prev.items, { ...item, quantity: 1 }] };
    });
  };

  const removeItem = (itemId) => {
    setCart(prev => {
      const updated = prev.items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
      return { ...prev, items: updated, restaurantId: updated.length === 0 ? null : prev.restaurantId };
    });
  };

  const clearCart = () => setCart({ restaurantId: null, restaurantName: '', items: [] });

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
