import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <div className="app-main">
        <Header />

        {/* Render the currently matched protected page inside the shared layout. */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
