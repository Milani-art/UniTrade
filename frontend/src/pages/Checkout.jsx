import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder, getCart, notifyOrderSellers } from '../utils/shop';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart] = useState(getCart);
  const [user, setUser] = useState(null);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  useEffect(() => { try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); } }, []);
  const total = cart.reduce((sum, item) => sum + Number(String(item.price).replace(/[^0-9.]/g, '')) * Number(item.quantity || 1), 0);

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!cart.length) { setError('Your cart is empty. Add an item before checking out.'); return; }
    const order = createOrder({ items: cart, customer: user, meetupLocation, paymentMethod });
    await notifyOrderSellers(order);
    setCompletedOrder(order);
  };

  return <div className="shop-page checkout-page"><div className="shop-heading"><div><span className="shop-eyebrow">FINAL STEP</span><h1>Checkout</h1><p>Confirm your collection details and place the order.</p></div><Link className="text-link" to="/cart">&#8592; Back to cart</Link></div>{error && <p className="checkout-error">{error}</p>}
    {!cart.length ? <div className="empty-shop"><h2>Nothing to check out</h2><p>Your cart is empty.</p><Link className="btn-primary" to="/search">Browse listings</Link></div> : <form className="checkout-grid" onSubmit={submitOrder}><section className="checkout-card"><div className="checkout-section-title"><span>01</span><div><h2>Collection details</h2><p>Choose a convenient public campus location.</p></div></div><label htmlFor="meetupLocation">Meet-up location</label><select id="meetupLocation" value={meetupLocation} onChange={(event) => setMeetupLocation(event.target.value)} required><option value="" disabled>Select a CPUT campus</option><option>Bellville Campus</option><option>District Six Campus</option><option>Granger Bay Campus</option><option>Mowbray Campus</option><option>Wellington Campus</option></select><label htmlFor="paymentMethod">Payment method</label><select id="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>EFT</option><option>Cash at meetup</option></select><div className="checkout-note"><strong>{user?.firstName ? `Order for ${user.firstName}` : 'Order account'}</strong><span>{user?.universityEmail || 'Your signed-in account'}</span></div></section><aside className="summary-card checkout-summary"><h2>Review order</h2>{cart.map((item) => <div className="checkout-item" key={item.id}><span>{item.name} <small>x{item.quantity || 1}</small></span><strong>R{(Number(String(item.price).replace(/[^0-9.]/g, '')) * Number(item.quantity || 1)).toFixed(2)}</strong></div>)}<hr /><div className="summary-total"><span>Total</span><strong>R{total.toFixed(2)}</strong></div><button className="btn-primary summary-button" type="submit">Place order <span aria-hidden="true">&#8594;</span></button></aside></form>}
    {completedOrder && <div className="confirmation-backdrop" role="presentation"><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title"><div className="confirmation-icon">&#10003;</div><span className="shop-eyebrow">ORDER CONFIRMED</span><h2 id="confirmation-title">Your order is confirmed.</h2><p>We've automatically sent an order confirmation message to the seller. You can now chat with them to arrange the collection at the agreed campus location.</p><button className="btn-primary summary-button" onClick={() => navigate(`/messages?seller=${encodeURIComponent(completedOrder.items[0]?.seller || '')}&fromCheckout=true`, { replace: true })}>Go to Messages <span aria-hidden="true">&#8594;</span></button></div></div>}
  </div>;
}
