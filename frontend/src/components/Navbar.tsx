"use client";

import Link from "next/link";
import { Camera, LogOut } from "lucide-react";
import { useAuth } from "../lib/authContext";

interface NavbarProps {
  mode?: "home" | "admin";
}

export default function Navbar({ mode = "home" }: NavbarProps) {
  const { logout, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo">
          <Camera size={24} className="logo-icon" />
          <span>Beyond The Frame</span>
        </Link>

        {mode === "home" ? (
          <ul className="nav-links">
            <li><a href="#hero">Home</a></li>
            <li><a href="#gallery">Gallery</a></li>
            <li><Link href="/admin" className="nav-upload-btn">Upload</Link></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        ) : (
          <div className="nav-links">
            {user && (
              <button onClick={logout} className="nav-logout-text" title="Sign Out">
                Logout
              </button>
            )}
            <Link href="/" className="nav-back-btn">
              Back to Portfolio
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
