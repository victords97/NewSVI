import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { categories, currency, products, sviLinks } from "./data";
import "../styles.css";

const logo = "/assets/SVI.png";
const facade = "https://d2r9epyceweg5n.cloudfront.net/stores/002/472/736/rte/FACHADA.png";
const historyImage = "/assets/historia-svi.png";
const minimumDeliveryOrder = 150;
const categoryImages = {
  hidraulicos: "/assets/materiaishidraulicos.png",
  eletricos: "/assets/materiaiseletricos.png",
  pinturas: "/assets/materiaispintura.png",
  equipamentos: "/assets/materiaisequipamentos.png",
};

function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("svi-cart");
      if (!raw) return [];
      return JSON.parse(raw)
        .map((item) => ({
          product: products.find((product) => product.id === item.id),
          quantity: item.quantity,
        }))
        .filter((item) => item.product);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("svi-cart", JSON.stringify(cart.map((item) => ({ id: item.product.id, quantity: item.quantity }))));
  }, [cart]);

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock === 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.product.id === productId);
      if (existing) {
        return current.map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.min(item.quantity + 1, item.product.stock) } : item
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const changeQuantity = (productId, direction) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(item.product.stock, item.quantity + direction) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };
  const clearCart = () => setCart([]);

  const quantity = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return { cart, quantity, subtotal, addToCart, changeQuantity, clearCart };
}

function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    const scrollY = window.scrollY;
    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.width = previousStyles.width;
      document.body.style.overflow = previousStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

function Header({ cartQuantity, onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-top">
        <a className="social-link" href={sviLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram da SVI">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <path d="M17.5 6.5h.01" />
          </svg>
          Instagram
        </a>
        <a className="social-link" href={sviLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook da SVI">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M14 8h2V4h-2c-3 0-5 2-5 5v3H7v4h2v5h4v-5h3l1-4h-4V9c0-.6.4-1 1-1Z" />
          </svg>
          Facebook
        </a>
        <span className="phone">Atendimento: 92 2123-4411</span>
        <a className="account-link" href={sviLinks.jobs} target="_blank" rel="noreferrer">Trabalhe Conosco</a>
        <a className="account-link" href={sviLinks.collaborator} target="_blank" rel="noreferrer">Sou Colaborador</a>
        <button className="cart-link" type="button" onClick={onOpenCart} aria-label={`Meu carrinho com ${cartQuantity} itens`}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M6 6h15l-1.5 8.5H8L6 3H3" />
            <path d="M9 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 9 20Zm9 0a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 18 20Z" />
          </svg>
          Meu carrinho <span>{cartQuantity}</span>
        </button>
      </div>

      <div className="main-nav">
        <Link className="brand" to="/" aria-label="SVI">
          <img className="brand-logo" src={logo} alt="SVI" />
        </Link>

        <button className="menu-toggle" type="button" onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} aria-controls="main-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} id="main-menu" aria-label="Menu principal">
          <NavLink onClick={closeMenu} to="/">Início</NavLink>
          <NavLink onClick={closeMenu} to="/quem-somos">Quem Somos</NavLink>
          <NavLink onClick={closeMenu} to="/nossa-trajetoria">Nossa Trajetória</NavLink>
          <NavLink onClick={closeMenu} to="/politica-privacidade">Política de Privacidade</NavLink>
          <NavLink onClick={closeMenu} to="/nossas-lojas">Nossas Lojas</NavLink>
          <NavLink onClick={closeMenu} to="/coleta-seletiva">Coleta Seletiva</NavLink>
          <NavLink onClick={closeMenu} to="/produtos">Loja Online</NavLink>
          <NavLink onClick={closeMenu} to="/troca-devolucao">Troca e Devolução</NavLink>
          <NavLink onClick={closeMenu} to="/assistencia-tecnica">Assistência técnica</NavLink>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <strong>SVI</strong>
        <span>Copyright S V INSTALAÇÕES LTDA - 84089358000122 - 2026. Todos os direitos reservados.</span>
      </div>
      <div className="developer-credit">
        <span>Desenvolvido por Victor Pontes Dos Santos</span>
        <div className="developer-links">
          <a href="https://github.com/victords97" target="_blank" rel="noreferrer" aria-label="GitHub de Victor Pontes">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 19.3 3.3 5.3 5.3 0 0 0 19.2 0S18 0 15.3 1.5a13.4 13.4 0 0 0-6.6 0C6 0 4.8 0 4.8 0a5.3 5.3 0 0 0-.1 3.3 5.7 5.7 0 0 0-1.5 3.9c0 5.7 3.5 6.9 6.8 7.3a4.8 4.8 0 0 0-1 3.5v4" />
              <path d="M9 18c-4.5 2-5-2-7-2" />
            </svg>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/victor-pontes-7271631a0/" target="_blank" rel="noreferrer" aria-label="LinkedIn de Victor Pontes">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
              <path d="M2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
          <a href="https://portf-lio-seven-theta.vercel.app/" target="_blank" rel="noreferrer" aria-label="Portfólio de Victor Pontes">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <path d="M3 12h18" />
            </svg>
            Portfólio
          </a>
        </div>
      </div>
    </footer>
  );
}

function SupplierCarousel() {
  const suppliers = [
    "Bosch",
    "Starrett",
    "Suvinil",
    "Tigre",
    "Steck",
    "3M",
    "Deca",
    "Schneider",
    "Lorenzetti",
    "Fornecedor parceiro",
  ].map((name, index) => ({
    name,
    image: `/assets/fornecedores/fornecedor-${index + 1}.webp`,
  }));
  const loop = [...suppliers, ...suppliers];

  return (
    <section className="supplier-section" aria-label="Principais fornecedores">
      <div className="supplier-head">
        <span>Principais fornecedores</span>
        <h2>Marcas parceiras presentes na SVI</h2>
      </div>
      <div className="supplier-carousel">
        <div className="supplier-track">
          {loop.map((supplier, index) => (
            <article className="supplier-card" key={`${supplier.name}-${index}`}>
              <img src={supplier.image} alt={supplier.name} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const slides = [
    {
      brand: "Tigre",
      title: "Hidráulicos com compra direta no site",
      text: "Tubos, conexões, registros e acessórios para obra, manutenção e reposição.",
      image: "https://dcdn-us.mitiendanube.com/stores/002/472/736/themes/amazonas/2-slide-1717706013453-2303463716-31070fb5da39fba5945f39084a0fad4f1717706014-1024-1024.webp?9071093781910199982",
      mobileImage: "https://dcdn-us.mitiendanube.com/stores/002/472/736/themes/amazonas/2-slide-1717706013456-108773263-aac4553ed3257a2f0b96acd0c12cb0901717706016-1024-1024.webp?9071093781910199982",
      cta: "Ver Produtos",
      href: "/produtos?categoria=hidraulicos",
    },
    {
      brand: "Suvinil",
      title: "Tintas e ferramentas para pintura",
      text: "Escolha cores, complementos e materiais de aplicação com retirada ou entrega.",
      image: "/assets/suvinil.png",
      cta: "Ver Produtos",
      href: "/produtos?categoria=pinturas",
    },
    {
      brand: "Jotun",
      title: "Acabamento técnico e industrial",
      text: "Produtos para manutenção, proteção e acabamento com apoio do time consultivo.",
      image: "https://dcdn-us.mitiendanube.com/stores/002/472/736/themes/amazonas/2-slide-1735228953933-8199334112-b9aee56ef919b756c96f6e323c1412f01735228955-1024-1024.webp?9071093781910199982",
      mobileImage: "https://dcdn-us.mitiendanube.com/stores/002/472/736/themes/amazonas/2-slide-1735228953936-5278343610-3adc3bf592d613f932834f8d5b6be5ab1735228957-1024-1024.webp?9071093781910199982",
      cta: "Ver Produtos",
      href: "/produtos?categoria=pinturas",
    },
  ];
  const [active, setActive] = useState(0);
  const dragStart = useRef(null);
  const dragDelta = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), 5200);
    return () => clearInterval(timer);
  }, [slides.length]);
  const goToSlide = (direction) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };
  const handleDragStart = (event) => {
    dragStart.current = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    dragDelta.current = 0;
  };
  const handleDragMove = (event) => {
    if (dragStart.current === null) return;
    const currentX = event.clientX ?? event.touches?.[0]?.clientX ?? dragStart.current;
    dragDelta.current = currentX - dragStart.current;
  };
  const handleDragEnd = () => {
    if (Math.abs(dragDelta.current) > 48) {
      goToSlide(dragDelta.current < 0 ? 1 : -1);
    }
    dragStart.current = null;
    dragDelta.current = 0;
  };

  return (
    <main>
      <section
        className="slideshow"
        aria-label="Destaques de produtos"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {slides.map((slide, index) => (
          <div className={`slide ${active === index ? "active" : ""}`} key={slide.brand}>
            <picture>
              <img src={slide.image} alt={slide.title} />
            </picture>
            <div className="slide-copy">
              <span>{slide.brand}</span>
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <Link className="primary-action" to={slide.href}>{slide.cta}</Link>
            </div>
          </div>
        ))}
        <div className="slide-dots" aria-label="Controle do slideshow">
          {slides.map((slide, index) => (
            <button
              className={active === index ? "active" : ""}
              key={slide.brand}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Slide ${slide.brand}`}
            />
          ))}
        </div>
      </section>

      <section className="benefits-grid" aria-label="Benefícios de compra">
        <article className="highlight-benefit">
          <strong>Frete Grátis*</strong>
          <span>Entregamos em toda Manaus para pedidos a partir de {currency.format(minimumDeliveryOrder)}</span>
        </article>
        <article>
          <strong>Parcelamos até 12x</strong>
          <span>Flexibilidade no pagamento</span>
        </article>
      </section>

      <section className="service-modes" aria-label="Formas de atendimento">
        <Link className="mode-card" to="/produtos">
          <img src={facade} alt="Fachada da loja SVI" />
          <div>
            <span>Autosserviço</span>
            <h2>Conheça a loja online SVI e encontre tudo para sua obra em poucos cliques</h2>
          </div>
        </Link>
        <a className="mode-card" href={sviLinks.whatsapp} target="_blank" rel="noreferrer">
          <img src={facade} alt="Atendimento da SVI em Manaus" />
          <div>
            <span>Televendas</span>
            <h2>Fale com nosso time de consultores</h2>
          </div>
        </a>
      </section>

      <section className="department-section">
        <div className="section-head">
          <span>Departamentos</span>
          <h2>Escolha uma categoria para abrir os produtos disponíveis</h2>
        </div>
        <div className="department-grid">
          {categories.filter((category) => category.id !== "all").map((category) => (
            <Link className="department-card" to={`/produtos?categoria=${category.id}`} key={category.id}>
              <img src={categoryImages[category.id]} alt={category.name} />
              <strong>{category.name}</strong>
              <span>{departmentDescription(category.id)}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function departmentDescription(categoryId) {
  return {
    hidraulicos: "Tubos, conexões, registros e reparos.",
    eletricos: "Cabos, disjuntores, tomadas e iluminação.",
    pinturas: "Tintas, rolos, pincéis e complementos.",
    equipamentos: "Ferramentas, EPIs e itens de apoio.",
  }[categoryId];
}

function Shop({ cart, subtotal, addToCart, changeQuantity, clearCart }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [stockOnly, setStockOnly] = useState(true);
  const [sort, setSort] = useState("featured");
  const [brandFilter, setBrandFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [confirmation, setConfirmation] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const category = params.get("categoria") || "all";
  const shipping = 0;
  const needsMinimumForDelivery = deliveryMode === "delivery" && subtotal > 0 && subtotal < minimumDeliveryOrder;
  const amountToMinimum = Math.max(minimumDeliveryOrder - subtotal, 0);
  useBodyScrollLock(Boolean(selectedProduct || checkoutOpen));
  const visibleBrands = useMemo(() => {
    const categoryProducts = products.filter((product) => category === "all" || product.category === category);
    return [...new Set(categoryProducts.map((product) => product.brand))].sort();
  }, [category]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const categoryOk = category === "all" || product.category === category;
      const stockOk = !stockOnly || product.stock > 0;
      const brandOk = brandFilter === "all" || product.brand === brandFilter;
      const priceOk =
        priceFilter === "all" ||
        (priceFilter === "up50" && product.price <= 50) ||
        (priceFilter === "50to150" && product.price > 50 && product.price <= 150) ||
        (priceFilter === "150to300" && product.price > 150 && product.price <= 300) ||
        (priceFilter === "over300" && product.price > 300);
      const searchOk = !term || [product.name, product.brand, product.sku, getCategoryName(product.category)].join(" ").toLowerCase().includes(term);
      return categoryOk && stockOk && brandOk && priceOk && searchOk;
    });

    return [...list].sort((a, b) => {
      if (sort === "priceAsc") return a.price - b.price;
      if (sort === "priceDesc") return b.price - a.price;
      return b.stock - a.stock;
    });
  }, [brandFilter, category, priceFilter, query, stockOnly, sort]);

  const finishOrder = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!cart.length) {
      setConfirmation("Adicione pelo menos um produto para finalizar o pedido.");
      return;
    }
    if (!form.get("name") || !form.get("phone") || !form.get("address")) {
      setConfirmation("Preencha nome, celular e endereço ou loja de retirada.");
      return;
    }
    if (deliveryMode === "delivery" && subtotal < minimumDeliveryOrder) {
      setConfirmation(`Para entrega em Manaus, o pedido mínimo é de ${currency.format(minimumDeliveryOrder)}. Adicione mais ${currency.format(amountToMinimum)} ou selecione retirada na loja.`);
      return;
    }
    const orderId = `SVI-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment = form.get("payment");
    const orderItems = cart
      .map((item) => `- ${item.quantity}x ${item.product.name} (${item.product.sku}) - ${currency.format(item.product.price * item.quantity)}`)
      .join("\n");
    const message = [
      `Olá, SVI! Quero finalizar o pedido ${orderId}.`,
      "",
      `Nome: ${form.get("name")}`,
      `Celular: ${form.get("phone")}`,
      `Entrega/retirada: ${deliveryMode === "delivery" ? "Entrega em Manaus" : "Retirada na loja"}`,
      `Endereço/loja: ${form.get("address")}`,
      `Pagamento: ${payment}`,
      "",
      "Itens:",
      orderItems,
      "",
      `Subtotal: ${currency.format(subtotal)}`,
      "Entrega: Frete grátis",
      `Total: ${currency.format(subtotal + shipping)}`,
    ].join("\n");

    setConfirmation(`Pedido ${orderId} criado. Abrindo WhatsApp para envio da lista de compras.`);
    window.open(`https://wa.me/5592981364269?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };
  const notifyAdded = (productName) => {
    setCartFeedback(`${productName} foi adicionado ao carrinho.`);
    window.clearTimeout(window.sviCartFeedbackTimer);
    window.sviCartFeedbackTimer = window.setTimeout(() => setCartFeedback(""), 3200);
  };
  const handleAddToCart = (product) => {
    addToCart(product.id);
    notifyAdded(product.name);
  };
  const handleBuyNow = (product) => {
    addToCart(product.id);
    notifyAdded(product.name);
    setCheckoutOpen(true);
  };

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div>
          <span>Loja online SVI</span>
          <h1>Produtos disponíveis para compra direta</h1>
          <p>Escolha a categoria, adicione ao carrinho e finalize o pedido com frete grátis em Manaus para compras a partir de {currency.format(minimumDeliveryOrder)}.</p>
        </div>
        <form className="shop-search" role="search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar produto, marca ou código" />
        </form>
      </section>

      <section className="shop-layout">
        <aside className="shop-sidebar">
          <span>Departamentos</span>
          <div className="category-list">
            {categories.map((item) => (
              <button
                className={`category-button ${category === item.id ? "active" : ""}`}
                key={item.id}
                type="button"
                onClick={() => {
                  setBrandFilter("all");
                  setParams(item.id === "all" ? {} : { categoria: item.id });
                }}
              >
                <span>{item.name}</span>
                <small>{item.id === "all" ? products.length : products.filter((product) => product.category === item.id).length}</small>
              </button>
            ))}
          </div>
          <label className="stock-toggle">
            <input checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} type="checkbox" />
            Mostrar apenas em estoque
          </label>
          <label>
            Marca
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
              <option value="all">Todas as marcas</option>
              {visibleBrands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}
            </select>
          </label>
          <label>
            Faixa de preço
            <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
              <option value="all">Todos os preços</option>
              <option value="up50">Até R$ 50</option>
              <option value="50to150">R$ 50 a R$ 150</option>
              <option value="150to300">R$ 150 a R$ 300</option>
              <option value="over300">Acima de R$ 300</option>
            </select>
          </label>
          <button
            className="filter-clear"
            type="button"
            onClick={() => {
              setQuery("");
              setStockOnly(true);
              setBrandFilter("all");
              setPriceFilter("all");
              setSort("featured");
            }}
          >
            Limpar filtros
          </button>
        </aside>

        <section className="shop-products">
          <div className="products-head">
            <div>
              <span>{filtered.length} produto{filtered.length === 1 ? "" : "s"} encontrado{filtered.length === 1 ? "" : "s"}</span>
              <h2>{category === "all" ? "Todos os produtos" : getCategoryName(category)}</h2>
            </div>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar produtos">
              <option value="featured">Mais relevantes</option>
              <option value="priceAsc">Menor preço</option>
              <option value="priceDesc">Maior preço</option>
            </select>
          </div>
          <div className="product-grid">
            {filtered.length ? filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <button className="product-image" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Ver ${product.name}`}>
                  <img src={product.image} alt={product.name} />
                </button>
                <div className="product-body">
                  <div className="product-meta">
                    <span>{product.brand}</span>
                    <span>{product.stock > 0 ? `${product.stock} em estoque` : "Indisponível"}</span>
                  </div>
                  <span className="product-code">Código: {product.sku}</span>
                  <h3>{product.name}</h3>
                  <span className="price">{currency.format(product.price)}</span>
                  <div className="card-actions">
                    <button className="add-button" onClick={() => handleBuyNow(product)} type="button" disabled={product.stock === 0}>Comprar agora</button>
                    <button className="cart-add-button" onClick={() => handleAddToCart(product)} type="button" disabled={product.stock === 0}>Adicionar</button>
                    <button className="small-button" onClick={() => setSelectedProduct(product)} type="button">Detalhes</button>
                  </div>
                </div>
              </article>
            )) : <div className="summary-empty">Nenhum produto encontrado nessa seleção.</div>}
          </div>
        </section>

        <CartCard
          amountToMinimum={amountToMinimum}
          cart={cart}
          needsMinimumForDelivery={needsMinimumForDelivery}
          subtotal={subtotal}
          shipping={shipping}
          changeQuantity={changeQuantity}
          clearCart={clearCart}
          openCheckout={() => setCheckoutOpen(true)}
        />
      </section>

      {cartFeedback && <CartFeedback message={cartFeedback} />}
      {selectedProduct && (
        <ProductDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={() => handleAddToCart(selectedProduct)}
          buyNow={() => handleBuyNow(selectedProduct)}
        />
      )}
      {checkoutOpen && (
        <CheckoutDialog
          confirmation={confirmation}
          deliveryMode={deliveryMode}
          finishOrder={finishOrder}
          needsMinimumForDelivery={needsMinimumForDelivery}
          amountToMinimum={amountToMinimum}
          onClose={() => setCheckoutOpen(false)}
          setDeliveryMode={setDeliveryMode}
        />
      )}
    </main>
  );
}

function CartFeedback({ message }) {
  return (
    <div className="cart-feedback" role="status">
      <strong>Produto adicionado</strong>
      <span>{message}</span>
    </div>
  );
}

function CartCard({ amountToMinimum, cart, needsMinimumForDelivery, subtotal, shipping, changeQuantity, clearCart, openCheckout }) {
  return (
    <aside className="checkout-card" id="carrinho">
      <div className="checkout-card-head">
        <span>Carrinho</span>
        <strong>{cart.reduce((total, item) => total + item.quantity, 0)}</strong>
      </div>
      <div className="cart-items">
        {cart.length ? cart.map((item) => (
          <article className="cart-item" key={item.product.id}>
            <div>
              <strong>{item.product.name}</strong>
              <small>Código: {item.product.sku}</small>
              <small>{currency.format(item.product.price)} cada</small>
            </div>
            <div className="quantity-controls">
              <button onClick={() => changeQuantity(item.product.id, -1)} type="button">-</button>
              <strong>{item.quantity}</strong>
              <button onClick={() => changeQuantity(item.product.id, 1)} type="button">+</button>
            </div>
          </article>
        )) : <div className="cart-empty">Seu carrinho está vazio.</div>}
      </div>
      <div className="summary-line"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
      <div className={`summary-line ${needsMinimumForDelivery ? "shipping-pending-line" : "free-shipping-line"}`}>
        <span>Entrega</span>
        <strong>{needsMinimumForDelivery ? "Disponível a partir de R$ 150,00" : "Frete grátis"}</strong>
      </div>
      <div className="summary-total"><span>Total</span><strong>{currency.format(subtotal + shipping)}</strong></div>
      {needsMinimumForDelivery && (
        <p className="minimum-order-note warning">
          Pedido mínimo para entrega: {currency.format(minimumDeliveryOrder)}. Faltam {currency.format(amountToMinimum)} para entrega em Manaus.
        </p>
      )}
      <div className="cart-action-stack">
        <button className="clear-cart-button" type="button" onClick={clearCart} disabled={!cart.length}>Limpar carrinho</button>
        <button className="primary-action full" type="button" onClick={openCheckout}>Finalizar pedido</button>
      </div>
    </aside>
  );
}

function CartPreviewDialog({ cart, subtotal, onClose, changeQuantity, clearCart }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="cart-preview-dialog react-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar carrinho">x</button>
        <div className="section-head">
          <span>Meu carrinho</span>
          <h2>Produtos adicionados</h2>
        </div>
        <div className="cart-items">
          {cart.length ? cart.map((item) => (
            <article className="cart-item" key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <small>Código: {item.product.sku}</small>
                <small>{currency.format(item.product.price)} cada</small>
              </div>
              <div className="quantity-controls">
                <button onClick={() => changeQuantity(item.product.id, -1)} type="button">-</button>
                <strong>{item.quantity}</strong>
                <button onClick={() => changeQuantity(item.product.id, 1)} type="button">+</button>
              </div>
            </article>
          )) : <div className="cart-empty">Seu carrinho está vazio.</div>}
        </div>
        <div className="summary-total"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
        <div className="cart-preview-actions">
          <button className="clear-cart-button" type="button" onClick={clearCart} disabled={!cart.length}>Limpar carrinho</button>
          <Link className="secondary-action full" to="/produtos" onClick={onClose}>Continuar comprando</Link>
        </div>
      </section>
    </div>
  );
}

function CheckoutDialog({ amountToMinimum, confirmation, deliveryMode, finishOrder, needsMinimumForDelivery, onClose, setDeliveryMode }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="checkout-dialog react-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar checkout">x</button>
        <div className="section-head">
          <span>Checkout</span>
          <h2>Dados para finalizar o pedido</h2>
        </div>
        <form className="checkout-form-panel" onSubmit={finishOrder}>
          <label>Nome completo<input name="name" type="text" placeholder="Ex.: Maria Andrade" /></label>
          <label>Celular<input name="phone" type="tel" placeholder="(92) 99999-9999" /></label>
          <label>
            Entrega ou retirada
            <select value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value)}>
              <option value="delivery">Entrega em Manaus</option>
              <option value="pickup">Retirada na loja</option>
            </select>
          </label>
          <label>
            Pagamento
            <select name="payment">
              <option value="Pix">Pix</option>
              <option value="Cartão de crédito">Cartão de crédito</option>
              <option value="Orçamento PJ">Orçamento PJ</option>
            </select>
          </label>
          <label className="wide">Endereço ou loja de retirada<input name="address" type="text" placeholder="Rua, número, bairro ou unidade SVI" /></label>
          <div className="checkout-actions-row">
            <button className="secondary-action" type="button" onClick={onClose}>Revisar pedido</button>
            <button className="primary-action" type="submit">Criar pedido</button>
          </div>
          <p className={`checkout-rule-note ${needsMinimumForDelivery ? "warning" : ""}`}>
            Frete grátis em Manaus. Pedido mínimo para entrega: {currency.format(minimumDeliveryOrder)}.
            {needsMinimumForDelivery ? ` Faltam ${currency.format(amountToMinimum)} para escolher entrega.` : ""}
          </p>
          <p className="confirmation" role="status">{confirmation}</p>
        </form>
      </section>
    </div>
  );
}

function ProductDialog({ product, onClose, addToCart, buyNow }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="product-dialog react-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fechar produto">x</button>
        <div className="dialog-layout">
          <img src={product.image} alt={product.name} />
          <div className="dialog-info">
            <span>{getCategoryName(product.category)} | {product.sku}</span>
            <h2>{product.name}</h2>
            <small className="product-code dialog-code">Código do produto: {product.sku}</small>
            <p>{product.brand} disponível para compra online, retirada ou entrega em Manaus.</p>
            <strong className="price">{currency.format(product.price)}</strong>
            <ul>{product.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
            <div className="dialog-actions">
              <button className="primary-action full" onClick={() => { buyNow(); onClose(); }} type="button" disabled={product.stock === 0}>
                Comprar agora
              </button>
              <button className="secondary-action full" onClick={() => { addToCart(); onClose(); }} type="button" disabled={product.stock === 0}>
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryName(id) {
  return categories.find((category) => category.id === id)?.name || "Produtos";
}

function ContentPage({ type }) {
  const pages = {
    "quem-somos": {
      tag: "Quem Somos",
      title: "A SV Instalações",
      image: facade,
      intro: "A SV Instalações se diversificou bastante desde sua fundação, em 1992. Fundamentalmente foi criada para realização de projetos e instalações elétricas industriais.",
      paragraphs: [
        "Com o crescimento de suas atividades, a empresa foi criando condições de venda de materiais elétricos em seu site, estabelecendo parcerias com as melhores marcas do mercado no ramo elétrico, hidráulico, casa e decoração.",
        "Atualmente é referência no mix de produtos em seu portfólio. Seu ponto forte é a variedade de opções para o cliente escolher em seu showroom.",
        "Hoje possui mais de 75.000 itens cadastrados e 250 colaboradores dedicados, focados e comprometidos em fornecer sempre o melhor serviço na venda e distribuição de produtos.",
      ],
    },
    "nossa-trajetoria": {
      tag: "Nossa Trajetória",
      title: "Uma trajetória construída com atendimento, variedade e confiança",
      image: facade,
      intro: "Desde 1992, a SVI acompanha a evolução de Manaus oferecendo soluções para instalações, manutenção, construção e abastecimento de obras.",
      paragraphs: [
        "A empresa iniciou sua atuação com projetos e instalações elétricas industriais, construindo uma base técnica que se tornou parte importante da sua forma de atender. Com o tempo, essa experiência abriu caminho para a comercialização de materiais elétricos e para a ampliação do portfólio.",
        "Ao longo dos anos, a SVI passou a reunir em um só lugar produtos para áreas elétricas, hidráulicas, pintura, equipamentos, casa e decoração. A variedade de itens, o autosserviço e o suporte de consultores ajudaram a consolidar a marca como uma referência para clientes residenciais, profissionais e empresas.",
        "A presença física em Manaus segue sendo essencial para retirada, entrega e atendimento próximo. A loja online complementa essa operação, permitindo que o cliente consulte departamentos, veja produtos disponíveis, monte o pedido e escolha a melhor forma de atendimento.",
        "A trajetória da SVI segue orientada por parceria com marcas reconhecidas, compromisso com o cliente e melhoria contínua na experiência de compra.",
      ],
    },
    "politica-privacidade": {
      tag: "Política de Privacidade",
      title: "Segurança e transparência no uso das informações",
      intro: "A SVI respeita a privacidade dos clientes e utiliza dados pessoais apenas para viabilizar navegação, atendimento, pedidos, entregas e comunicação relacionada aos serviços oferecidos.",
      paragraphs: [
        "Durante a navegação e a realização de pedidos, poderemos solicitar informações como nome, telefone, e-mail, CPF ou CNPJ, endereço de entrega, forma de pagamento e dados necessários para emissão de documentos fiscais. Essas informações são utilizadas para identificar o cliente, processar compras, organizar entregas, responder solicitações e acompanhar o pós-venda.",
        "Dados de navegação, como páginas acessadas, produtos visualizados e preferências de uso, podem ser usados para melhorar a experiência no site, facilitar buscas, personalizar comunicações e aprimorar a segurança da loja online.",
        "A SVI não comercializa dados pessoais. O compartilhamento de informações ocorre apenas quando necessário para execução do pedido, como operadores de pagamento, transportadoras, sistemas de gestão, atendimento ao cliente, obrigações legais ou solicitação de autoridades competentes.",
        "O cliente pode solicitar atualização, correção ou exclusão de dados pessoais, observadas as obrigações legais de guarda de informações fiscais, comerciais e de segurança. Também pode entrar em contato para esclarecer dúvidas sobre privacidade e tratamento de dados.",
        "Ao utilizar o site e realizar pedidos, o cliente declara estar ciente de que suas informações serão tratadas de forma responsável, limitada às finalidades informadas e em conformidade com a legislação aplicável.",
      ],
    },
  };
  const page = pages[type];

  return (
    <main className="content-page">
      <Link className="page-logo" to="/"><img src={logo} alt="SVI" /></Link>
      {page.image ? (
        <section className="content-hero">
          <div><span>{page.tag}</span><h1>{page.title}</h1><p>{page.intro}</p></div>
          <img src={page.image} alt={page.title} />
        </section>
      ) : null}
      <section className="content-card content-long">
        {!page.image ? <><span>{page.tag}</span><h1>{page.title}</h1><p>{page.intro}</p></> : null}
        {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <Link className="primary-action" to="/produtos">Ir para loja online</Link>
      </section>
    </main>
  );
}

function HistoryPage() {
  const timeline = [
    {
      year: "1992",
      text: "A SVI inicia suas atividades comerciais com o nome SV Instalações Ltda., atuando com projetos e instalações elétricas industriais.",
    },
    {
      year: "1995",
      text: "A empresa transfere sua operação para a primeira sede própria, com 480 m², situada na Rua Rio Purus, no Vieiralves.",
    },
    {
      year: "1998",
      text: "A SVI constrói uma nova sede, com 880 m², e incorpora em suas atividades a venda direta de materiais elétricos.",
    },
    {
      year: "2004",
      text: "Com crescimento operacional e parcerias com marcas reconhecidas, inaugura nova sede na Rua Santos Dumont, com showroom e autoatendimento.",
    },
    {
      year: "2017",
      text: "A SVI inaugura unidade na Alameda Cosme Ferreira, integrando centro de distribuição, televendas, departamentos administrativos e loja com estacionamento próprio.",
    },
  ];

  return (
    <main className="content-page history-page">
      <Link className="page-logo" to="/"><img src={logo} alt="SVI" /></Link>
      <section className="content-hero history-hero">
        <div>
          <span>Nossa Trajetória</span>
          <h1>Uma história de crescimento em Manaus</h1>
          <p>Conheça os principais marcos da SVI, desde o início em instalações elétricas industriais até a consolidação como operação de autosserviço, distribuição e atendimento especializado.</p>
        </div>
        <img src={facade} alt="Fachada atual da SVI" />
      </section>

      <section className="history-board" aria-label="Linha do tempo da SVI">
        <div className="history-image-card">
          <img src={historyImage} alt="Linha do tempo real da SVI com fotos históricas de 1992, 1995, 1998, 2004 e 2017" />
        </div>
        <div className="timeline-list">
          {timeline.map((item) => (
            <article className="timeline-item" key={item.year}>
              <strong>{item.year}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StoresPage() {
  const stores = [
    {
      name: "Matriz",
      address: "Av. Cosme Ferreira, 2116 - Coroado, Manaus - AM",
      phone: "(92) 2123-4444",
      hours: "Segunda a sexta: 8h às 17h. Sábado: 8h às 14h.",
    },
    {
      name: "Filial",
      address: "Av. Joaquim Gonzaga Pinheiro, 495 - Nossa Senhora das Graças, Manaus - AM",
      phone: "(92) 2101-3780",
      hours: "Segunda a sexta: 8h às 17h. Sábado: 8h às 14h.",
    },
  ];

  return (
    <main className="content-page">
      <Link className="page-logo" to="/"><img src={logo} alt="SVI" /></Link>
      <section className="content-hero">
        <div><span>Nossas Lojas</span><h1>Atendimento em Manaus</h1><p>Consulte endereços, horários e opções de retirada para os pedidos feitos no e-commerce.</p></div>
        <img src={facade} alt="Fachada da matriz SVI" />
      </section>
      <section className="info-grid">
        {stores.map((store) => {
          const mapQuery = encodeURIComponent(`SVI ${store.address}`);
          return (
            <article className="content-card store-card" key={store.name}>
              <h2>{store.name}</h2>
              <p>{store.address}</p>
              <p>FONE: {store.phone}</p>
              <p>{store.hours}</p>
              <a className="secondary-action map-action" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
                Abrir no Google Maps
              </a>
              <iframe
                title={`Mapa da SVI ${store.name}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </article>
          );
        })}
      </section>
    </main>
  );
}

function TextPage({ title, tag, children }) {
  return (
    <main className="content-page">
      <Link className="page-logo" to="/"><img src={logo} alt="SVI" /></Link>
      <section className="content-card content-long">
        <span>{tag}</span>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, search]);

  return null;
}

function App() {
  const cartApi = useCart();
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  useBodyScrollLock(cartPreviewOpen);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header cartQuantity={cartApi.quantity} onOpenCart={() => setCartPreviewOpen(true)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Shop {...cartApi} />} />
        <Route path="/quem-somos" element={<ContentPage type="quem-somos" />} />
        <Route path="/nossa-trajetoria" element={<HistoryPage />} />
        <Route path="/politica-privacidade" element={<ContentPage type="politica-privacidade" />} />
        <Route path="/nossas-lojas" element={<StoresPage />} />
        <Route path="/coleta-seletiva" element={<TextPage tag="Coleta Seletiva" title="Separe, recicle e modifique"><p>Destinar resíduos da maneira correta ainda é um desafio para a maioria das cidades. Incluir a coleta seletiva nos planos de gestão tornou-se uma obrigação para os órgãos públicos, porém todos somos responsáveis pelo lixo que geramos.</p><h2>O que é coleta seletiva?</h2><p>É a coleta e recolhimento de resíduos previamente separados de acordo com o tipo de material. Assim, é possível separar resíduos recicláveis dos não recicláveis para uma destinação ambientalmente adequada.</p><h2>Iniciativa da SVI</h2><p>A SVI, por meio de seu setor de SGI, desenvolve coleta seletiva em suas instalações.</p></TextPage>} />
        <Route path="/troca-devolucao" element={<TextPage tag="Troca e Devolução" title="Regras para compras e pedidos"><p><strong>Não fazemos troca entre lojas:</strong> a troca ocorre somente na loja onde foi emitida a venda.</p><p>Para qualquer troca de produtos é necessário apresentar nota ou cupom fiscal.</p><p>Compras feitas por telefone ou internet podem acionar troca e devolução em até 7 dias a partir da entrega.</p></TextPage>} />
        <Route path="/assistencia-tecnica" element={<TextPage tag="Assistência Técnica" title="Fabricantes atendidos"><p>A SVI direciona o cliente para os canais oficiais de assistência de marcas como Makita, Lorenzetti, Fame, Intelbras, Tramontina, Tigre, Starrett, Bosch e Legrand.</p><div className="brand-grid"><a className="brand-service-card" style={{ "--brand-bg": "url('/assets/fornecedores/fornecedor-1.webp')" }} href="https://www.boschacessorios.com.br" target="_blank" rel="noreferrer" aria-label="Bosch"></a><a className="brand-service-card" style={{ "--brand-bg": "url('/assets/fornecedores/fornecedor-4.webp')" }} href="https://www.tigre.com.br" target="_blank" rel="noreferrer" aria-label="Tigre"></a><a className="brand-service-card" style={{ "--brand-bg": "url('/assets/fornecedores/fornecedor-9.webp')" }} href="https://www.lorenzetti.com.br" target="_blank" rel="noreferrer" aria-label="Lorenzetti"></a><a className="brand-service-card" style={{ "--brand-bg": "url('/assets/fornecedores/fornecedor-2.webp')" }} href="https://www.starrett.com.br" target="_blank" rel="noreferrer" aria-label="Starrett"></a></div></TextPage>} />
      </Routes>
      {cartPreviewOpen && (
        <CartPreviewDialog
          cart={cartApi.cart}
          subtotal={cartApi.subtotal}
          changeQuantity={cartApi.changeQuantity}
          clearCart={cartApi.clearCart}
          onClose={() => setCartPreviewOpen(false)}
        />
      )}
      <SupplierCarousel />
      <Footer />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
