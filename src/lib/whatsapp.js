export function getWhatsAppLink(product, quantity = 1, nicotineVal = null, t) {
  const rawPhone = import.meta.env.VITE_WHATSAPP_PHONE || "+34 900 123 456";
  const phone = rawPhone.replace(/[^0-9]/g, '');

  const total = (product.price * quantity).toFixed(2);
  const price = product.price.toFixed(2);

  let nicotineStr = "";
  if (nicotineVal !== null && nicotineVal !== undefined && nicotineVal !== 0 && nicotineVal !== '0') {
    nicotineStr = t('whatsapp_msg_nicotine', { nic: nicotineVal }, `- Nicotina: *${nicotineVal} mg/ml*\n`);
  }

  const message = t('whatsapp_product_msg', {
    name: product.name,
    brand: product.brand,
    quantity: quantity,
    price: price,
    nicotine: nicotineStr,
    total: total
  });

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function handleBuyViaWhatsApp(product, quantity = 1, nicotineVal = null, t) {
  const link = getWhatsAppLink(product, quantity, nicotineVal, t);
  window.open(link, '_blank', 'noopener,noreferrer');
}

export function getGeneralWhatsAppLink(t) {
  const rawPhone = import.meta.env.VITE_WHATSAPP_PHONE || "+34 900 123 456";
  const phone = rawPhone.replace(/[^0-9]/g, '');
  const message = t('whatsapp_general_msg', {}, 'Hola VAPEX, me gustaría obtener más información sobre sus productos de importación mayorista B2B.');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function handleGeneralWhatsAppContact(t) {
  const link = getGeneralWhatsAppLink(t);
  window.open(link, '_blank', 'noopener,noreferrer');
}

