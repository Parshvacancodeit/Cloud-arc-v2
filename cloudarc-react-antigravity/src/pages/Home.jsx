import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Home.css';

const Home = () => {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right').forEach(el => {
      observer.observe(el);
    });

    // Smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text scroll-fade-in">
            <h1>Real-Time Workflow Control for <span className="highlight">Cloud Kitchens</span></h1>
            <p className="hero-subtitle">Track orders in real-time. Manage multiple brands. Integrate with every platform. Built for delivery-first operations that demand precision.</p>
            <Link to="/signup" className="hero-cta">Get Started Free</Link>
            <Link to="/login" className="hero-cta">Login</Link>
          </div>

          <div className="hero-visual scroll-fade-in">
            <div className="food-glow"></div>
            <div className="food-circle-container">
              <div className="food-item food-item-1">
                <img src="https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Delicious Pizza" />
              </div>
              <div className="food-item food-item-2">
                <img src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Fresh Salad" />
              </div>
              <div className="food-item food-item-3">
                <img src="https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Burger" />
              </div>
              <div className="food-item food-item-4">
                <img src="https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Pasta" />
              </div>
              <div className="food-item food-item-center">
                <img src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Gourmet Dish" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE ORDER TRACKING */}
      <section className="tracking-section" id="tracking">
        <div className="tracking-container">
          <div className="section-header scroll-fade-in">
            <h2>Live Order Tracking</h2>
            <p>Visual kanban board for complete operational visibility</p>
          </div>

          <div className="tracking-board scroll-fade-in">
            <div className="kanban-columns">
              <div className="kanban-column">
                <div className="column-header">
                  <div className="status-badge status-received"></div>
                  <h3>Received</h3>
                  <span className="order-count">4</span>
                </div>
                
                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2847</span>
                    <span className="order-time">2 min ago</span>
                  </div>
                  <div className="order-details">
                    2x Margherita Pizza<br />
                    1x Caesar Salad
                  </div>
                  <span className="order-platform">Zomato</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2848</span>
                    <span className="order-time">4 min ago</span>
                  </div>
                  <div className="order-details">
                    1x Chicken Burger<br />
                    2x Fries
                  </div>
                  <span className="order-platform">Swiggy</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2849</span>
                    <span className="order-time">5 min ago</span>
                  </div>
                  <div className="order-details">
                    3x Pasta Alfredo<br />
                    1x Garlic Bread
                  </div>
                  <span className="order-platform">Direct</span>
                </div>
              </div>

              <div className="kanban-column">
                <div className="column-header">
                  <div className="status-badge status-preparing"></div>
                  <h3>Preparing</h3>
                  <span className="order-count">6</span>
                </div>
                
                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2843</span>
                    <span className="order-time">8 min ago</span>
                  </div>
                  <div className="order-details">
                    2x Veg Biryani<br />
                    1x Raita
                  </div>
                  <span className="order-platform">Uber Eats</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2844</span>
                    <span className="order-time">10 min ago</span>
                  </div>
                  <div className="order-details">
                    1x Grilled Chicken<br />
                    2x Mashed Potatoes
                  </div>
                  <span className="order-platform">Zomato</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2845</span>
                    <span className="order-time">12 min ago</span>
                  </div>
                  <div className="order-details">
                    4x Tacos<br />
                    2x Nachos
                  </div>
                  <span className="order-platform">Swiggy</span>
                </div>
              </div>

              <div className="kanban-column">
                <div className="column-header">
                  <div className="status-badge status-ready"></div>
                  <h3>Ready</h3>
                  <span className="order-count">3</span>
                </div>
                
                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2838</span>
                    <span className="order-time">15 min ago</span>
                  </div>
                  <div className="order-details">
                    2x Pepperoni Pizza<br />
                    1x Coke
                  </div>
                  <span className="order-platform">Zomato</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2839</span>
                    <span className="order-time">16 min ago</span>
                  </div>
                  <div className="order-details">
                    1x Veggie Wrap<br />
                    1x Smoothie
                  </div>
                  <span className="order-platform">Direct</span>
                </div>
              </div>

              <div className="kanban-column">
                <div className="column-header">
                  <div className="status-badge status-dispatched"></div>
                  <h3>Dispatched</h3>
                  <span className="order-count">5</span>
                </div>
                
                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2832</span>
                    <span className="order-time">22 min ago</span>
                  </div>
                  <div className="order-details">
                    3x Sushi Rolls<br />
                    2x Miso Soup
                  </div>
                  <span className="order-platform">Uber Eats</span>
                </div>

                <div className="order-card">
                  <div className="order-header">
                    <span className="order-id">#2833</span>
                    <span className="order-time">24 min ago</span>
                  </div>
                  <div className="order-details">
                    2x Thai Curry<br />
                    2x Jasmine Rice
                  </div>
                  <span className="order-platform">Swiggy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CLOUDARC */}
      <section className="why-section" id="why">
        <div className="why-container">
          <div className="section-header scroll-fade-in">
            <h2>Why CloudArc?</h2>
            <p>Purpose-built for cloud kitchen operations</p>
          </div>

          <div className="why-grid">
            <div className="why-card scroll-slide-left">
              <div className="why-number">01</div>
              <h3>Speed Matters</h3>
              <p>Cloud kitchens operate on tight delivery windows. Real-time tracking ensures nothing gets delayed and every order is prioritized correctly.</p>
            </div>

            <div className="why-card scroll-slide-right">
              <div className="why-number">02</div>
              <h3>Multi-Brand Operations</h3>
              <p>Run multiple virtual brands from one kitchen. Separate order flows, unified operations, complete control over each brand.</p>
            </div>

            <div className="why-card scroll-slide-left">
              <div className="why-number">03</div>
              <h3>Data-Driven Decisions</h3>
              <p>Track preparation times, identify bottlenecks, optimize capacity, and make informed decisions based on real operational data.</p>
            </div>

            <div className="why-card scroll-slide-right">
              <div className="why-number">04</div>
              <h3>Platform Integration</h3>
              <p>Seamlessly connect with all major delivery platforms. One system to manage all your incoming orders from every source.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="section-header scroll-fade-in">
            <h2>Everything You Need</h2>
            <p>Complete workflow management for cloud kitchen operations</p>
          </div>

          <div className="features-grid">
            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3>Real-Time Order Flow</h3>
              <p>Track every order as it moves through your kitchen. Instant updates across all stations with zero delays.</p>
            </div>

            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3>Kanban Operations</h3>
              <p>Visual workflow management. Drag, drop, and organize orders across preparation stages intuitively.</p>
            </div>

            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h10"/>
                </svg>
              </div>
              <h3>Menu Management</h3>
              <p>Update menus in real-time across all platforms. Control availability, pricing, and descriptions centrally.</p>
            </div>

            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
              </div>
              <h3>Integrated POS</h3>
              <p>Built-in point-of-sale for walk-in orders. Unified system for delivery and dine-in with synchronized inventory.</p>
            </div>

            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                </svg>
              </div>
              <h3>Platform Integration</h3>
              <p>Connect seamlessly with Zomato, Swiggy, Uber Eats, and more. All orders in one unified system.</p>
            </div>

            <div className="feature-card scroll-fade-in">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <h3>Team Management</h3>
              <p>Role-based access, shift management, and performance tracking for your entire kitchen team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="integrations-section" id="integrations">
        <div className="integrations-container">
          <div className="scroll-fade-in">
            <h2>Seamless Integrations</h2>
            <p>Connect with the platforms you already use</p>
          </div>

          <div className="integration-logos-wrapper">
            <div className="integration-logos">
              <div className="integration-logo">
                <img src="https://cdn.worldvectorlogo.com/logos/zomato-1.svg" alt="Zomato" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg" alt="Swiggy" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Eats" />
              </div>
              <div className="integration-logo">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/PhonePe_Logo.svg" alt="PhonePe" />
              </div>
              {/* Duplicate for seamless loop */}
              <div className="integration-logo">
                <img src="https://cdn.worldvectorlogo.com/logos/zomato-1.svg" alt="Zomato" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg" alt="Swiggy" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Eats" />
              </div>
              <div className="integration-logo">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" />
              </div>
              <div className="integration-logo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/PhonePe_Logo.svg" alt="PhonePe" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
