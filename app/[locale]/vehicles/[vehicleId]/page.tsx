import { notFound } from "next/navigation";
import { VehicleDetail } from "../../../components/VehicleDetail";
import { isLocale } from "../../../lib/i18n";
import { vehicleById } from "../../../lib/vehicle-data";

export default async function VehiclePage({ params }: { params: Promise<{ locale: string; vehicleId: string }> }) {
  const { locale, vehicleId } = await params;
  if (!isLocale(locale)) notFound();
  const vehicle = vehicleById[vehicleId];
  if (!vehicle) notFound();
  return <VehicleDetail vehicle={vehicle} locale={locale} />;
}
