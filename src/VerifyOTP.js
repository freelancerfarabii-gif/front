import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      alert("OTP Verified. Now login.");
      navigate("/login");
    } catch (err) {
  if (err.response && err.response.data && err.response.data.msg) {
    alert(err.response.data.msg);
  } else {
    alert("Server error or network problem");
  }
}
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify OTP</h2>
      <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
      <button type="submit">Verify</button>
    </form>
  );
}