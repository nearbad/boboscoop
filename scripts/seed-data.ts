// Starter content inserted into empty tables. Everything is editable in the admin panel.

const assortment: [string, string][] = [
  ["Алмазная мозаика", "💎"],
  ["Браслет", "📿"],
  ["Брелок", "🔑"],
  ["Декоративный скотч", "🎞️"],
  ["Зажим", "📎"],
  ["Закладка", "🔖"],
  ["Заколка", "🎀"],
  ["Замазка", "✏️"],
  ["Стикеры для заметок", "🗒️"],
  ["Значок", "📌"],
  ["Карточки", "🃏"],
  ["Коврик для мышки", "🖱️"],
  ["Кольцо", "💍"],
  ["Кошелек", "👛"],
  ["Кулон", "🌙"],
  ["Механический карандаш", "✏️"],
  ["Мини-зеркало", "🪞"],
  ["Пенал", "🖍️"],
  ["Пластырь", "🩹"],
  ["Плюшевая игрушка", "🧸"],
  ["Повязка", "🎧"],
  ["Полотенце", "🧺"],
  ["Резинка", "🍡"],
  ["Румбокс", "🏠"],
  ["Ручка", "🖊️"],
  ["Сережки", "✨"],
  ["Сквиш", "🍮"],
  ["Стикеры", "⭐"],
  ["Переводная тату", "🌸"],
  ["Тетрадь", "📓"],
  ["Файл", "📁"],
  ["Фигурка", "🐰"],
  ["Шоппер", "👜"],
];

export const seedProducts = assortment.map(([name, emoji], i) => ({ name, emoji, sort: i }));

export const seedDeliveryMethods = [
  { name: "Яндекс Маркет", price: 250, note: "До пункта выдачи Яндекс Маркета", sort: 0 },
  { name: "Ozon", price: 250, note: "До пункта выдачи Ozon", sort: 1 },
  { name: "Wildberries", price: 250, note: "До пункта выдачи Wildberries", sort: 2 },
];

// No regional surcharges by default; add them in the admin panel if needed.
export const seedDeliveryZones: { name: string; extra: number; sort: number }[] = [];

export const seedFaq = [
  {
    question: "Что такое «ложка»?",
    answer:
      "Ложка — это порция сюрпризов, которую я зачерпываю из большой коробки с ассортиментом. Чем больше ложек, тем больше предметов в боксе: в среднем ~22 предмета.",
    sort: 0,
  },
  {
    question: "Можно выбрать персонажей и цвета?",
    answer:
      "Да! При заказе отметьте любимых персонажей, цвета и предметы, которые не хотите получать. Я постараюсь всё учесть, но точное содержимое не гарантирую: это всё-таки сюрприз 💜",
    sort: 1,
  },
  {
    question: "Сколько стоит доставка?",
    answer:
      "Отправляю через Яндекс Маркет, Ozon или Wildberries. Стоимость доставки считается при оформлении заказа и оплачивается вместе с боксом.",
    sort: 2,
  },
  {
    question: "Сколько ждать заказ?",
    answer:
      "Обычно собираю бокс в течение нескольких дней после оплаты. Когда отправлю, напишу вам в Telegram.",
    sort: 3,
  },
  {
    question: "Что такое Капсула Боботика?",
    answer:
      "Это подарок к каждому боксу на 3 ложки. После оплаты на странице заказа вы откроете капсулу и узнаете, какой приз положим в посылку. Пустых капсул не бывает! Шансы всех призов есть на странице «Капсула».",
    sort: 5,
  },
  {
    question: "Зачем платить за видео?",
    answer:
      "На каждый ролик уходит от 1,5 до 3 часов. Если мне понравится ваш бокс и захочется его снять, сниму бесплатно!",
    sort: 4,
  },
];

// Example prize pool for "Капсула Боботика" (weights add up to 100, so weight = chance in %).
// Costs are rough guesses for the budget estimate in the admin panel.
export const seedCapsulePrizes = [
  { name: "Мини-набор стикеров", emoji: "🌸", rarity: "common" as const, weight: 40, cost: 60, sort: 0 },
  { name: "Брелок", emoji: "🔑", rarity: "common" as const, weight: 30, cost: 100, sort: 1 },
  { name: "Плюшевая игрушка", emoji: "🧸", rarity: "rare" as const, weight: 15, cost: 350, sort: 2 },
  { name: "Бонусная ½ ложки", emoji: "🥄", rarity: "rare" as const, weight: 7, cost: 400, sort: 3, description: "Доложим в ваш бокс ещё полложки сюрпризов" },
  { name: "Фигурка", emoji: "🐰", rarity: "epic" as const, weight: 7, cost: 400, sort: 4 },
  { name: "Большая плюшевая игрушка", emoji: "🎀", rarity: "super" as const, weight: 1, cost: 1500, stock: 1, sort: 5 },
];

// Placeholder reviews, hidden until replaced with real ones in the admin panel.
export const seedReviews = [
  { author: "Пример отзыва", text: "Замените этот текст настоящим отзывом в админке → Отзывы.", rating: 5, visible: false, sort: 0 },
];
