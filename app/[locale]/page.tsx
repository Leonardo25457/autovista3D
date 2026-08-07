import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "../lib/i18n";

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${isLocale(locale) ? locale : defaultLocale}/vehicles`);
}
