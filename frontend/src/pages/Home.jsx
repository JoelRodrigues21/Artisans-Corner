import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchParams] = useSearchParams();
const navigate = useNavigate();
  const searchQuery = searchParams.get("search") || "";

  const categories = [
    "All",
    "Handmade Decor",
    "Pottery & Ceramics",
    "Handcrafted Jewelry",
    "Textiles & Clothing",
    "Home & Living",
    "Paintings & Artwork",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;

    const searchMatch =
      searchQuery.trim() === "" ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <div
      style={{
        backgroundColor: "#f7f1e8",
        minHeight: "100vh",
        padding: "28px",
      }}
    >
      <section
        style={{
          background:
            "linear-gradient(135deg, #fff1d8 0%, #f2d3a2 45%, #d6a96c 100%)",
          borderRadius: "22px",
          padding: "55px 70px",
          marginBottom: "35px",
          minHeight: "430px",
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          alignItems: "center",
          gap: "35px",
          boxShadow: "0 6px 18px rgba(62,39,35,0.18)",
          border: "1px solid #c99a5b",
          overflow: "hidden",
        }}
      >
        <div>
          <h1
            style={{
              color: "#3e2723",
              fontSize: "clamp(48px, 4.4vw, 82px)",
              lineHeight: "1.05",
              margin: "0 0 22px",
              fontFamily: "Georgia, serif",
              fontWeight: "900",
              letterSpacing: "0.5px",
            }}
          >
            Discover Handmade Treasures
          </h1>

          <p
            style={{
              color: "#5d4037",
              fontSize: "clamp(20px, 1.45vw, 30px)",
              maxWidth: "760px",
              lineHeight: "1.6",
              marginBottom: "28px",
            }}
          >
            Explore unique handmade products crafted by talented artisans.
          </p>

          <button
  onClick={() => {
    setSelectedCategory("All");
    navigate("/");

    setTimeout(() => {
      document
        .getElementById("products-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }}
  style={{
    padding: "15px 32px",
    fontWeight: "800",
    fontSize: "17px",
    borderRadius: "30px",
    backgroundColor: "#7a4f2a",
    color: "white",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }}
>
  Explore Collection
</button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/statue.png"
            alt="Handmade artisan product"
            style={{
              width: "min(100%, 520px)",
              height: "clamp(320px, 28vw, 520px)",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.25))",
            }}
          />
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "32px",
        }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              backgroundColor:
                selectedCategory === category ? "#7a4f2a" : "transparent",
              color: selectedCategory === category ? "white" : "#3e2723",
              border: "1px solid #7a4f2a",
              padding: "10px 18px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <section id="products-section">
        <h2
          style={{
            color: "#3e2723",
            fontSize: "clamp(28px, 2vw, 42px)",
            marginBottom: "24px",
            fontFamily: "Georgia, serif",
          }}
        >
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : selectedCategory === "All"
            ? "Featured Products"
            : selectedCategory}
        </h2>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3>No products found.</h3>
            <p>Try searching another product or choose a different category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;