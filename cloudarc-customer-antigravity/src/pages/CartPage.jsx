import { FiShoppingBag, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { FiHome as HomeIcon } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const CartPage = ({ onNavigate }) => {
  const { cart, addItem, removeItem, totalItems, totalPrice } = useCart();

  if (totalItems === 0) return (
    <div>
      <div className="page-header"><div className="page-title">Your Cart</div></div>
      <div className="center-state">
        <div className="empty-icon"><FiShoppingBag size={48} /></div>
        <div className="empty-title">Cart is empty</div>
        <div className="empty-desc">Add items from a restaurant menu</div>
      </div>
      <button className="primary-btn" style={{ marginTop: 24 }} onClick={() => onNavigate('home', {})}>
        <HomeIcon style={{ marginRight: 8 }} /> Browse Restaurants
      </button>
    </div>
  );

  const delivery = 30;
  const taxes = Math.round(totalPrice * 0.05);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Your Cart</div>
        <div className="page-subtitle">{cart.restaurantName}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <div style={{ flex: 1 }}>
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price} each</div>
            </div>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => removeItem(item.id)}><FiMinus size={14}/></button>
              <span className="qty-num">{item.quantity}</span>
              <button className="qty-btn" onClick={() => addItem(cart.restaurantId, cart.restaurantName, item)}><FiPlus size={14}/></button>
            </div>
            <div style={{ minWidth: 56, textAlign: 'right', fontWeight: 700, fontSize: 14 }}>₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="cart-total-section" style={{ marginBottom: 16 }}>
        <div className="total-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
        <div className="total-row"><span>Delivery</span><span>₹{delivery}</span></div>
        <div className="total-row"><span>GST (5%)</span><span>₹{taxes}</span></div>
        <div className="total-row grand"><span>Total</span><span>₹{totalPrice + delivery + taxes}</span></div>
      </div>

      <button className="primary-btn" onClick={() => onNavigate('checkout', { total: totalPrice + delivery + taxes })}>
        Proceed to Checkout <FiArrowRight style={{ marginLeft: 8 }} />
      </button>
    </div>
  );
};

export default CartPage;
