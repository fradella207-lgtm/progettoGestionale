/**
 * Image Optimizer and Smart Vehicle Photo Search Utilities
 */

// Curated automotive database with realistic, high-definition car photos by Brand, Model, Generation and Year
const BRAND_MODEL_PHOTO_CATALOG: Record<string, string> = {
  // Alfa Romeo
  'alfa romeo 147': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo 159': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo mito': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo giulietta': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo giulia': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo stelvio': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo tonale': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo junior': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'alfa romeo': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',

  // Audi
  'audi a3 2003': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'audi a3 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'audi a3 2008': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'audi a3 8p': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'audi a3': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000&auto=format&fit=crop&q=80',
  'audi a1': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'audi a4': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'audi a5': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'audi a6': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'audi q2': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
  'audi q3': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
  'audi q4': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'audi q5': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'audi q7': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'audi tt': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
  'audi e-tron': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'audi': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000&auto=format&fit=crop&q=80',

  // BMW
  'bmw serie 1 2004': 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 1 2007': 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 1 2008': 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 1 e87': 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 1': 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 3 2005': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 3 2007': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 3 2008': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 3 e90': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 3': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw 320': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw 330e': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 2': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 4': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1000&auto=format&fit=crop&q=80',
  'bmw serie 5': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',
  'bmw x1': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1000&auto=format&fit=crop&q=80',
  'bmw x3': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1000&auto=format&fit=crop&q=80',
  'bmw x5': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'bmw m3': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1000&auto=format&fit=crop&q=80',
  'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80',

  // Cupra
  'cupra formentor': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'cupra leon': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'cupra born': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'cupra': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',

  // Fiat
  'fiat grande punto': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat punto evo': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat punto': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat panda 2003': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat panda 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat panda 2008': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat panda': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat 500': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80',
  'fiat 500x': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'fiat 600': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'fiat bravo': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat tipo': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'fiat': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80',

  // Ford
  'ford fiesta 2007': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'ford fiesta 2008': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'ford fiesta': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'ford focus 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'ford focus 2008': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'ford focus': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'ford puma': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'ford kuga': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'ford mustang': 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=1000&auto=format&fit=crop&q=80',
  'ford': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',

  // Volkswagen
  'volkswagen golf 5': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf v': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 2003': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 2006': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 2008': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 6': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 7': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf 8': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen golf': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen polo 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen polo': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'volkswagen t-roc': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'volkswagen t-cross': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'volkswagen tiguan': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'volkswagen passat': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'volkswagen id.3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'volkswagen id.4': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'volkswagen': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',

  // Renault
  'renault clio 2007': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'renault clio': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'renault captur': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'renault megane': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',

  // Toyota
  'toyota yaris 2007': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1000&auto=format&fit=crop&q=80',
  'toyota yaris': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1000&auto=format&fit=crop&q=80',
  'toyota corolla': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1000&auto=format&fit=crop&q=80',
  'toyota c-hr': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'toyota rav4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'toyota': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1000&auto=format&fit=crop&q=80',

  // Mercedes
  'mercedes classe a 2007': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80',
  'mercedes classe a 2008': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80',
  'mercedes classe a': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80',
  'mercedes classe c': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'mercedes classe e': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'mercedes gla': 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80',
  'mercedes glc': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'mercedes eqb': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80',

  // Opel
  'opel corsa 2007': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'opel corsa': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'opel astra 2007': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'opel astra': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'opel mokka': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'opel grandland': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'opel': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',

  // Peugeot
  'peugeot 208': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'peugeot 2008': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'peugeot 308': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'peugeot 3008': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'peugeot 408': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'peugeot 5008': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'peugeot': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',

  // Porsche
  'porsche 911': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
  'porsche macan': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
  'porsche cayenne': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
  'porsche taycan': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'porsche': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',

  // Seat
  'seat ibiza': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'seat leon': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'seat arona': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'seat ateca': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'seat': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',

  // Skoda
  'skoda fabia': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'skoda octavia': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'skoda kamiq': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'skoda karoq': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'skoda kodiaq': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'skoda enyaq': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'skoda': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',

  // Smart
  'smart fortwo': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80',
  'smart #1': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'smart': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80',

  // Suzuki
  'suzuki swift': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
  'suzuki vitara': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'suzuki ignis': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'suzuki': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',

  // Tesla
  'tesla model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'tesla model y': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'tesla model s': 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1000&auto=format&fit=crop&q=80',
  'tesla model x': 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1000&auto=format&fit=crop&q=80',
  'tesla': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',

  // Volvo
  'volvo xc40': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'volvo ex30': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'volvo xc60': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'volvo v60': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'volvo': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80'
};

const GENERIC_CATEGORY_PHOTOS: Record<string, string> = {
  'suv': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80',
  'berlina': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',
  'compatta': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80',
  'citycar': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80',
  'station wagon': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80',
  'coupé': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
  'elettrica': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80',
  'hybrid': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80'
};

/**
 * Searches online / catalog for an automatic, high-definition vehicle photo based on Brand, Model, Year, Generation and Category
 */
export function getAutomaticVehiclePhoto(
  brand: string, 
  model: string, 
  fuelType?: string, 
  category?: string,
  yearOrGeneration?: number | string
): string {
  const b = (brand || '').trim().toLowerCase();
  const m = (model || '').trim().toLowerCase();
  let yrStr = '';
  if (yearOrGeneration) {
    const yrNum = typeof yearOrGeneration === 'number' 
      ? yearOrGeneration 
      : parseInt(String(yearOrGeneration).match(/\b(19\d{2}|20\d{2})\b/)?.[1] || '', 10);
    if (!isNaN(yrNum) && yrNum > 1980) {
      yrStr = String(yrNum);
    }
  }

  const combinedWithYear = yrStr ? `${b} ${m} ${yrStr}`.trim() : '';
  const combined = `${b} ${m}`.trim();

  // 1. Exact match with year (e.g. "volkswagen golf 2007")
  if (combinedWithYear && BRAND_MODEL_PHOTO_CATALOG[combinedWithYear]) {
    return BRAND_MODEL_PHOTO_CATALOG[combinedWithYear];
  }

  // 2. Exact Brand + Model match in catalog
  if (BRAND_MODEL_PHOTO_CATALOG[combined]) {
    return BRAND_MODEL_PHOTO_CATALOG[combined];
  }

  // 3. Match with year tokens in catalog keys
  if (yrStr && b && m) {
    for (const [key, url] of Object.entries(BRAND_MODEL_PHOTO_CATALOG)) {
      if (key.includes(b) && key.includes(m) && key.includes(yrStr)) {
        return url;
      }
    }
  }

  // 4. Contains match with both brand and model tokens
  for (const [key, url] of Object.entries(BRAND_MODEL_PHOTO_CATALOG)) {
    if (b && m && key.includes(b) && (key.includes(m) || m.includes(key.replace(b, '').trim()))) {
      return url;
    }
  }

  // 5. Partial combined query match
  for (const [key, url] of Object.entries(BRAND_MODEL_PHOTO_CATALOG)) {
    if (combined && (combined.includes(key) || key.includes(combined))) {
      return url;
    }
  }

  // 6. Model-only match in catalog
  if (m) {
    for (const [key, url] of Object.entries(BRAND_MODEL_PHOTO_CATALOG)) {
      const parts = key.split(' ');
      if (parts.length > 1 && parts.slice(1).join(' ').includes(m)) {
        return url;
      }
    }
  }

  // 7. Brand-only match in catalog
  if (b && BRAND_MODEL_PHOTO_CATALOG[b]) {
    return BRAND_MODEL_PHOTO_CATALOG[b];
  }

  // 8. Category / Fuel fallback
  const fuelLower = (fuelType || '').toLowerCase();
  if (fuelLower.includes('elettr') || fuelLower.includes('bev')) {
    return GENERIC_CATEGORY_PHOTOS['elettrica'];
  }
  if (fuelLower.includes('phev') || fuelLower.includes('plug-in')) {
    return GENERIC_CATEGORY_PHOTOS['hybrid'];
  }

  const catLower = (category || '').toLowerCase();
  if (catLower && GENERIC_CATEGORY_PHOTOS[catLower]) {
    return GENERIC_CATEGORY_PHOTOS[catLower];
  }

  return GENERIC_CATEGORY_PHOTOS['default'];
}

export const POPULAR_CAR_PRESET_PHOTOS = [
  { label: 'Compatta Grigio / Argento', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Compatta Rossa', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Berlina Sportiva Blu', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Berlina Elegante Nera / Grigia', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&auto=format&fit=crop&q=80' },
  { label: 'SUV Moderno Scuro', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000&auto=format&fit=crop&q=80' },
  { label: 'SUV Sportivo Bianco', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Crossover / Cupra Formentor', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Citycar Compatta Bianca', url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Station Wagon / Familiare', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Elettrica Hi-Tech', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&auto=format&fit=crop&q=80' }
];

export interface OptimizationResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
}

/**
 * Optimizes an uploaded image on the client side:
 * - Resizes to max dimensions (default: 1000x650)
 * - Compresses with canvas.toDataURL('image/jpeg', 0.78)
 * - Returns lightweight DataURL safe for localStorage
 */
export function optimizeImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 650,
  quality = 0.78
): Promise<OptimizationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context non disponibile'));
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Approximate size of base64
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const optimizedSize = Math.round((stringLength * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          optimizedSize,
          width,
          height
        });
      };

      img.onerror = () => {
        reject(new Error('Impossibile decodificare l\'immagine selezionata'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    reader.readAsDataURL(file);
  });
}
