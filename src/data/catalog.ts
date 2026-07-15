import type { CatalogItem } from '../lib/types'

/**
 * Master catalogue of common Indian kirana SKUs. Seeded (once) into the global
 * Firestore `catalog` collection and used as an offline fallback. Prices are
 * indicative MRP (₹); cost is the typical wholesale buy price.
 */
export const CATALOG: Omit<CatalogItem, 'id'>[] = [
  // ---------------- Staples ----------------
  { name: 'Aashirvaad Atta 5kg', brand: 'ITC', emoji: '🌾', category: 'Staples', price: 265, cost: 240, unit: 'bag' },
  { name: 'Fortune Chakki Atta 10kg', brand: 'Fortune', emoji: '🌾', category: 'Staples', price: 470, cost: 435, unit: 'bag' },
  { name: 'India Gate Basmati Rice 1kg', brand: 'India Gate', emoji: '🍚', category: 'Staples', price: 135, cost: 118, unit: 'pack' },
  { name: 'Daawat Rozana Rice 5kg', brand: 'Daawat', emoji: '🍚', category: 'Staples', price: 320, cost: 288, unit: 'bag' },
  { name: 'Tata Salt 1kg', brand: 'Tata', emoji: '🧂', category: 'Staples', price: 28, cost: 24, unit: 'pack' },
  { name: 'Fortune Sunflower Oil 1L', brand: 'Fortune', emoji: '🛢️', category: 'Staples', price: 145, cost: 132, unit: 'bottle' },
  { name: 'Saffola Gold Oil 1L', brand: 'Saffola', emoji: '🛢️', category: 'Staples', price: 175, cost: 158, unit: 'bottle' },
  { name: 'Toor Dal 1kg', brand: 'Tata Sampann', emoji: '🫘', category: 'Staples', price: 165, cost: 148, unit: 'pack' },
  { name: 'Chana Dal 1kg', brand: 'Tata Sampann', emoji: '🫘', category: 'Staples', price: 95, cost: 84, unit: 'pack' },
  { name: 'Rajma 1kg', brand: 'Local', emoji: '🫘', category: 'Staples', price: 140, cost: 122, unit: 'pack' },
  { name: 'Sugar 1kg', brand: 'Local', emoji: '🍬', category: 'Staples', price: 45, cost: 40, unit: 'pack' },
  { name: 'Besan 500g', brand: 'Rajdhani', emoji: '🌾', category: 'Staples', price: 55, cost: 47, unit: 'pack' },
  { name: 'Kissan Mixed Jam 200g', brand: 'Kissan', emoji: '🍓', category: 'Staples', price: 90, cost: 79, unit: 'jar' },
  { name: 'MDH Garam Masala 100g', brand: 'MDH', emoji: '🌶️', category: 'Staples', price: 78, cost: 66, unit: 'box' },
  { name: 'Everest Turmeric 200g', brand: 'Everest', emoji: '🟡', category: 'Staples', price: 62, cost: 53, unit: 'pack' },

  // ---------------- Snacks ----------------
  { name: 'Maggi 2-Min Noodles', brand: 'Nestlé', emoji: '🍜', category: 'Snacks', price: 14, cost: 11, unit: 'pack' },
  { name: 'Maggi Family Pack 560g', brand: 'Nestlé', emoji: '🍜', category: 'Snacks', price: 96, cost: 84, unit: 'pack' },
  { name: 'Parle-G Biscuit', brand: 'Parle', emoji: '🍪', category: 'Snacks', price: 10, cost: 8, unit: 'pack' },
  { name: 'Britannia Good Day 100g', brand: 'Britannia', emoji: '🍪', category: 'Snacks', price: 30, cost: 25, unit: 'pack' },
  { name: 'Britannia Marie Gold', brand: 'Britannia', emoji: '🍪', category: 'Snacks', price: 35, cost: 29, unit: 'pack' },
  { name: 'Lays Classic Salted 52g', brand: 'PepsiCo', emoji: '🥔', category: 'Snacks', price: 20, cost: 16, unit: 'pack' },
  { name: 'Kurkure Masala Munch', brand: 'PepsiCo', emoji: '🌽', category: 'Snacks', price: 20, cost: 16, unit: 'pack' },
  { name: 'Haldiram Aloo Bhujia 200g', brand: 'Haldiram', emoji: '🥨', category: 'Snacks', price: 52, cost: 44, unit: 'pack' },
  { name: 'Haldiram Bhujia Sev 400g', brand: 'Haldiram', emoji: '🥨', category: 'Snacks', price: 95, cost: 82, unit: 'pack' },
  { name: 'Bingo Mad Angles', brand: 'ITC', emoji: '🔺', category: 'Snacks', price: 20, cost: 16, unit: 'pack' },
  { name: 'Dairy Milk Chocolate 50g', brand: 'Cadbury', emoji: '🍫', category: 'Snacks', price: 45, cost: 38, unit: 'bar' },
  { name: 'Nestlé KitKat 4-finger', brand: 'Nestlé', emoji: '🍫', category: 'Snacks', price: 30, cost: 25, unit: 'bar' },
  { name: 'Parle Monaco Biscuit', brand: 'Parle', emoji: '🍘', category: 'Snacks', price: 20, cost: 16, unit: 'pack' },

  // ---------------- Dairy ----------------
  { name: 'Amul Taaza Milk 500ml', brand: 'Amul', emoji: '🥛', category: 'Dairy', price: 27, cost: 24, unit: 'pouch' },
  { name: 'Amul Gold Milk 500ml', brand: 'Amul', emoji: '🥛', category: 'Dairy', price: 33, cost: 30, unit: 'pouch' },
  { name: 'Mother Dairy Milk 500ml', brand: 'Mother Dairy', emoji: '🥛', category: 'Dairy', price: 28, cost: 25, unit: 'pouch' },
  { name: 'Amul Butter 100g', brand: 'Amul', emoji: '🧈', category: 'Dairy', price: 56, cost: 50, unit: 'pack' },
  { name: 'Amul Cheese Slices 100g', brand: 'Amul', emoji: '🧀', category: 'Dairy', price: 85, cost: 74, unit: 'pack' },
  { name: 'Amul Dahi 400g', brand: 'Amul', emoji: '🥣', category: 'Dairy', price: 40, cost: 34, unit: 'cup' },
  { name: 'Amul Paneer 200g', brand: 'Amul', emoji: '🧀', category: 'Dairy', price: 95, cost: 84, unit: 'pack' },
  { name: 'Nestlé Milkmaid 400g', brand: 'Nestlé', emoji: '🥫', category: 'Dairy', price: 145, cost: 128, unit: 'tin' },
  { name: 'Amul Masti Buttermilk 200ml', brand: 'Amul', emoji: '🥤', category: 'Dairy', price: 10, cost: 8, unit: 'pouch' },

  // ---------------- Beverages ----------------
  { name: 'Coca-Cola 750ml', brand: 'Coca-Cola', emoji: '🥤', category: 'Beverages', price: 40, cost: 33, unit: 'bottle' },
  { name: 'Thums Up 750ml', brand: 'Coca-Cola', emoji: '🥤', category: 'Beverages', price: 40, cost: 33, unit: 'bottle' },
  { name: 'Sprite 750ml', brand: 'Coca-Cola', emoji: '🥤', category: 'Beverages', price: 40, cost: 33, unit: 'bottle' },
  { name: 'Pepsi 750ml', brand: 'PepsiCo', emoji: '🥤', category: 'Beverages', price: 40, cost: 33, unit: 'bottle' },
  { name: 'Frooti Mango 250ml', brand: 'Parle Agro', emoji: '🥭', category: 'Beverages', price: 20, cost: 16, unit: 'pack' },
  { name: 'Real Mixed Fruit Juice 1L', brand: 'Dabur', emoji: '🧃', category: 'Beverages', price: 110, cost: 96, unit: 'pack' },
  { name: 'Red Label Tea 250g', brand: 'Brooke Bond', emoji: '🍵', category: 'Beverages', price: 140, cost: 124, unit: 'pack' },
  { name: 'Tata Tea Gold 250g', brand: 'Tata', emoji: '🍵', category: 'Beverages', price: 155, cost: 138, unit: 'pack' },
  { name: 'Nescafé Classic 50g', brand: 'Nestlé', emoji: '☕', category: 'Beverages', price: 155, cost: 138, unit: 'jar' },
  { name: 'Bisleri Water 1L', brand: 'Bisleri', emoji: '💧', category: 'Beverages', price: 20, cost: 14, unit: 'bottle' },
  { name: 'Bournvita 500g', brand: 'Cadbury', emoji: '🥛', category: 'Beverages', price: 245, cost: 218, unit: 'jar' },

  // ---------------- Personal Care ----------------
  { name: 'Colgate MaxFresh 150g', brand: 'Colgate', emoji: '🪥', category: 'Personal Care', price: 95, cost: 82, unit: 'tube' },
  { name: 'Close Up Red 150g', brand: 'HUL', emoji: '🪥', category: 'Personal Care', price: 92, cost: 80, unit: 'tube' },
  { name: 'Dettol Soap 125g', brand: 'Reckitt', emoji: '🧼', category: 'Personal Care', price: 45, cost: 38, unit: 'bar' },
  { name: 'Lux Soap 100g', brand: 'HUL', emoji: '🧼', category: 'Personal Care', price: 38, cost: 32, unit: 'bar' },
  { name: 'Clinic Plus Shampoo 175ml', brand: 'HUL', emoji: '🧴', category: 'Personal Care', price: 98, cost: 85, unit: 'bottle' },
  { name: 'Head & Shoulders 180ml', brand: 'P&G', emoji: '🧴', category: 'Personal Care', price: 165, cost: 145, unit: 'bottle' },
  { name: 'Parachute Coconut Oil 200ml', brand: 'Marico', emoji: '🥥', category: 'Personal Care', price: 95, cost: 82, unit: 'bottle' },
  { name: 'Nivea Cream 100ml', brand: 'Nivea', emoji: '🧴', category: 'Personal Care', price: 135, cost: 118, unit: 'jar' },
  { name: 'Gillette Guard Razor', brand: 'Gillette', emoji: '🪒', category: 'Personal Care', price: 30, cost: 25, unit: 'pc' },

  // ---------------- Household ----------------
  { name: 'Surf Excel Easy Wash 1kg', brand: 'HUL', emoji: '🧺', category: 'Household', price: 130, cost: 116, unit: 'pack' },
  { name: 'Tide Plus 1kg', brand: 'P&G', emoji: '🧺', category: 'Household', price: 115, cost: 102, unit: 'pack' },
  { name: 'Vim Dishwash Bar 300g', brand: 'HUL', emoji: '🧽', category: 'Household', price: 30, cost: 25, unit: 'bar' },
  { name: 'Vim Liquid Gel 500ml', brand: 'HUL', emoji: '🧴', category: 'Household', price: 110, cost: 96, unit: 'bottle' },
  { name: 'Harpic Toilet Cleaner 500ml', brand: 'Reckitt', emoji: '🚽', category: 'Household', price: 92, cost: 80, unit: 'bottle' },
  { name: 'Lizol Floor Cleaner 500ml', brand: 'Reckitt', emoji: '🧴', category: 'Household', price: 99, cost: 86, unit: 'bottle' },
  { name: 'Good Knight Refill', brand: 'Godrej', emoji: '🦟', category: 'Household', price: 78, cost: 66, unit: 'pc' },
  { name: 'Colin Glass Cleaner 500ml', brand: 'Reckitt', emoji: '🪟', category: 'Household', price: 95, cost: 82, unit: 'bottle' },
  { name: 'Exo Dishwash Bar 700g', brand: 'Jyothy', emoji: '🧽', category: 'Household', price: 55, cost: 46, unit: 'pack' },
]
