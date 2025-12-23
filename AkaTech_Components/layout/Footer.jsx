import React from "react";
import { Logo } from "../ui/Logo";
import { Icons } from "../ui/Icons";

export const Footer = ({ onNavigate }) => (
  <footer className="bg-gray-100 dark:bg-[#050505] py-16 border-t border-gray-200 dark:border-white/5 text-center md:text-left transition-colors duration-500">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-6 justify-center md:justify-start">
          <Logo className="w-12 h-12" />
          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-500">
            AKATECH
          </h3>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed">
          Crafting premium digital experiences
          <br />
          from Ghana to the world.
        </p>
        <a
          href="mailto:Akatechitsolutions@outlook.com"
          className="block mt-4 text-xs text-gray-600 hover:text-akatech-gold transition"
        >
          Akatechitsolutions@outlook.com
        </a>
        <p className="text-gray-500 dark:text-gray-700 text-[10px] mt-4 uppercase tracking-widest transition-colors duration-500">
          © 2023 AkaTech IT Solutions. All Rights Reserved.
        </p>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Services
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              Web Development
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              System Architecture
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              POS Systems
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              Graphic Design
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Quick Links
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
              aria-label="Go to Home"
            >
              Home
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("contact");
              }}
              aria-label="Get Help & Support"
            >
              Help & Support
            </a>
          </li>
          <li className="transition">
            <span className="block mb-2 text-gray-600 dark:text-gray-400 font-medium">
              Connect with Us
            </span>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-akatech-gold transition text-gray-500 dark:text-gray-400"
              >
                <Icons.Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-akatech-gold transition text-gray-500 dark:text-gray-400"
              >
                <Icons.Twitter size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-akatech-gold transition text-gray-500 dark:text-gray-400"
              >
                <Icons.Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-akatech-gold transition text-gray-500 dark:text-gray-400"
              >
                <Icons.Linkedin size={16} />
              </a>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Company
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("landing");
              }}
            >
              About Us
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("about");
              }}
            >
              About
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("careers");
              }}
            >
              Careers
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("contact");
              }}
              className="relative z-10"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-xs uppercase tracking-widest transition-colors duration-500">
          Legal
        </h4>
        <ul className="space-y-3 text-xs text-gray-500">
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("privacy");
              }}
            >
              Privacy Policy
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("terms");
              }}
              className="text-gray-500 hover:text-akatech-gold hover:underline decoration-akatech-gold underline-offset-4 transition-all duration-300"
            >
              Terms of Service
            </a>
          </li>
          <li className="hover:text-akatech-gold cursor-pointer transition">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("cookie");
              }}
            >
              Cookie Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);
