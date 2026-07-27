import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Layout from "@/components/Layout";
import CustomCursor from "@/components/CustomCursor";
import Home from "@/pages/Home";
import CompanyDetail from "@/pages/CompanyDetail";
import Spectrum from "@/pages/Spectrum";
import Arena from "@/pages/Arena";
import Quotes from "@/pages/Quotes";
import About from "@/pages/About";

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

export default function App() {
  // Lenis 全站平滑滚动 (lerp 0.09), synced with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <CustomCursor />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/spectrum" element={<Spectrum />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </>
  );
}
