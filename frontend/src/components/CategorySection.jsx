import { useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import {
  GiAmphora,
  GiNecklace,
  GiSewingString,
  GiPaintBrush,
  GiCandleHolder,
} from "react-icons/gi";

import { MdOutlineHomeWork } from "react-icons/md";

import ProductCard from "./ProductCard";

function CategorySection({ category, products }) {
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(products.length > 1);
  const [isHovered, setIsHovered] = useState(false);

  const handleScroll = () => {
    const row = scrollRef.current;

    if (!row) return;

    setShowLeft(row.scrollLeft > 20);

    setShowRight(
      row.scrollLeft <
        row.scrollWidth - row.clientWidth - 20
    );
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -340,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 340,
      behavior: "smooth",
    });
  };

  const arrowStyle = {
    position: "absolute",
    top: "42%",
    zIndex: 10,

    width: "54px",
    height: "54px",

    borderRadius: "50%",

    background:
      "linear-gradient(180deg,#fff7ea,#e6c98d)",

    border: "2px solid #b08d57",

    color: "#5d4037",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    boxShadow: "0 8px 22px rgba(0,0,0,0.18)",

    cursor: "pointer",

    transition: "all .35s ease",

    transform: isHovered
      ? "scale(1)"
      : "scale(.8)",

    opacity: isHovered ? 1 : 0,

    pointerEvents: isHovered ? "auto" : "none",
  };
const categoryIcons = {
  "Handmade Decor": <MdOutlineHomeWork size={28} />,
  "Pottery & Ceramics": <GiAmphora size={28} />,
  "Handcrafted Jewelry": <GiNecklace size={28} />,
  "Textiles & Clothing": <GiSewingString size={28} />,
  "Home & Living": <GiCandleHolder size={28} />,
  "Paintings & Artwork": <GiPaintBrush size={28} />,
  Uncategorized: <MdOutlineHomeWork size={28} />,
};
  return (
    <div
      style={{ marginBottom: "55px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  }}
>
  {/* Left Side */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    <div
      style={{
        color: "#8b5e3c",
      }}
    >
      {categoryIcons[category]}
    </div>

    <h2
      style={{
        fontFamily: "Georgia, serif",
        color: "#3e2723",
        fontSize: "30px",
        margin: 0,
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </h2>
  </div>

  {/* Gold Divider */}
  <div
    style={{
      flex: 1,
      height: "2px",
      background:
        "linear-gradient(to right,#b08d57,#e6c98d)",
      margin: "0 20px",
      borderRadius: "10px",
    }}
  ></div>

  {/* View All */}
  <span
    style={{
      color: "#8b5e3c",
      fontWeight: "700",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "0.3s",
    }}
  >
    View All ({products.length}) →
  </span>
</div>

      <div style={{ position: "relative" }}>
        {showLeft && (
          <button
            onClick={scrollLeft}
            style={{
              ...arrowStyle,
              left: "-24px",
            }}
          >
            <HiChevronLeft size={30} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: "flex",
            gap: "20px",

            overflowX: "auto",

            scrollBehavior: "smooth",

            padding: "10px 5px 20px",

            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>

        {showRight && (
          <button
            onClick={scrollRight}
            style={{
              ...arrowStyle,
              right: "-24px",
            }}
          >
            <HiChevronRight size={30} />
          </button>
        )}
      </div>
    </div>
  );
}

export default CategorySection;