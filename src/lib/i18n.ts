import type { Lang, Product, Settings } from "./types";

export const BRAND = "JJ Baked Goods";

const en = {
  nav: { menu: "Menu", how: "How it works", custom: "Party orders", faq: "FAQ", cart: "Bag" },
  announce: (day: string, by: string) => `Now taking orders for ${day} · Order by ${by}`,
  announceNone: "New bake days coming soon · Join the list at the bottom of the page",
  hero: {
    title1: "Pan dulce,",
    title2: "baked to order.",
    sub: "Conchas, miguelitos, cañones and more, made by hand in small batches. Order ahead, pick up fresh.",
    cta: "Start your order",
    cta2: "Party orders",
    sticker: ["Conchas", "3 for", "$5"],
  },
  how: {
    title: "Fresh, the easy way",
    steps: (by: string, day: string) => [
      { k: "Order", t: `Order by ${by}`, d: "Pick your treats and a pickup time. Mix concha flavors any way you like." },
      { k: "Bake", t: `We bake ${day}`, d: "Everything is made from scratch, only for the orders we receive." },
      { k: "Enjoy", t: "Pick up & pay", d: "The pickup address comes with your confirmation. Pay when you pick up." },
    ],
    fallback: { by: "the cutoff", day: "on your bake day" },
  },
  menu: {
    kicker: "The menu",
    title: "Fresh from the oven",
    sub: "Small batches, made from scratch every bake day.",
    each: "each",
    mix: "Mix & match",
    bagBar: (n: number) => `View bag · ${n} ${n === 1 ? "item" : "items"}`,
    packOf: (n: number) => `pack of ${n}`,
    add: "Add",
    added: "Added",
    soldOut: "Sold out",
    inCart: (n: number) => `${n} in cart`,
    chooseFlavors: (n: number) => `Build your pack of ${n}`,
    picked: (a: number, b: number) => `${a} of ${b}`,
    packs: "Packs",
    addToOrder: "Add to order",
  },
  custom: {
    band: "Feeding a crowd?",
    bandSub: "Baby shower, office breakfast: we bake trays and big orders just for you. Tell us what you need and we'll reply with a quote.",
    bandCta: "Plan a party order",
    title: "Custom & party orders",
    sub: "Tell us about your event. We'll reply by text or email with availability and a quote, usually within a day.",
    name: "Your name",
    phone: "Phone",
    email: "Email (optional)",
    date: "Event date",
    quantity: "About how many people or pieces?",
    details: "What would you like?",
    detailsPh: "e.g. 3 dozen conchas (mixed flavors) and 24 miguelitos for a baby shower",
    submit: "Send request",
    sent: "Thank you! We got your request and will be in touch soon.",
    thanks: "Thank you!",
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "How far ahead should I order?",
        a: "Orders for each bake day close before we start baking. You'll see the exact “order by” time when you pick your day.",
      },
      {
        q: "How do I pay?",
        a: "You pay at pickup. The accepted payment methods are listed at checkout.",
      },
      {
        q: "Where do I pick up?",
        a: "We bake from a home kitchen, so the pickup address comes with your order confirmation.",
      },
      {
        q: "Do you deliver?",
        a: "Not yet. For large custom orders, ask us and we'll see what we can do.",
      },
      {
        q: "Allergens?",
        a: "Our treats are made in a home kitchen with wheat, dairy, and eggs. Some items contain coconut. Please ask us about specific allergies before you order.",
      },
    ],
  },
  footer: {
    notifyTitle: "Hear about new bake days",
    notifyPh: "Email or phone number",
    notifyCta: "Notify me",
    notifyDone: "You're on the list!",
    homemade: "Made by hand and made with love.",
  },
  cart: {
    title: "Your bag",
    empty: "Your bag is empty.",
    browse: "Browse the menu",
    subtotal: "Subtotal",
    checkout: "Choose pickup time",
    remove: "Remove",
    close: "Close",
  },
  checkout: {
    title: "Checkout",
    yourOrder: "Your order",
    edit: "Edit",
    day: "Choose a bake day",
    window: "Pickup window",
    full: "Full",
    spotsLeft: (n: number) => (n === 1 ? "1 spot left" : `${n} spots left`),
    orderBy: (by: string) => `Order by ${by}`,
    you: "Your details",
    name: "Name",
    phone: "Phone",
    phoneHelp: "We'll text you if anything changes.",
    email: "Email (optional)",
    emailHelp: "For your confirmation receipt.",
    notes: "Notes (optional)",
    notesPh: "Anything we should know?",
    pay: "Payment",
    place: "Place order",
    placing: "Placing order…",
    total: "Total due at pickup",
    noDays: "There are no open bake days right now. Please check back soon.",
    errors: {
      generic: "Something went wrong. Please try again.",
      full: "That bake day just filled up. Please pick another day.",
      closed: "Orders for that day just closed. Please pick another day.",
      unavailable: "An item in your order is no longer available. Please review your order.",
      invalid: "Please check the highlighted fields.",
    },
  },
  confirm: {
    title: (name: string) => `Thank you, ${name}!`,
    sub: "Your order is in. We'll confirm it shortly.",
    code: "Order number",
    pickup: "Pickup",
    where: "Pickup address",
    whereLater: "We'll send you the pickup address when we confirm your order.",
    back: "Back to the menu",
    status: {
      new: "Received",
      confirmed: "Confirmed",
      ready: "Ready for pickup",
      picked_up: "Picked up",
      cancelled: "Cancelled",
    },
  },
  gate: {
    hello: "Welcome!",
    ask: "Which language do you prefer?",
    note: "You can switch anytime at the top of the page.",
  },
  flavorsOf: "Flavors",
  langToggle: "Español",
};

type Dict = typeof en;

const es: Dict = {
  nav: { menu: "Menú", how: "Cómo funciona", custom: "Fiestas", faq: "Preguntas", cart: "Pedido" },
  announce: (day: string, by: string) => `Ya puedes pedir para el ${day} · Pide a más tardar el ${by}`,
  announceNone: "Pronto anunciaremos nuevos días de horneado · Únete a la lista al final de la página",
  hero: {
    title1: "Pan dulce,",
    title2: "hecho por encargo.",
    sub: "Conchas, miguelitos, cañones y mucho más, hechos a mano en tandas pequeñas. Haz tu pedido con anticipación y recógelo recién horneado.",
    cta: "Haz tu pedido",
    cta2: "Pedidos para fiestas",
    sticker: ["Conchas", "3 por", "$5"],
  },
  how: {
    title: "Fresco y sin complicaciones",
    steps: (by: string, day: string) => [
      {
        k: "Pide",
        t: `Pide a más tardar el ${by}`,
        d: "Elige tus favoritos y un horario para recoger. Combina los sabores de las conchas como quieras.",
      },
      { k: "Horneamos", t: `Horneamos el ${day}`, d: "Todo se hace desde cero, solo para los pedidos que recibimos." },
      { k: "Disfruta", t: "Recoge y paga", d: "La dirección aparece en tu confirmación. Pagas al recoger." },
    ],
    fallback: { by: "día límite", day: "día que elijas" },
  },
  menu: {
    kicker: "El menú",
    title: "Recién salido del horno",
    sub: "Tandas pequeñas, hechas desde cero cada día horneado.",
    each: "c/u",
    mix: "Combina sabores",
    bagBar: (n: number) => `Ver mi pedido · ${n} ${n === 1 ? "producto" : "productos"}`,
    packOf: (n: number) => `paquete de ${n}`,
    add: "Agregar",
    added: "Agregado",
    soldOut: "Agotado",
    inCart: (n: number) => `${n} en tu pedido`,
    chooseFlavors: (n: number) => `Arma tu paquete de ${n}`,
    picked: (a: number, b: number) => `${a} de ${b}`,
    packs: "Paquetes",
    addToOrder: "Agregar al pedido",
  },
  custom: {
    band: "¿Tienes una fiesta?",
    bandSub:
      "Baby shower, desayuno en la oficina: preparamos bandejas y pedidos grandes especialmente para ti. Cuéntanos qué necesitas y te enviamos una cotización.",
    bandCta: "Pide una cotización",
    title: "Fiestas y pedidos especiales",
    sub: "Cuéntanos sobre tu evento. Te responderemos por mensaje de texto o correo con la disponibilidad y una cotización, normalmente en un día.",
    name: "Tu nombre",
    phone: "Teléfono",
    email: "Correo electrónico (opcional)",
    date: "Fecha del evento",
    quantity: "¿Para cuántas personas o cuántas piezas, más o menos?",
    details: "¿Qué te gustaría pedir?",
    detailsPh: "Ej.: 3 docenas de conchas (sabores surtidos) y 24 miguelitos para un baby shower",
    submit: "Enviar solicitud",
    sent: "¡Gracias! Recibimos tu solicitud y te contactaremos muy pronto.",
    thanks: "¡Gracias!",
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Con cuánta anticipación debo hacer mi pedido?",
        a: "Los pedidos para cada día de horneado cierran antes de que empecemos a hornear. Al elegir tu día verás la fecha y la hora límite exactas.",
      },
      {
        q: "¿Cómo pago?",
        a: "Pagas al momento de recoger. Verás las formas de pago aceptadas al finalizar tu pedido.",
      },
      {
        q: "¿Dónde recojo mi pedido?",
        a: "Horneamos en una cocina casera, por eso la dirección aparece en la confirmación de tu pedido.",
      },
      {
        q: "¿Hacen entregas a domicilio?",
        a: "Por ahora no. Si es un pedido grande para un evento, pregúntanos y vemos cómo te podemos ayudar.",
      },
      {
        q: "¿Tienen información sobre alérgenos?",
        a: "Nuestros productos se preparan en una cocina casera donde se usan trigo, lácteos y huevo. Algunos contienen coco. Si tienes alguna alergia, pregúntanos antes de hacer tu pedido.",
      },
    ],
  },
  footer: {
    notifyTitle: "Entérate de los próximos días de horneado",
    notifyPh: "Correo o teléfono",
    notifyCta: "Avísame",
    notifyDone: "¡Listo! Ya estás en la lista.",
    homemade: "Hecho a mano y con mucho amor.",
  },
  cart: {
    title: "Tu pedido",
    empty: "Tu pedido está vacío.",
    browse: "Ver el menú",
    subtotal: "Subtotal",
    checkout: "Elegir día y hora",
    remove: "Quitar",
    close: "Cerrar",
  },
  checkout: {
    title: "Finalizar pedido",
    yourOrder: "Tu pedido",
    edit: "Editar",
    day: "Elige el día de horneado",
    window: "Horario para recoger",
    full: "Lleno",
    spotsLeft: (n: number) => (n === 1 ? "queda 1 lugar" : `quedan ${n} lugares`),
    orderBy: (by: string) => `Pide a más tardar el ${by}`,
    you: "Tus datos",
    name: "Nombre",
    phone: "Teléfono",
    phoneHelp: "Te enviaremos un mensaje si hay algún cambio.",
    email: "Correo electrónico (opcional)",
    emailHelp: "Para enviarte la confirmación.",
    notes: "Notas (opcional)",
    notesPh: "¿Algo que debamos saber?",
    pay: "Pago",
    place: "Hacer pedido",
    placing: "Enviando tu pedido…",
    total: "Total a pagar al recoger",
    noDays: "Por ahora no hay días de horneado disponibles. Vuelve pronto.",
    errors: {
      generic: "Algo salió mal. Por favor, inténtalo de nuevo.",
      full: "Ese día se acaba de llenar. Por favor, elige otro día.",
      closed: "Los pedidos para ese día acaban de cerrar. Por favor, elige otro día.",
      unavailable: "Uno de los productos de tu pedido ya no está disponible. Revisa tu pedido.",
      invalid: "Revisa los campos marcados.",
    },
  },
  confirm: {
    title: (name: string) => `¡Gracias, ${name}!`,
    sub: "Recibimos tu pedido. Te lo confirmaremos muy pronto.",
    code: "Número de pedido",
    pickup: "Para recoger",
    where: "Dirección para recoger",
    whereLater: "Te enviaremos la dirección cuando confirmemos tu pedido.",
    back: "Volver al menú",
    status: {
      new: "Recibido",
      confirmed: "Confirmado",
      ready: "Listo para recoger",
      picked_up: "Entregado",
      cancelled: "Cancelado",
    },
  },
  gate: {
    hello: "¡Bienvenidos!",
    ask: "¿En qué idioma prefieres ver la página?",
    note: "Puedes cambiarlo cuando quieras en la parte de arriba.",
  },
  flavorsOf: "Sabores",
  langToggle: "English",
};

export const DICT: Record<Lang, Dict> = { en, es };
export type { Dict };

export function paymentNote(s: Pick<Settings, "paymentNote" | "paymentNoteEs">, lang: Lang) {
  return (lang === "es" && s.paymentNoteEs) || s.paymentNote;
}
export function announcementText(s: Pick<Settings, "announcement" | "announcementEs">, lang: Lang) {
  return (lang === "es" && s.announcementEs) || s.announcement;
}

export function productName(p: Pick<Product, "name_en" | "name_es">, lang: Lang) {
  return lang === "es" ? p.name_es : p.name_en;
}
export function productDescription(p: Pick<Product, "description_en" | "description_es">, lang: Lang) {
  return lang === "es" ? p.description_es : p.description_en;
}
