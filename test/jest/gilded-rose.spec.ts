import { Item, GildedRose } from '@/gilded-rose';

/**
 * Tests unitaires, règle par règle.
 *
 * Sauf dans la partie « Inventaire », chaque test crée un seul article,
 * laisse passer une nuit et vérifie ses jours restants (sellIn) et sa
 * qualité (quality).
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
const BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert';
const SULFURAS = 'Sulfuras, Hand of Ragnaros';

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
});

/**
 * Article Conjured : la spécification dit qu'il « se dégrade deux fois plus
 * vite que les objets normaux ». Il perd donc 2 points par nuit, et 4 une fois
 * les jours restants passés sous 0 (après le décompte du jour) : le double des
 * 1 et 2 points d'un article normal. Chaque point n'est retiré que si la
 * qualité est encore au-dessus de 0.
 * Il est reconnu au début de son nom : la spécification parle d'un fournisseur
 * de produits invoqués, donc d'une famille d'articles, pas d'un seul nom.
 */
describe('Article Conjured', () => {
  it('perd 2 points par nuit', () => {
    expect(afterOneNight(CONJURED, 3, 6)).toEqual({ sellIn: 2, quality: 4 });
  });

  // Charnière, comme pour l'article normal : à sellIn 1, il reste 0 jour après
  // le décompte, ce qui n'est pas sous 0 : pas encore de doublement.
  it('perd encore 2 points, pas 4, la veille de sa date (sellIn 1)', () => {
    expect(afterOneNight(CONJURED, 1, 6)).toEqual({ sellIn: 0, quality: 4 });
  });

  it('perd 4 points par nuit une fois sa date passée', () => {
    expect(afterOneNight(CONJURED, 0, 10)).toEqual({ sellIn: -1, quality: 6 });
  });

  // Plancher : avec 1 point pour 2 à perdre, ou 3 pour 4, la qualité s'arrête
  // à 0 au lieu de passer en négatif.
  it('ne descend jamais sous 0', () => {
    expect(afterOneNight(CONJURED, 3, 1)).toEqual({ sellIn: 2, quality: 0 });
    expect(afterOneNight(CONJURED, 0, 3)).toEqual({ sellIn: -1, quality: 0 });
  });

  // Fige le choix de reconnaître Conjured au début du nom, et non au seul nom
  // de l'article d'exemple.
  it('reconnaît tout article dont le nom commence par « Conjured »', () => {
    expect(afterOneNight('Conjured Sword', 3, 6)).toEqual({ sellIn: 2, quality: 4 });
  });

  // Contre-exemple : seul le début du nom compte. Un nom qui contient
  // « Conjured » plus loin reste un article normal, avant comme après l'ajout
  // de la règle.
  it('un nom qui contient « Conjured » sans commencer par lui reste un article normal', () => {
    expect(afterOneNight('Elixir of the Conjured', 3, 6)).toEqual({ sellIn: 2, quality: 5 });
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
  it("après sa date, à 49, ne gagne qu'un point : le plafond de 50 bloque le second", () => {
    expect(afterOneNight(AGED_BRIE, 0, 49)).toEqual({ sellIn: -1, quality: 50 });
  });

  // Hors spécification : à 60, la qualité n'est pas sous 50, donc aucun point
  // n'est ajouté, et rien ne la ramène à 50. Absent de l'inventaire d'exemple : même
  // raison d'être que pour l'article normal.
  it('au-dessus de 50, garde sa qualité sans être ramené à 50 (comportement actuel)', () => {
    expect(afterOneNight(AGED_BRIE, 5, 60)).toEqual({ sellIn: 4, quality: 60 });
  });
});

/**
 * Billet de concert : sa valeur monte à l'approche du concert, puis tombe à 0.
 * Avant le décompte du jour : la qualité gagne 1 point, plus 1 point de bonus
 * à moins de 11 jours (sellIn < 11), plus 1 autre à moins de 6 jours
 * (sellIn < 6) ; chaque point n'est ajouté que si la qualité est encore sous
 * 50. Après le décompte, si les jours restants sont sous 0, la qualité tombe
 * à 0.
 * La spécification dit « 10 jours ou moins » et « 5 jours ou moins » : c'est
 * identique au code pour des nombres entiers de jours.
 * Les tests vont par paires, de part et d'autre de chaque seuil (11 et 10,
 * 6 et 5) : c'est là qu'une erreur d'un jour se cache.
 */
describe('Billet de concert (Backstage passes)', () => {
  // 11 n'est pas « moins de 11 » : pas de bonus.
  it('à 11 jours, gagne 1 point', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 11, 20)).toEqual({ sellIn: 10, quality: 21 });
  });

  // Premier jour du bonus sellIn < 11.
  it('à 10 jours, gagne 2 points', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 10, 20)).toEqual({ sellIn: 9, quality: 22 });
  });

  // 6 n'est pas « moins de 6 » : un seul bonus.
  it('à 6 jours, gagne encore 2 points', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 6, 20)).toEqual({ sellIn: 5, quality: 22 });
  });

  // Premier jour du second bonus sellIn < 6.
  it('à 5 jours, gagne 3 points', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 5, 20)).toEqual({ sellIn: 4, quality: 23 });
  });

  // Les bonus se calculent avant le décompte : à sellIn 1, les deux
  // s'appliquent. Après le décompte, il reste 0 jour, ce qui n'est pas sous 0 :
  // pas encore de chute.
  it('la veille du concert (sellIn 1), gagne encore 3 points', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 1, 20)).toEqual({ sellIn: 0, quality: 23 });
  });

  // La spécification dit seulement « après le concert ». Le code décompte le
  // jour avant de regarder la date : la chute a donc lieu dès la nuit où
  // sellIn passe de 0 à -1, et les 3 points gagnés juste avant sont perdus
  // avec le reste.
  it('tombe à 0 la nuit où sellIn passe de 0 à -1', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 0, 20)).toEqual({ sellIn: -1, quality: 0 });
  });

  // Après le concert, les bonus s'appliquent encore, puis la qualité est
  // remise à 0 : elle reste donc à 0.
  it('reste à 0 après le concert', () => {
    expect(afterOneNight(BACKSTAGE_PASS, -1, 0)).toEqual({ sellIn: -2, quality: 0 });
  });

  // Chaque point n'est ajouté que si la qualité est encore sous 50 : à 49,
  // seul le premier passe ; à 48 avec 3 points possibles, seuls les deux
  // premiers passent.
  it('ne dépasse jamais 50, même avec ses bonus', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 10, 49)).toEqual({ sellIn: 9, quality: 50 });
    expect(afterOneNight(BACKSTAGE_PASS, 5, 48)).toEqual({ sellIn: 4, quality: 50 });
  });

  // Hors spécification : à 60, la qualité n'est pas sous 50, donc aucun point
  // n'est ajouté, bonus compris, et rien ne la ramène à 50. Même raison d'être
  // que pour l'article normal.
  it('au-dessus de 50, garde sa qualité sans être ramené à 50 (comportement actuel)', () => {
    expect(afterOneNight(BACKSTAGE_PASS, 5, 60)).toEqual({ sellIn: 4, quality: 60 });
  });
});

/**
 * Sulfuras : objet légendaire, il ne change jamais, ni ses jours restants, ni
 * sa qualité.
 */
describe('Sulfuras', () => {
  it('ne change jamais : ni ses jours, ni sa qualité', () => {
    expect(afterOneNight(SULFURAS, 5, 80)).toEqual({ sellIn: 5, quality: 80 });
  });

  // Une fois la date passée, les autres articles suivent des règles en plus
  // (perte doublée, chute du billet) : Sulfuras ne doit en suivre aucune.
  it('ne change pas non plus après sa date', () => {
    expect(afterOneNight(SULFURAS, -1, 80)).toEqual({ sellIn: -1, quality: 80 });
  });
});

/**
 * Inventaire : la fonction traite toute une liste d'articles.
 */
describe('Inventaire', () => {
  // Vérifie que la boucle applique à chaque article sa propre règle, sans
  // mélange entre articles voisins.
  it('met à jour chaque article de la liste, selon sa propre règle', () => {
    const items = new GildedRose([
      new Item(NORMAL, 10, 20),
      new Item(AGED_BRIE, 10, 20),
    ]).updateQuality();
    expect(items.map(({ sellIn, quality }) => ({ sellIn, quality }))).toEqual([
      { sellIn: 9, quality: 19 },
      { sellIn: 9, quality: 21 },
    ]);
  });

  // new GildedRose() sans argument utilise une liste vide par défaut. C'est le
  // seul chemin du code que le golden master n'emprunte pas : sans ce test, la
  // couverture des branches tomberait sous 100 %.
  it('sans article, renvoie une liste vide', () => {
    expect(new GildedRose().updateQuality()).toEqual([]);
  });
});
