import React from "react";
// import { useState } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

const Layout = ({ children, searchTerm, setSearchTerm }) => {
  return (
    <div className="h-screen flex flex-col">
      <header className="flex-shrink-0 w-full bg-white shadow-sm z-50">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex-shrink-0 w-64 overflow-visible">
          <SideBar />
        </aside>
        <main className="flex-1 overflow-y-auto px-10 py-8">{children}</main>
      </div>
    </div>
  );
};
export default Layout;
