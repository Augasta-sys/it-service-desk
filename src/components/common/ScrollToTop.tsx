import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the browser window to the top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Also reset the application's main scroll container
    const mainContent = document.querySelector(
      ".app-main-content"
    ) as HTMLElement | null;

    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;