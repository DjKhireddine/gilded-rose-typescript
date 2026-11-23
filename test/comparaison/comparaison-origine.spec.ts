import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import * as ts from 'typescript';
import { Item, GildedRose } from '@/gilded-rose';

/**
 * Comparaison avec le code d'origine du kata.
 *
 * Une refacto ne doit rien changer, même là où aucun test ne regarde : jours
 * restants négatifs, qualités hors bornes, demi-journées, demi-points. Ce test
 * fait vivre côte à côte, pendant 30 nuits, le code d'origine et le code
 * actuel, sur une grille de plusieurs centaines de milliers de nuits, et exige
 * les mêmes résultats à chaque nuit.
 *
 * Le code d'origine n'est pas recopié dans le dépôt : il est relu dans le
 * premier commit (git show), puis traduit en JavaScript par le compilateur
 * TypeScript. Le test demande donc un clone Git avec tout l'historique.
 *
 * Conjured est exclu de la comparaison : sa règle a changé volontairement,
 * ses tests unitaires la décrivent.
 *
 * Lancement : npm run test:comparaison.
 */

// Premier commit du dépôt : le kata importé à l'identique.
const ORIGINAL_COMMIT = 'bef26ad';

const NAMES = [
  'Sulfuras, Hand of Ragnaros',
  'Aged Brie',
  'Backstage passes to a TAFKAL80ETC concert',
  '+5 Dexterity Vest',
];
const NIGHTS = 30;

type GildedRoseModule = { Item: typeof Item; GildedRose: typeof GildedRose };

// Relit le code d'origine dans l'historique et l'exécute à part. transpileModule
// traduit sans vérifier les types : le code d'origine, aux paramètres non typés,
// ne passerait pas le mode strict.
function loadOriginalCode(): GildedRoseModule {
  const source = execFileSync('git', ['show', `${ORIGINAL_COMMIT}:app/gilded-rose.ts`], {
    encoding: 'utf8',
  });
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  runInNewContext(outputText, { module, exports: module.exports });
  return module.exports as GildedRoseModule;
}

describe("Comparaison avec le code d'origine", () => {
  const original = loadOriginalCode();

  // Garde-fou : une comparaison qui ne peut voir aucune différence ne prouve
  // rien. Sur Conjured, dont la règle a changé, les deux versions doivent
  // diverger : c'est la preuve que le code chargé est bien l'ancien.
  it("charge bien le code d'origine, qui traite Conjured comme un article normal", () => {
    const [before] = new original.GildedRose([
      new original.Item('Conjured Mana Cake', 3, 6),
    ]).updateQuality();
    const [after] = new GildedRose([new Item('Conjured Mana Cake', 3, 6)]).updateQuality();
    expect(before.quality).toBe(5);
    expect(after.quality).toBe(4);
  });

  it("donne, nuit après nuit, les mêmes résultats que le code d'origine", () => {
    const divergences: string[] = [];
    let nights = 0;

    for (const name of NAMES) {
      for (let sellIn = -3; sellIn <= 15; sellIn += 0.5) {
        for (let quality = -5; quality <= 60; quality += 0.5) {
          const before = new original.Item(name, sellIn, quality);
          const after = new Item(name, sellIn, quality);
          const originalShop = new original.GildedRose([before]);
          const currentShop = new GildedRose([after]);

          for (let night = 1; night <= NIGHTS; night++) {
            originalShop.updateQuality();
            currentShop.updateQuality();
            nights++;
            // Object.is plutôt que === : il tient deux NaN pour égaux et distingue 0 de -0.
            if (
              !Object.is(before.sellIn, after.sellIn) ||
              !Object.is(before.quality, after.quality)
            ) {
              divergences.push(
                `${name} (${sellIn}, ${quality}), nuit ${night} : ` +
                  `origine (${before.sellIn}, ${before.quality}), actuel (${after.sellIn}, ${after.quality})`,
              );
              break;
            }
          }
        }
      }
    }

    // Les divergences d'abord : à la première, la boucle de l'article s'arrête
    // et le compte des nuits est faussé. Vérifié en premier, ce compte ferait
    // échouer le test sans montrer la divergence.
    expect(divergences).toEqual([]);

    // 4 noms x 37 valeurs de jours x 131 valeurs de qualité x 30 nuits : la
    // grille a bien été parcourue en entier.
    expect(nights).toBe(581_640);
  });
});
