import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trends from "./pages/Trends";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trends" element={<Trends />} />
      </Routes>
    </BrowserRouter>
  );
}
