import { Item, GildedRose } from '@/gilded-rose';

/**
 * Tests unitaires, règle par règle.
 *
 * Chaque test crée un seul article, laisse passer une nuit et vérifie ses
 * jours restants (sellIn) et sa qualité (quality).
 *
 * Les tests marqués « comportement actuel » figent ce que fait le code
 * aujourd'hui dans des cas que la spécification ne décrit pas, ou qu'elle
 * décrit autrement. Les changer serait une décision métier, pas un nettoyage.
 *
 * Convention des commentaires : ils décrivent ce que fait le code, avec ses
 * seuils exacts (« moins de 11 jours » pour sellIn < 11), mais jamais la forme
 * du code (où se trouve un contrôle, combien de fois il est écrit). Une refacto
 * change la forme et garde le comportement : ces commentaires doivent rester
 * vrais avant comme après. Quand la spécification dit autre chose, ils la
 * citent comme telle.
 */

const NORMAL = '+5 Dexterity Vest';
const CONJURED = 'Conjured Mana Cake';
const AGED_BRIE = 'Aged Brie';

// Crée un article, laisse passer une nuit et renvoie ses nouvelles valeurs.
function afterOneNight(name: string, sellIn: number, quality: number) {
  const [item] = new GildedRose([new Item(name, sellIn, quality)]).updateQuality();
  return { sellIn: item.sellIn, quality: item.quality };
}

/**
 * Article normal : tout nom qui n'est ni le Brie, ni le billet, ni Sulfuras.
 * Chaque nuit, le jour est décompté et la qualité perd 1 point ; 2 points si,
 * après le décompte, les jours restants sont sous 0. Chaque point n'est retiré
 * que si la qualité est encore au-dessus de 0.
 */
describe('Article normal', () => {
  it('perd 1 jour et 1 point de qualité par nuit', () => {
    expect(afterOneNight(NORMAL, 10, 20)).toEqual({ sellIn: 9, quality: 19 });
  });

  // Charnière : le second point dépend des jours restants après le décompte.
  // À sellIn 1, il reste 0 jour, ce qui n'est pas sous 0 : un seul point.
  it('perd encore 1 seul point la veille de sa date (sellIn 1)', () => {
    expect(afterOneNight(NORMAL, 1, 20)).toEqual({ sellIn: 0, quality: 19 });
  });

  // À sellIn 0, le décompte donne -1, sous 0 : le second point tombe dès cette
  // nuit-là. La spécification dit « une fois que la date de péremption est
  // passée » sans préciser le cas de sellIn 0 : c'est le code qui tranche.
  it('perd 2 points par nuit une fois sa date passée', () => {
    expect(afterOneNight(NORMAL, 0, 20)).toEqual({ sellIn: -1, quality: 18 });
    expect(afterOneNight(NORMAL, -5, 20)).toEqual({ sellIn: -6, quality: 18 });
  });

  // Plancher : un point n'est retiré que si la qualité est au-dessus de 0
  // (quality > 0).
  it('ne descend jamais sous 0', () => {
    expect(afterOneNight(NORMAL, 5, 0)).toEqual({ sellIn: 4, quality: 0 });
  });

  // Le premier point retiré amène la qualité à 0 ; le second n'est alors pas
  // retiré, car la qualité n'est plus au-dessus de 0.
  it('après sa date, passe de 1 à 0, pas à -1', () => {
    expect(afterOneNight(NORMAL, 0, 1)).toEqual({ sellIn: -1, quality: 0 });
  });

  // Hors spécification (« jamais plus de 50 ») : le code ne vérifie le plafond
  // que quand la qualité monte. Ce cas est absent de l'inventaire d'exemple,
  // donc invisible pour le golden master : ce test protège tout futur
  // regroupement des contrôles de bornes.
  it('au-dessus de 50, baisse normalement sans être ramené à 50 (comportement actuel)', () => {
    expect(afterOneNight(NORMAL, 5, 60)).toEqual({ sellIn: 4, quality: 59 });
  });

  // Hors spécification (« jamais négative ») : le code ne retire un point que
  // si la qualité est au-dessus de 0, mais ne la remonte jamais à 0. Même
  // raison d'être que le test précédent.
  it('avec une qualité négative, garde cette qualité (comportement actuel)', () => {
    expect(afterOneNight(NORMAL, 5, -5)).toEqual({ sellIn: 4, quality: -5 });
  });

  // Reprend l'idée du test d'exemple fourni par le kata. Le nom décide de la
  // règle appliquée : s'il changeait, l'article changerait de règle.
  it('garde son nom', () => {
    const [item] = new GildedRose([new Item(NORMAL, 10, 20)]).updateQuality();
    expect(item.name).toBe(NORMAL);
  });

  // La spécification demande qu'un article « Conjured » se dégrade deux fois
  // plus vite, mais le code ne le connaît pas encore : il le traite comme un
  // article normal. Ce test sera remplacé quand la fonctionnalité sera ajoutée.
  it('« Conjured » est pour l\'instant traité comme un article normal (comportement actuel)', () => {
    expect(afterOneNight(CONJURED, 3, 6)).toEqual({ sellIn: 2, quality: 5 });
  });
});

/**
 * Aged Brie : il se bonifie avec le temps.
 * Chaque nuit, le jour est décompté et la qualité gagne 1 point ; 2 points si,
 * après le décompte, les jours restants sont sous 0. Chaque point n'est ajouté
 * que si la qualité est encore sous 50. La spécification ne mentionne pas ce
 * doublement après la date.
 */
describe('Aged Brie', () => {
  it('gagne 1 point par nuit', () => {
    expect(afterOneNight(AGED_BRIE, 10, 20)).toEqual({ sellIn: 9, quality: 21 });
  });

  // Charnière : à sellIn 1, il reste 0 jour après le décompte, ce qui n'est pas
  // sous 0 : un seul point.
  it('gagne encore 1 seul point la veille de sa date (sellIn 1)', () => {
    expect(afterOneNight(AGED_BRIE, 1, 20)).toEqual({ sellIn: 0, quality: 21 });
  });

  // À sellIn 0, le décompte donne -1, sous 0 : le second point s'ajoute dès
  // cette nuit-là.
  it('gagne 2 points par nuit une fois sa date passée', () => {
    expect(afterOneNight(AGED_BRIE, 0, 20)).toEqual({ sellIn: -1, quality: 22 });
  });

  // Plafond : à 50, la qualité n'est plus sous 50 (quality < 50), donc aucun
  // point n'est ajouté.
  it('ne dépasse jamais 50', () => {
    expect(afterOneNight(AGED_BRIE, 10, 50)).toEqual({ sellIn: 9, quality: 50 });
  });

  // Le premier point amène la qualité à 50 ; le second n'est alors pas ajouté,
  // car la qualité n'est plus sous 50. Résultat : 50, pas 51.
  it('après sa date, à 49, ne gagne qu\'un point : le plafond de 50 bloque le second', () => {
    expect(afterOneNight(AGED_BRIE, 0, 49)).toEqual({ sellIn: -1, quality: 50 });
  });

  // Hors spécification : à 60, la qualité n'est pas sous 50, donc aucun point
  // n'est ajouté, et rien ne la ramène à 50. Absent de l'inventaire d'exemple : même
  // raison d'être que pour l'article normal.
  it('au-dessus de 50, garde sa qualité sans être ramené à 50 (comportement actuel)', () => {
    expect(afterOneNight(AGED_BRIE, 5, 60)).toEqual({ sellIn: 4, quality: 60 });
  });
});
