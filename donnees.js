window.VOYAGE = {
  theme: "shinkansen",
  titre: "Japon 2028",
  depart: "[date] 2028",

  gares: [
    {
      code: "00",
      bonus: true,
      kanji: "車庫",
      titre: "Les coulisses",
      lieu: "Avant le départ",
      tampon: "準備",
      autresJours: false,
      videos: [
        { id: "making-of", jour: "Making-of", titre: "Comment on a organisé le voyage",
          description: "[Description du making-of : comment le voyage a été préparé, les choix faits et ce qui vous attend.]",
          youtube: "", duree: "" }
      ]
    },
    {
      code: "01", ville: "tokyo",
      kanji: "東京", kanjiCourt: "東京",
      titre: "Arrivée à Tokyo",
      lieu: "Avion et première soirée",
      tampon: "着",
      autresJours: false,
      videos: [
        { id: "jp01-j1", jour: "Jour 1", titre: "Avion et première soirée à Tokyo",
          description: "[Description de la vidéo : quelques phrases pour raconter la journée.]",
          youtube: "", duree: "" }
      ]
    },
    {
      code: "02", ville: "kyoto",
      kanji: "京都", kanjiCourt: "京都",
      titre: "Kyōto",
      lieu: "[quartiers]",
      tampon: "京",
      autresJours: true,
      videos: [
        { id: "jp02-j1", jour: "Jour 1", titre: "Premier jour à Kyōto",
          description: "[Description de la vidéo.]", youtube: "", duree: "" }
      ]
    },
    {
      code: "03", ville: "tokyo",
      kanji: "渋谷・新宿", kanjiCourt: "渋谷",
      titre: "Shibuya et Shinjuku",
      lieu: "Shibuya, Shinjuku",
      tampon: "渋",
      autresJours: true,
      videos: [
        { id: "jp03-j1", jour: "Jour 1", titre: "[Titre de la vidéo]",
          description: "[Description de la vidéo.]", youtube: "", duree: "" }
      ]
    },
    {
      code: "04", ville: "mishima",
      kanji: "三島・富士山", kanjiCourt: "三島",
      titre: "Mishima et le Fuji",
      lieu: "Mishima, mont Fuji",
      tampon: "富",
      autresJours: false,
      videos: [
        { id: "jp04-j1", jour: "Jour 1", titre: "[Titre de la vidéo]",
          description: "[Description de la vidéo.]", youtube: "", duree: "" },
        { id: "jp04-j2", jour: "Jour 2", titre: "[Titre de la vidéo]",
          description: "[Description de la vidéo.]", youtube: "", duree: "" }
      ]
    },
    {
      code: "05", ville: "tokyo",
      kanji: "秋葉原・浅草", kanjiCourt: "浅草",
      titre: "Akihabara et Asakusa",
      lieu: "Akihabara, Asakusa",
      tampon: "浅",
      autresJours: true,
      videos: [
        { id: "jp05-j1", jour: "Jour 1", titre: "[Titre de la vidéo]",
          description: "[Description de la vidéo.]", youtube: "", duree: "" }
      ]
    }
  ]
};
