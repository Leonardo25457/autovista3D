const phone = process.env.NEXT_PUBLIC_SALES_PHONE?.trim();
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
const email = process.env.NEXT_PUBLIC_SALES_EMAIL?.trim();

export const salesContact = {
  phone,
  phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined,
  whatsappHref: whatsapp ? `https://wa.me/${whatsapp}` : undefined,
  email,
  emailHref: email ? `mailto:${email}` : undefined,
};
