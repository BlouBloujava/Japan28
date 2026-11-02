
(function () {
  "use strict";

  var V = window.VOYAGE;
  var C = window.CARTE;
  document.documentElement.setAttribute("data-theme", V.theme || "shinkansen");

  /* ---------- Outils ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel) { return document.querySelector(sel); }

  var POS = { tokyo: [350, 414], kyoto: [219, 442], mishima: [324, 437] };
  var TRAJET = "M350 414 Q285 390 219 442 Q288 470 350 414 Q346 433 324 437 Q330 416 350 414";
  var TRAIN =
    '<g class="train" aria-hidden="true">' +
    '<path d="M-3.9 -1.9 L-7.4 -1.9 Q-10.9 -1.9 -11.9 0 Q-10.9 1.9 -7.4 1.9 L-3.9 1.9 Z" fill="#FFF" stroke="var(--encre)" stroke-width="0.4"/>' +
    '<rect x="-3.3" y="-1.9" width="5.8" height="3.8" fill="#FFF" stroke="var(--encre)" stroke-width="0.4"/>' +
    '<path d="M3.1 -1.9 L6.6 -1.9 Q10.1 -1.9 11.1 0 Q10.1 1.9 6.6 1.9 L3.1 1.9 Z" fill="#FFF" stroke="var(--encre)" stroke-width="0.4"/>' +
    '<rect x="-10.6" y="0.45" width="20.4" height="0.6" fill="var(--ligne)"/>' +
    '<path d="M8.2 -1.5 Q10 -1.3 10.6 -0.3 L8.2 -0.3 Z" fill="var(--encre)"/>' +
    '<path d="M-8.9 -1.5 Q-11.1 -1.3 -11.7 -0.3 L-8.9 -0.3 Z" fill="var(--encre)"/>' +
    [-7, -5.4, -2.6, -0.9, 0.8, 3.8, 5.4].map(function (x) {
      return '<rect x="' + x + '" y="-1.2" width="1.1" height="0.8" fill="var(--encre)"/>';
    }).join("") +
    "</g>";
  var PLAY = '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
  var HORLOGE = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  /* ---------- Données dérivées ---------- */
  var gares = V.gares;
  var ligne = gares.filter(function (g) { return !g.bonus; });
  var bonus = gares.filter(function (g) { return g.bonus; })[0];
  var toutes = [];
  gares.forEach(function (g) {
    g.videos.forEach(function (v) { v.gare = g; toutes.push(v); });
  });
  function publiee(v) { return !!(v.youtube && String(v.youtube).trim()); }
  function lien(v) { return "video.html?v=" + encodeURIComponent(v.id); }
  function nbPubliees(g) { return g.videos.filter(publiee).length; }
  function premiereVideo(g) { return g.videos.filter(publiee).slice(-1)[0] || g.videos[0]; }
  function resumeJours(g) {
    var n = g.videos.length;
    if (g.bonus) return "Vidéo bonus";
    if (g.autresJours) return n === 1 ? "Jour 1, autres jours à définir" : n + " jours, autres à définir";
    return n === 1 ? "1 jour" : n + " jours";
  }
  function miniature(v) { return "https://i.ytimg.com/vi/" + encodeURIComponent(String(v.youtube).trim()) + "/hqdefault.jpg"; }

  /* ---------- Ma liste (stockée dans le navigateur) ---------- */
  var CLE = "japon2028-ma-liste";
  function lireListe() {
    try { var l = JSON.parse(localStorage.getItem(CLE)); return Array.isArray(l) ? l : []; } catch (e) { return []; }
  }
  function ecrireListe(l) {
    try { localStorage.setItem(CLE, JSON.stringify(l)); } catch (e) { /* stockage indisponible */ }
    var c = document.getElementById("compteur-liste");
    if (c) c.textContent = l.length;
  }

  /* ---------- Morceaux réutilisables ---------- */
  function badge(code, taille, pointilles) {
    return '<span class="badge badge-' + taille + (pointilles ? " pointilles" : "") + '" aria-hidden="true"><span>JP</span><span>' + esc(code) + "</span></span>";
  }
  function tampon(v, taille, anime) {
    if (publiee(v)) {
      return '<span class="tampon plein tampon-' + taille + (anime ? " anime" : "") + '" aria-label="Tampon obtenu"><b>' + esc(v.gare.tampon) + "</b><small>" + esc(v.jour) + "</small></span>";
    }
    return '<span class="tampon vide tampon-' + taille + '" aria-label="Tampon à venir">à venir</span>';
  }
  function vignette(v, href) {
    var tag = href ? 'a href="' + href + '"' : "div";
    var fin = href ? "a" : "div";
    if (publiee(v)) {
      return "<" + tag + ' class="vignette en-ligne" aria-label="Regarder : ' + esc(v.titre) + '">' +
        '<img src="' + miniature(v) + '" alt="" loading="lazy">' +
        '<span class="lecture">' + PLAY + "</span>" +
        (v.duree ? '<span class="duree">' + esc(v.duree) + "</span>" : "") + "</" + fin + ">";
    }
    return "<" + tag + ' class="vignette a-venir">Vidéo en préparation</' + fin + ">";
  }
  function carteSVG(mini) {
    return '<svg viewBox="190 380 200 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<path class="terre" d="' + C.zoom + '"/>' +
      (mini ? "" : '<path class="ligne-fond" d="' + TRAJET + '"/>') +
      '<path class="trajet" d="' + TRAJET + '"/>' +
      (mini ? Object.keys(POS).map(function (k) {
        return '<circle cx="' + POS[k][0] + '" cy="' + POS[k][1] + '" r="2.4" fill="#FFF" stroke="var(--encre)" stroke-width="0.9"/>';
      }).join("") : "") +
      TRAIN + "</svg>";
  }

  function entete(page) {
    var cases = [
      ["index.html#carte", "Carte", "var(--c1)"],
      ["index.html#departs", "Départs", "var(--c2)"],
      ["index.html#videos", "Vidéos", "var(--c3)"],
      ["index.html#coulisses", "Coulisses", "var(--c4)"]
    ];
    return '<div class="barre"><div class="interne"><a href="#contenu">Aller au contenu</a><span>Site privé, réservé aux voyageurs et à leurs proches</span></div></div>' +
      '<header class="entete"><nav class="cadre" aria-label="Navigation principale">' +
      '<a class="logo" href="index.html">' + badge("28", "m") +
      '<span class="logo-texte"><strong>' + esc(V.titre).toUpperCase() + "</strong><span>La ligne du voyage</span></span></a>" +
      cases.map(function (c) {
        return '<a class="nav-case" href="' + c[0] + '" style="background:' + c[2] + '">' + c[1].toUpperCase() + "</a>";
      }).join("") +
      '<a class="nav-case" href="index.html#ma-liste" style="background:#FFF">MA LISTE <span class="compteur" id="compteur-liste" aria-label="vidéos dans ma liste">' + lireListe().length + "</span></a>" +
      "</nav></header>";
  }
  function pied() {
    return '<footer class="pied"><div class="interne">' +
      '<div><strong class="nom">' + esc(V.titre).toUpperCase() + "</strong>La ligne du voyage, gare après gare.</div>" +
      '<nav aria-label="Le voyage"><strong>Le voyage</strong><a href="index.html#carte">La carte</a><a href="index.html#departs">Tableau des départs</a><a href="index.html#videos">Les vidéos</a></nav>' +
      '<nav aria-label="Bonus"><strong>Bonus</strong><a href="index.html#coulisses">Les coulisses</a><a href="index.html#ma-liste">Ma liste</a></nav>' +
      '</div><div class="bas"><span>Site privé · merci de ne pas partager le lien</span><span class="kanji" aria-hidden="true">終点</span></div></footer>';
  }

  /* =====================================================================
     ACCUEIL
     ===================================================================== */
  function accueil() {
    $("#entete").innerHTML = entete("accueil");
    $("#pied").innerHTML = pied();

    /* Carte */
    var sel = 0;
    var carte = $("#carte-zone");
    carte.innerHTML = '<div class="carte">' + carteSVG(false) + '<div id="villes"></div></div>' +
      '<div class="encart" aria-hidden="true"><svg viewBox="0 0 560 614"><path class="terre" d="' + C.complet + '"/><rect x="190" y="380" width="200" height="100"/></svg></div>';

    function pct(p) { return "left:" + ((p[0] - 190) / 200 * 100).toFixed(2) + "%;top:" + ((p[1] - 380) / 100 * 100).toFixed(2) + "%"; }

    function choisirVille(ville) {
      var ids = [];
      ligne.forEach(function (g, i) { if (g.ville === ville) ids.push(i); });
      var k = ids.indexOf(sel);
      selectionner(k >= 0 ? ids[(k + 1) % ids.length] : ids[0]);
    }

    function rendreCarte() {
      var gSel = ligne[sel];
      var noms = { tokyo: "Tokyo", kyoto: "Kyōto", mishima: "Mishima" };
      $("#villes").innerHTML = Object.keys(POS).map(function (ville) {
        var actif = gSel.ville === ville;
        var premier = ligne.filter(function (g) { return g.ville === ville; })[0];
        var g = actif ? gSel : premier;
        var nb = ligne.filter(function (x) { return x.ville === ville; }).length;
        return '<button type="button" class="ville" data-ville="' + ville + '" aria-pressed="' + actif + '" style="' + pct(POS[ville]) + '" aria-label="' +
          noms[ville] + (nb > 1 ? ", " + nb + " gares, afficher la suivante" : ", afficher la gare") + '">' +
          badge(g.code, "s") + '<span class="nom">' + noms[ville] + "</span></button>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll(".ville"), function (b) {
        b.addEventListener("click", function () { choisirVille(b.getAttribute("data-ville")); });
      });

      var avant = sel === 0 ? "Départ" : "← " + ligne[sel - 1].titre;
      var apres = sel === ligne.length - 1 ? "Terminus" : ligne[sel + 1].titre + " →";
      var v = premiereVideo(gSel);
      $("#panneau-haut").innerHTML =
        '<div class="panneau" aria-live="polite"><div class="panneau-nom">' + badge(gSel.code, "m") +
        '<span><span class="kanji">' + esc(gSel.kanji) + "</span><strong>" + esc(gSel.titre) + "</strong></span></div>" +
        '<div class="panneau-bande"><span>' + esc(avant) + "</span><span>" + esc(apres) + "</span></div></div>" +
        vignette(v, lien(v)) +
        '<div class="puces">' + gSel.videos.map(function (x) {
          return '<a class="puce ' + (publiee(x) ? "publiee" : "prevue") + '" href="' + lien(x) + '">' + esc(x.jour) + "</a>";
        }).join("") + (gSel.autresJours ? '<span class="puce plus">+ jours à définir</span>' : "") + "</div>" +
        '<div class="actions"><button type="button" class="btn" id="gare-prec">← Gare précédente</button>' +
        '<button type="button" class="btn btn-jaune" id="gare-suiv">Gare suivante →</button></div>';
      $("#gare-prec").addEventListener("click", function () { selectionner((sel - 1 + ligne.length) % ligne.length); });
      $("#gare-suiv").addEventListener("click", function () { selectionner((sel + 1) % ligne.length); });

      $("#plan").innerHTML = ligne.map(function (g, i) {
        var n = nbPubliees(g);
        return '<li><button type="button" data-i="' + i + '" aria-pressed="' + (i === sel) + '">' +
          '<span class="rond' + (n ? "" : " pointilles") + '">' + esc(g.code) + "</span>" +
          '<span class="infos"><strong>' + esc(g.titre) + "</strong><span>" +
          (n ? (n === 1 ? "1 vidéo en ligne" : n + " vidéos en ligne") : "À venir") + "</span></span></button></li>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll("#plan button"), function (b) {
        b.addEventListener("click", function () { selectionner(+b.getAttribute("data-i")); });
      });
    }
    function selectionner(i) { sel = i; rendreCarte(); }
    rendreCarte();

    /* Coulisses */
    if (bonus) {
      var mv = bonus.videos[0];
      $("#coulisses-video").innerHTML = vignette(mv, lien(mv));
      $("#coulisses-texte").innerHTML =
        "<h3>" + esc(mv.titre) + "</h3><p>" + esc(mv.description) + "</p>" +
        '<div class="rayures fine" aria-hidden="true"></div>' +
        '<div class="ligne-tampon"><span class="tampon plein tampon-m"><b>' + esc(bonus.tampon) + "</b><small>Bonus</small></span>" +
        "<p>Hors étapes : cette vidéo se regarde avant de monter dans le train.</p></div>" +
        '<a class="btn btn-plein" href="' + lien(mv) + '" style="align-self:flex-start">Regarder le making-of</a>';
    }

    /* Tableau des départs */
    $("#departs-corps").innerHTML = ligne.map(function (g) {
      var n = nbPubliees(g);
      return "<tr>" +
        '<td class="code">JP' + esc(g.code) + "</td>" +
        '<td class="dest"><span class="kanji">' + esc(g.kanjiCourt || g.kanji) + "</span><strong>" + esc(g.titre) + "</strong></td>" +
        '<td class="jours doux">' + esc(resumeJours(g)) + "</td>" +
        '<td class="etat"><span class="statut"><span class="point' + (n ? " vivant" : "") + '" aria-hidden="true"></span>' +
        (n ? (n === 1 ? "1 vidéo en ligne" : n + " vidéos en ligne") : "À venir") + "</span></td>" +
        '<td class="voir"><a href="' + lien(premiereVideo(g)) + '">Voir<span class="sr"> ' + esc(g.titre) + "</span></a></td></tr>";
    }).join("");

    /* Billets */
    var total = toutes.filter(function (v) { return !v.gare.bonus && publiee(v); }).length;
    $("#compte-tampons").textContent = total === 0 ? "Aucun tampon pour l’instant : ils arrivent avec les vidéos" :
      (total === 1 ? "1 tampon dans le carnet" : total + " tampons dans le carnet");
    var pastels = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];
    $("#groupes").innerHTML = ligne.map(function (g, i) {
      return '<div class="groupe"><div class="groupe-tete" style="background:' + pastels[i % 5] + '">' +
        badge(g.code, "m") + '<span class="kanji">' + esc(g.kanjiCourt || g.kanji) + "</span><strong>" + esc(g.titre) + "</strong><span>" + esc(resumeJours(g)) + "</span></div>" +
        '<div class="billets">' + g.videos.map(function (v, k) {
          return '<a class="billet" href="' + lien(v) + '">' +
            '<span class="billet-tete"><span><span class="code">JP' + esc(g.code) + "</span> · " + esc(v.jour) + "</span><span>" + (publiee(v) ? "En ligne" : "À venir") + "</span></span>" +
            vignette(v, null) + '<span class="perfo" aria-hidden="true"></span>' +
            '<span class="billet-titre">' + esc(v.titre) + "</span>" + tampon(v, "m", true) + "</a>";
        }).join("") +
        (g.autresJours ? '<div class="billet-vide"><strong>Autres jours à définir</strong><span>Une vidéo s’ajoutera ici pour chaque jour passé dans cette étape.</span></div>' : "") +
        "</div></div>";
    }).join("");

    /* Ma liste */
    function rendreListe() {
      var ids = lireListe();
      var vids = toutes.filter(function (v) { return ids.indexOf(v.id) >= 0; });
      $("#ma-liste-contenu").innerHTML = vids.length
        ? '<div class="billets">' + vids.map(function (v) {
            return '<a class="billet" href="' + lien(v) + '"><span class="billet-tete"><span><span class="code">JP' + esc(v.gare.code) + "</span> · " + esc(v.jour) + "</span></span>" +
              vignette(v, null) + '<span class="perfo" aria-hidden="true"></span><span class="billet-titre">' + esc(v.titre) + "</span>" + tampon(v, "m", false) + "</a>";
          }).join("") + "</div>"
        : '<p class="liste-vide">Ta liste est vide. Sur la page d’une vidéo, touche « Ajouter à ma liste » pour la retrouver ici.</p>';
    }
    rendreListe();
  }

  /* =====================================================================
     PAGE VIDÉO
     ===================================================================== */
  function pageVideo() {
    $("#entete").innerHTML = entete("video");
    $("#pied").innerHTML = pied();

    var id = new URLSearchParams(location.search).get("v");
    var idx = toutes.findIndex(function (v) { return v.id === id; });
    if (idx < 0) idx = toutes.findIndex(function (v) { return !v.gare.bonus; });
    var v = toutes[idx];
    var g = v.gare;
    var gi = gares.indexOf(g);
    document.title = (g.bonus ? "Making-of" : "JP" + g.code + " " + g.titre + ", " + v.jour) + " · " + V.titre;

    /* Fil d’Ariane */
    $("#ariane").innerHTML = '<ol><li><a href="index.html">Accueil</a></li><li><a href="index.html#videos">Les vidéos</a></li>' +
      "<li>JP" + esc(g.code) + " · " + esc(g.titre) + '</li><li aria-current="page"><strong>' + esc(v.jour) + "</strong></li></ol>";

    /* Panneau de gare */
    var gPrec = gares[gi - 1], gSuiv = gares[gi + 1];
    $("#gare-nom").innerHTML =
      '<div class="gare-nom-haut">' + badge(g.code, "l", !!g.bonus) +
      '<div><p class="grand-kanji">' + esc(g.kanji) + "</p><h1>" + esc(g.titre) + "</h1></div></div>" +
      '<nav class="gare-bande" aria-label="Gares voisines">' +
      (gPrec ? '<a href="' + lien(gPrec.videos[0]) + '">← ' + esc(gPrec.titre) + "</a>" : "<span>Dépôt</span>") +
      (gSuiv ? '<a href="' + lien(gSuiv.videos[0]) + '">' + esc(gSuiv.titre) + " →</a>" : "<span>Terminus</span>") + "</nav>";

    var pastels = ["var(--c4)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];
    var dansListe = lireListe().indexOf(v.id) >= 0;
    var jours = $("#gare-jours");
    jours.style.background = pastels[gi % pastels.length];
    jours.innerHTML = "<strong>" + (g.bonus ? "Vidéo bonus" : "Les jours de cette étape") + "</strong>" +
      '<nav class="onglets" aria-label="Jours de l’étape">' + g.videos.map(function (x) {
        return '<a class="onglet' + (publiee(x) ? "" : " prevue") + '" href="' + lien(x) + '"' + (x === v ? ' aria-current="page"' : "") + ">" + esc(x.jour) + "</a>";
      }).join("") + (g.autresJours ? '<span class="puce plus">+ jours à définir</span>' : "") + "</nav>" +
      '<button type="button" class="btn favori" id="favori" aria-pressed="' + dansListe + '">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '<span id="favori-texte">' + (dansListe ? "Dans ma liste" : "Ajouter à ma liste") + "</span></button>";
    $("#favori").addEventListener("click", function () {
      var l = lireListe();
      var i = l.indexOf(v.id);
      if (i >= 0) l.splice(i, 1); else l.push(v.id);
      ecrireListe(l);
      var oui = i < 0;
      this.setAttribute("aria-pressed", oui);
      $("#favori-texte").textContent = oui ? "Dans ma liste" : "Ajouter à ma liste";
      this.classList.remove("pop"); void this.offsetWidth; if (oui) this.classList.add("pop");
    });

    /* Lecteur */
    var lecteur = $("#lecteur");
    if (publiee(v)) {
      var yt = String(v.youtube).trim();
      lecteur.className = "lecteur";
      lecteur.innerHTML = '<button type="button" aria-label="Lire la vidéo : ' + esc(v.titre) + '">' +
        '<img src="' + miniature(v) + '" alt="">' + '<span class="onde" aria-hidden="true"></span><span class="lecture">' + PLAY + "</span></button>" +
        (v.duree ? '<span class="duree">' + esc(v.duree) + "</span>" : "");
      lecteur.querySelector("button").addEventListener("click", function () {
        lecteur.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) +
          '?autoplay=1&rel=0&playsinline=1" title="' + esc(v.titre) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      });
    } else {
      lecteur.className = "lecteur a-venir";
      lecteur.innerHTML = HORLOGE + "<span>Vidéo en préparation · elle sera publiée au fil du voyage</span>";
    }
    $("#video-titre").textContent = v.titre;
    $("#video-description").textContent = v.description || "";

    /* Colonne */
    $("#tampon-jour").innerHTML = tampon(v, "l", true) +
      "<div><strong>" + (g.bonus ? "Tampon bonus" : "Tampon du jour") + "</strong><p>" +
      (publiee(v) ? "Ajouté au carnet à la publication de la vidéo." : "Il apparaîtra quand la vidéo sera publiée.") + "</p></div>";
    var mini = $("#mini-carte");
    mini.innerHTML = carteSVG(true);
    if (!g.bonus) {
      var p = POS[g.ville];
      mini.querySelector("svg").insertAdjacentHTML("beforeend",
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" fill="none" stroke="var(--encre)" stroke-width="1.6"/>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" fill="var(--ligne)" stroke="#FFF" stroke-width="1"/>');
    }
    $("#sur-ligne").innerHTML = "<strong>Sur la ligne</strong><span>" +
      (g.bonus ? "Hors ligne · vidéo bonus à regarder avant le départ" : "Gare " + (+g.code) + " sur " + ligne.length + " · " + esc(g.lieu)) +
      '</span><a href="index.html#carte">Voir toute la ligne</a>';

    /* Vidéo précédente / suivante */
    function etiquette(x) { return "JP" + x.gare.code + " · " + x.gare.titre + ", " + x.jour.toLowerCase(); }
    var prec = toutes[idx - 1], suiv = toutes[idx + 1];
    $("#voisines").innerHTML =
      '<a class="voisine prec" ' + (prec ? 'href="' + lien(prec) + '"' : 'aria-disabled="true"') + '><span class="fleche" aria-hidden="true">←</span><span><small>Vidéo précédente</small><strong>' +
      (prec ? esc(etiquette(prec)) : "Début de la ligne") + "</strong></span></a>" +
      '<a class="voisine suiv" ' + (suiv ? 'href="' + lien(suiv) + '"' : 'aria-disabled="true"') + '><span><small>Vidéo suivante</small><strong>' +
      (suiv ? esc(etiquette(suiv)) : "Terminus") + '</strong></span><span class="fleche" aria-hidden="true">→</span></a>';

    /* Toute la ligne */
    var pastelsFrise = ["var(--c4)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];
    $("#frise").innerHTML = toutes.map(function (x) {
      var gx = gares.indexOf(x.gare);
      return '<a class="mini-billet" href="' + lien(x) + '"' + (x === v ? ' aria-current="page"' : "") + ">" +
        '<span class="billet-tete" style="background:' + pastelsFrise[gx % 6] + '"><span class="code">JP' + esc(x.gare.code) + "</span><span>" + esc(x.jour) + "</span></span>" +
        '<span class="corps"><span class="kanji">' + esc(x.gare.kanjiCourt || x.gare.kanji) + "</span><strong>" + esc(x.gare.titre) + "</strong></span>" +
        tampon(x, "s", false) + "</a>";
    }).join("");
    var actif = document.querySelector('.mini-billet[aria-current="page"]');
    if (actif && actif.scrollIntoView) {
      var frise = document.querySelector(".frise");
      frise.scrollLeft = Math.max(0, actif.offsetLeft - 28);
    }
  }

  if (document.body.getAttribute("data-page") === "video") pageVideo(); else accueil();
})();
