import { Item, GildedRose } from '@/gilded-rose';

/**
 * Test d'approbation (« golden master »).
 *
 * On fait vivre l'inventaire d'exemple du kata pendant 30 jours et on compare
 * tout ce qu'il produit à un instantané enregistré dans
 * __snapshots__/golden-master.spec.ts.snap.
 * Le moindre écart, sur n'importe quel article et n'importe quel jour,
 * fait échouer le test.
 */

// 30 jours suffisent pour que l'inventaire franchisse tous les seuils du code :
// dates passées, plancher de 0, plafond de 50, chute des billets après le concert.
const DAYS = 30;

// Même inventaire que le texttest_fixture du kata (test/golden-master-text-test.ts dans la source).
function createInventory(): Item[] {
  return [
    new Item('+5 Dexterity Vest', 10, 20),
    new Item('Aged Brie', 2, 0),
    new Item('Elixir of the Mongoose', 5, 7),
    new Item('Sulfuras, Hand of Ragnaros', 0, 80),
    new Item('Sulfuras, Hand of Ragnaros', -1, 80),
    new Item('Backstage passes to a TAFKAL80ETC concert', 15, 20),
    new Item('Backstage passes to a TAFKAL80ETC concert', 10, 49),
    new Item('Backstage passes to a TAFKAL80ETC concert', 5, 49),
    new Item('Conjured Mana Cake', 3, 6),
  ];
}

// Produit le même texte que le texttest_fixture : l'état de chaque article, jour après jour.
function simulate(days: number): string {
  const items = createInventory();
  const gildedRose = new GildedRose(items);
  const lines: string[] = [];

  for (let day = 0; day <= days; day++) {
    lines.push(`-------- day ${day} --------`, 'name, sellIn, quality');
    for (const item of items) {
      lines.push(`${item.name}, ${item.sellIn}, ${item.quality}`);
    }
    lines.push('');
    gildedRose.updateQuality();
  }

  return lines.join('\n');
}

describe("Test d'approbation (golden master)", () => {
  it(`reproduit à l'identique ${DAYS} jours de l'inventaire d'exemple`, () => {
    expect(simulate(DAYS)).toMatchSnapshot();
  });
});
