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

  // Aged Brie se bonifie en vieillissant : 1 point par nuit, puis 1 point de
  // plus une fois les jours restants passés sous 0. Chaque point n'est ajouté
  // que si la qualité est sous 50 : une qualité déjà au-dessus ne bouge pas.
  if (item.name === AGED_BRIE) {
    if (item.quality < 50) {
      item.quality = item.quality + 1;
    }
    item.sellIn = item.sellIn - 1;
    if (item.sellIn < 0 && item.quality < 50) {
      item.quality = item.quality + 1;
    }
    return;
  }

  if (item.name !== BACKSTAGE_PASS) {
    if (item.quality > 0) {
      item.quality = item.quality - 1;
    }
  } else {
    if (item.quality < 50) {
      item.quality = item.quality + 1;
      if (item.sellIn < 11) {
        if (item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
      if (item.sellIn < 6) {
        if (item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
    }
  }
  item.sellIn = item.sellIn - 1;
  if (item.sellIn < 0) {
    if (item.name !== BACKSTAGE_PASS) {
      if (item.quality > 0) {
        item.quality = item.quality - 1;
      }
    } else {
      item.quality = item.quality - item.quality;
    }
  }
}
