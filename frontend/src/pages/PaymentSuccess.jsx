import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../services/api";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setMessage("Payment session not found.");
        return;
      }

      const res = await API.get(
        `/payments/verify-payment?session_id=${sessionId}`
      );

      localStorage.removeItem("cart");

      setStatus("success");
      setMessage(res.data?.message || "Payment successful. Order placed.");
    } catch (error) {
      console.log(error);

      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Payment verification failed. Please contact support."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px",
      }}
    >
      <div
        style={{
          background: "#fffaf2",
          border: "1px solid #c8a77a",
          borderRadius: "22px",
          padding: "40px",
          width: "min(620px, 100%)",
          textAlign: "center",
          boxShadow: "0 10px 28px rgba(62,39,35,0.18)",
        }}
      >
        <h1
          style={{
            color:
              status === "success"
                ? "#2e7d32"
                : status === "error"
                ? "#b71c1c"
                : "#3e2723",
            fontFamily: "Georgia, serif",
          }}
        >
          {status === "success"
            ? "Payment Successful"
            : status === "error"
            ? "Payment Issue"
            : "Verifying Payment"}
        </h1>

        <p
          style={{
            color: "#5d4037",
            fontWeight: "700",
            fontSize: "18px",
            lineHeight: "1.6",
          }}
        >
          {message}
        </p>

        {status === "success" && (
          <div style={{ marginTop: "25px" }}>
            <Link
              to="/orders"
              style={{
                display: "inline-block",
                background: "#7a4f2a",
                color: "white",
                padding: "13px 24px",
                borderRadius: "30px",
                fontWeight: "900",
                marginRight: "10px",
              }}
            >
              View Orders
            </Link>

            <Link
              to="/buyer"
              style={{
                display: "inline-block",
                background: "#3e2723",
                color: "white",
                padding: "13px 24px",
                borderRadius: "30px",
                fontWeight: "900",
              }}
            >
              Buyer Dashboard
            </Link>
          </div>
        )}

        {status === "error" && (
          <div style={{ marginTop: "25px" }}>
            <Link
              to="/checkout"
              style={{
                display: "inline-block",
                background: "#7a4f2a",
                color: "white",
                padding: "13px 24px",
                borderRadius: "30px",
                fontWeight: "900",
              }}
            >
              Back to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;