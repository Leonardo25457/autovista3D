import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { VehicleInventory } from "../../components/VehicleInventory";
import { salesContact } from "../../lib/contact";
import { isLocale } from "../../lib/i18n";

export default async function VehiclesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main>
      <SiteHeader locale={locale} />
      <div className="inventory-page">
        <VehicleInventory locale={locale} />
      </div>
      <footer className="site-footer" id="contact">
        <div><strong>AUTOVISTA 3D</strong><p>Inventario visual con fichas técnicas y modelos 3D.</p></div>
        {(salesContact.phone || salesContact.email) && (
          <div>
            <b>Contacto</b>
            {salesContact.phoneHref && <a href={salesContact.phoneHref}>{salesContact.phone}</a>}
            {salesContact.emailHref && <a href={salesContact.emailHref}>{salesContact.email}</a>}
          </div>
        )}
      </footer>
    </main>
  );
}
