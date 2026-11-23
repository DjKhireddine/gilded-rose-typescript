export class Item {
  name: string;
  sellIn: number;
  quality: number;

  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

// Les trois articles qui ont une règle à eux. Une constante plutôt que le nom
// recopié : une faute de frappe dans une copie du nom changerait la règle de
// l'article sans aucune erreur, alors qu'une faute dans le nom de la constante
// ne compile pas.
const AGED_BRIE = 'Aged Brie';
const BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';

// Bornes de la qualité des articles qui vieillissent. Sulfuras, à 80, n'est
// pas concerné : il ne change jamais.
const MIN_QUALITY = 0;
const MAX_QUALITY = 50;

export class GildedRose {
  items: Array<Item>;

  constructor(items = [] as Array<Item>) {
    this.items = items;
  }

  updateQuality() {
    for (const item of this.items) {
      updateItem(item);
    }

    return this.items;
  }
}

// Fait passer une nuit à un seul article. Fonction hors de la classe : elle n'a
// besoin que de l'article, pas de tout l'inventaire.
function updateItem(item: Item): void {
  // Sulfuras est un objet légendaire : ni ses jours restants ni sa qualité ne
  // changent. On le met de côté d'entrée, pour que toute la suite ne concerne
  // que des articles qui vieillissent.
  if (item.name === SULFURAS) {
    return;
  }

  // Aged Brie se bonifie en vieillissant : 1 point par nuit, 2 une fois les
  // jours restants passés sous 0 (après le décompte du jour).
  if (item.name === AGED_BRIE) {
    item.sellIn = item.sellIn - 1;
    increaseQuality(item, item.sellIn < 0 ? 2 : 1);
    return;
  }

  // Billet de concert : sa valeur monte à l'approche du concert, puis tombe à 0.
  // À la différence du Brie, le gain se calcule sur les jours restants avant
  // le décompte. Après le décompte, des jours restants sous 0 veulent dire que
  // le concert est passé.
  if (item.name === BACKSTAGE_PASS) {
    increaseQuality(item, backstagePassGain(item.sellIn));
    item.sellIn = item.sellIn - 1;
    if (item.sellIn < 0) {
      item.quality = 0;
    }
    return;
  }

  // Article normal : tout article sans règle à lui (Conjured compris, que le
  // code ne connaît pas encore). Il perd 1 point par nuit, 2 une fois les jours
  // restants passés sous 0 (après le décompte du jour).
  item.sellIn = item.sellIn - 1;
  decreaseQuality(item, item.sellIn < 0 ? 2 : 1);
}

// Points gagnés par un billet en une nuit, selon ses jours restants. Le premier
// seuil atteint l'emporte : l'ordre des tests compte. Seuils du code (< 6 et
// < 11) ; la spécification dit « 5 jours ou moins » et « 10 jours ou moins »,
// ce qui revient au même pour des jours entiers.
function backstagePassGain(sellIn: number): number {
  if (sellIn < 6) {
    return 3;
  }
  if (sellIn < 11) {
    return 2;
  }
  return 1;
}

// Ajoute des points un par un, tant que la qualité est sous MAX_QUALITY.
// Point par point plutôt qu'avec Math.min : Math.min ramènerait à 50 une
// qualité qui le dépasse déjà, ce que le code d'origine ne fait pas (test
// « comportement actuel »). Une qualité au-dessus de 50 ne gagne donc rien.
function increaseQuality(item: Item, points: number): void {
  for (let added = 0; added < points && item.quality < MAX_QUALITY; added++) {
    item.quality = item.quality + 1;
  }
}

// Retire des points un par un, tant que la qualité est au-dessus de
// MIN_QUALITY. Même principe : une qualité déjà négative ne perd rien et n'est
// pas ramenée à 0 (test « comportement actuel »).
function decreaseQuality(item: Item, points: number): void {
  for (let removed = 0; removed < points && item.quality > MIN_QUALITY; removed++) {
    item.quality = item.quality - 1;
  }
}
