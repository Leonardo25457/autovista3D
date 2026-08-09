"use client";

import Link from "next/link";
import { CarFront, Languages, Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { salesContact } from "../lib/contact";
import { getUi, type Locale } from "../lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const ui = getUi(locale);
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "es" ? "en" : "es";

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href={`/${locale}/vehicles`} className="dealer-brand" aria-label="AutoVista 3D">
          <span><CarFront size={27} /></span>
          <strong>AUTOVISTA<em>3D</em></strong>
        </Link>

        <nav className={open ? "header-nav open" : "header-nav"}>
          <Link href={`/${locale}/vehicles`}>{ui.home}</Link>
          <Link href={`/${locale}/vehicles`} className="active">{ui.inventory}</Link>
          <a href="#about">{ui.about}</a>
          <a href="#contact">{ui.contact}</a>
        </nav>

        <div className="header-actions">
          <Link className="language-link" href={`/${otherLocale}/vehicles`}>
            <Languages size={17} /> {otherLocale.toUpperCase()}
          </Link>
          {salesContact.phoneHref && (
            <a className="call-button" href={salesContact.phoneHref}>
              <Phone size={17} /> {ui.callNow}
            </a>
          )}
          <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
