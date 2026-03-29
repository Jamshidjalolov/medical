import toothAnatomyDiagram from "../assets/tooth-anatomy-diagram.svg";
import ogizImage from "../rasm/ogiz.png";
import kallaImage from "../rasm/kalla.png";
import yuzImage from "../rasm/yuz.png";
import boyinImage from "../rasm/boyin.png";
import { createInternetImage, createItemImage, createTopicImage } from "../utils/imageFactory";

const optionOrders = [
  [0, 1, 2, 3],
  [1, 0, 3, 2],
  [2, 3, 0, 1],
  [3, 0, 1, 2]
];

function buildQuizQuestions(topicId, topicTitle, items) {
  return items.map((item, index) => {
    const distractorPool = items.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.title);
    const startIndex = distractorPool.length ? index % distractorPool.length : 0;
    const distractors = Array.from({ length: Math.min(3, distractorPool.length) }, (_, offset) => {
      return distractorPool[(startIndex + offset) % distractorPool.length];
    });

    const baseOptions = [item.title, ...distractors];
    while (baseOptions.length < 4) {
      baseOptions.push(item.title);
    }

    const options = optionOrders[index % optionOrders.length].map((orderIndex) => baseOptions[orderIndex]);

    return {
      id: `${topicId}-quiz-${index + 1}`,
      topicId,
      topicTitle,
      learningItemId: item.id,
      question: item.quizQuestion ?? `"${item.description}" ma'lumotiga mos atamani tanlang.`,
      options,
      correctAnswer: item.title
    };
  });
}

const topicBlueprints = [
  {
    id: "noun-five-declensions",
    title: "Otning 5 ta turlanishi",
    description: "Lotin tilidagi I, II, III, IV va V turlanishlarni qoidasi hamda tibbiy terminlar misolida o'rganing.",
    glyph: "5D",
    imageKeywords: ["latin grammar", "declension chart", "textbook"],
    palette: { from: "#E0F2FE", to: "#DBEAFE", highlight: "#BFDBFE", ink: "#0F172A" },
    items: [
      {
        title: "I turlanish",
        description: [
          "Qoidasi:",
          "Bosh kelishikda odatda -a, qaratqich kelishigida -ae qo'shimchasini oladi. Asosan jenskiy roddagi otlar kiradi.",
          "",
          "Misollar:",
          "ala, ae, f - qanot",
          "vena, ae, f - vena qon tomiri",
          "aorta, ae, f - shox tomir",
          "vertebra, ae, f - umurtqa",
          "arteria, ae, f - arteriya qon tomiri",
          "patella, ae, f - tizza qopqog'i",
          "concha, ae, f - chig'anoq",
          "sutura, ae, f - chok",
          "costa, ae, f - qovurg'a",
          "tuba, ae, f - nay, truba",
          "crista, ae, f - qirra",
          "bucca, ae, f - lunj",
          "lamina, ae, f - plastinka",
          "gingiva, ae, f - milk",
          "lingua, ae, f - til",
          "lingula, ae, f - tilcha",
          "orbita, ae, f - ko'z kosasi",
          "papilla, ae, f - so'rg'ich",
          "protuberantia, ae, f - bo'rtma",
          "corona, ae, f - toj",
          "aqua, ae, f - suv",
          "scapula, ae, f - kurak",
          "bursa, ae, f - xalta",
          "valvula, ae, f - qopqoq",
          "pleura, ae, f - parda",
          "vena portae - darvoza venasi",
          "maxilla, ae, f - yuqori jag'",
          "tibia, ae, f - katta boldir suyagi",
          "mandibula, ae, f - pastki jag'",
          "fibula, ae, f - kichik boldir suyagi",
          "spina, ae, f - qirra",
          "pulpa, ae, f - tish pulpasi",
          "incisura, ae, f - o'yma",
          "columna, ae, f - pog'ona",
          "cellula, ae, f - hujayra",
          "lacrima, ae, f - ko'z yoshi",
          "glandula, ae, f - bez",
          "ampulla, ae, f - ampula",
          "porta, ae, f - darvoza",
          "vita, ae, f - hayot",
          "cella, ae, f - hujayra",
          "urina, ae, f - siydik",
          "membrana, ae, f - parda",
          "tunica, ae, f - qobiq, parda",
          "lamella, ae, f - plastinka",
          "plica, ae, f - qatlam",
          "vesica, ae, f - pufak",
          "vagina, ae, f - qin",
          "linea, ae, f - chiziq",
          "fibra, ae, f - tola",
          "mucosa, ae, f - shilliq",
          "flexura, ae, f - egilish",
          "conjunctiva, ae, f - ko'z shilliq pardasi",
          "urethra, ae, f - siydik chiqarish kanali",
          "fissura, ae, f - yoriq, tirqish",
          "fovea, ae, f - chuqurcha"
        ].join("\n"),
        imageKeywords: ["latin grammar chart", "anatomy textbook", "medical terminology notes"],
        quizQuestion: "Bosh kelishikda -a, qaratqich kelishigida -ae qo'shimchasini oladigan jenskiy roddagi otlar qaysi turlanishga kiradi?"
      },
      {
        title: "II turlanish",
        description: [
          "Qoidasi:",
          "Bosh kelishikda mujskoy rodda -us, -er, sredniy rodda -um va ayrim hollarda -on qo'shimchalarini oladi. Qaratqich kelishigida -i qo'shimchasini oladi.",
          "",
          "Misollar:",
          "angulus, i, m - burchak",
          "digitus, i, m - barmoq",
          "tuberculum, i, n - do'mboqcha",
          "acromion, i, n - kurak o'simtasi",
          "brachium, i, n - yelka",
          "humerus, i, m - yelka suyagi",
          "cavum, i, n - bo'shliq",
          "manubrium, i, n - tutqich, dasta",
          "cranium, i, n - kalla suyagi",
          "radius, i, m - bilak suyagi",
          "ligamentum, i, n - boylam",
          "sternum, i, n - to'sh",
          "musculus, i, m - mushak",
          "alveolus, i, m - alveola, yacheyka",
          "septum, i, n - to'siq",
          "frenulum, i, n - yugan",
          "sulcus, i, m - egat",
          "tympanum, i, n - nog'ora parda",
          "labium, i, n - lab",
          "calcaneus, i, m - tovon suyagi",
          "oculus, i, m - ko'z",
          "bronchus, i, m - bronx",
          "nodus, i, m - tugun",
          "lobus, i, m - bo'lak",
          "nasus, i, m - burun",
          "dentinum, i, n - dentin",
          "enamelum, i, n - emal",
          "caninus, i, m - qoziq tish",
          "incisivus, i, m - kesuvchi tish",
          "palatum, i, n - tanglay",
          "cerebellum, i, n - miyacha",
          "nervus, i, m - asab",
          "cerebrum, i, n - bosh miya",
          "encephalon, i, n - bosh miya",
          "ganglion, i, n - nerv tuguni",
          "ostium, i, n - teshik",
          "collum, i, n - bo'yin",
          "dorsum, i, n - orqa",
          "decoctum, i, n - qaynatma",
          "globulus, i, m - sharcha",
          "aegrotus, i, m - bemor",
          "ilium, i, n - yonbosh suyagi",
          "organum, i, n - a'zo",
          "nitrogenium, i, n - azot",
          "aluminium, i, n - aluminiy",
          "ammonium, i, n - ammoniy",
          "medicamentum, i, n - dori",
          "sacrum, i, n - dumg'aza",
          "intestinum, i, n - ichak",
          "centrum, i, n - markaz",
          "bulbus, i, m - piyozcha",
          "truncus, i, m - tana, gavda",
          "rectum, i, n - to'g'ri ichak",
          "reticulum, i, n - to'r",
          "saccharum, i, n - shakar",
          "vitaminium, i, n - vitamin",
          "colon, i, n - yo'g'on ichak",
          "ventriculus, i, m - oshqozon",
          "duodenum, i, n - o'n ikki barmoq ichak",
          "anus, i, m - orqa kanal",
          "crassum, i, n - yo'g'on ichak",
          "oesophagus, i, m - qizilo'ngach",
          "jejunum, i, n - ingichka ichak",
          "peritonaeum, i, n - qorin bo'shlig'i",
          "ovarium, i, n - tuxumdon",
          "uterus, i, m - bachadon",
          "caecum, i, n - ko'richak",
          "gyrus, i, m - burma",
          "folium, i, n - barg"
        ].join("\n"),
        imageKeywords: ["latin language book", "medical latin lesson", "anatomy notes"],
        quizQuestion: "Bosh kelishikda -us, -er, -um bilan, qaratqich kelishigida esa -i bilan keladigan otlar qaysi turlanishga kiradi?"
      },
      {
        title: "III turlanish",
        description: [
          "Qoidasi:",
          "Bosh kelishikda turlicha qo'shimchalar bilan keladi, qaratqich kelishigida esa uchala rodda ham -is qo'shimchasini oladi.",
          "",
          "Misollar:",
          "flos, floris, m - gul",
          "corpus, oris, n - tana",
          "foramen, inis, n - teshik",
          "os, ossis, n - suyak",
          "crus, cruris, n - oyoq, oyoqcha",
          "pulmo, onis, m - o'pka",
          "caput, itis, n - bosh, boshcha",
          "cartilago, onis, f - tog'ay",
          "basis, is, f - asos",
          "abdomen, inis, n - qorin"
        ].join("\n"),
        imageKeywords: ["latin noun table", "grammar textbook", "medical terminology page"],
        quizQuestion: "Qaratqich kelishigida -is qo'shimchasini oladigan, bosh kelishikda esa turlicha tugaydigan otlar qaysi turlanishga kiradi?"
      },
      {
        title: "IV turlanish",
        description: [
          "Qoidasi:",
          "IV turlanishga mujskoy va sredniy roddagi otlar kiradi. Bosh kelishikda mujskoy rod -us, sredniy rod -u, qaratqich kelishigida esa -us qo'shimchasini oladi.",
          "",
          "Misollar:",
          "ductus, us, m - oqim",
          "genu, us, n - tizza",
          "arcus, us, m - yoy, ravoq",
          "processus, us, m - o'simta",
          "cornu, us, n - shox",
          "sinus, us, n - bo'shliq",
          "plexus, us, m - chigal",
          "textus, us, m - to'qima",
          "meatus, us, m - yo'l, yo'lak",
          "manus, us, n - qo'l",
          "recessus, us, m - chuqurlik, cho'ntak",
          "tractus, us, m - yo'l",
          "hiatus, us, m - yoriq",
          "gustus, us, m - ta'm",
          "abscessus, us, m - abstsess",
          "spiritus, us, m - spirt",
          "exitus, us, m - chiqish, yakun",
          "pulsus, us, m - tomir urishi"
        ].join("\n"),
        imageKeywords: ["latin declension notes", "medical latin chart", "school notebook"],
        quizQuestion: "Bosh kelishikda -us yoki -u, qaratqich kelishigida esa -us qo'shimchasini oladigan otlar qaysi turlanishga kiradi?"
      },
      {
        title: "V turlanish",
        description: [
          "Qoidasi:",
          "V turlanishga asosan jenskiy rod otlari kiradi. Bosh kelishikda -es, qaratqich kelishigida esa -ei qo'shimchasini oladi.",
          "",
          "Misollar:",
          "facies, ei, f - yuza",
          "superficies, ei, f - yuqori yuza",
          "dies, ei, f - kun",
          "caries, ei, f - kariyes",
          "rabies, ei, f - quturish",
          "scabies, ei, f - qichima",
          "species, ei, f - yig'ma"
        ].join("\n"),
        imageKeywords: ["latin textbook", "medical dictionary", "classical language study"],
        quizQuestion: "Bosh kelishikda -es, qaratqich kelishigida esa -ei qo'shimchasini oladigan otlar qaysi turlanishga kiradi?"
      }
    ]
  },
  {
    id: "noun-third-declension",
    title: "Otning 3-turlanishi",
    description: "Uchinchi turlanishdagi otlarni mujskoy, jenskiy, sredniy rod va istisno so'zlar asosida o'rganing.",
    glyph: "3D",
    imageKeywords: ["latin third declension", "grammar chart", "textbook"],
    palette: { from: "#EDE9FE", to: "#DDD6FE", highlight: "#C4B5FD", ink: "#312E81" },
    items: [
      {
        title: "Mujskoy rod",
        description: [
          "Qoidasi:",
          "III turlanishdagi mujskoy rod otlar bosh kelishikda turli shaklda keladi, qaratqich kelishigida esa odatda -is, -oris, -onis, -etis kabi ko'rinishlarga ega bo'ladi.",
          "",
          "Misollar:",
          "apex, icis, m - uchi (burun, til)",
          "cortex, icis, m - po'stloq, qobiq",
          "flos, oris, m - gul",
          "homo, inis, m - odam",
          "liquor, oris, m - orqa miya suyuqligi",
          "paries, etis, m - devor",
          "pulmo, onis, m - o'pka"
        ].join("\n"),
        imageKeywords: ["latin grammar chart", "school notes", "medical terminology chart"],
        quizQuestion: "Apex, cortex, flos, homo kabi otlar III turlanishning qaysi rodiga kiradi?"
      },
      {
        title: "Jenskiy rod",
        description: [
          "Qoidasi:",
          "III turlanishdagi jenskiy rod otlar ham qaratqich kelishigida -is, -onis, -atis, -idis va shunga o'xshash qo'shimchalarni oladi.",
          "",
          "Misollar:",
          "appendix, icis, f - o'simta",
          "carotis, tidis, f - uyqu arteriyasi",
          "articulatio, onis, f - bo'g'im",
          "auris, is, f - quloq",
          "basis, is, f - asos",
          "cavitas, atis, f - bo'shliq",
          "cervix, icis, f - bo'yin, bo'yincha",
          "cutis, is, f - teri",
          "frons, frontis, f - peshona",
          "gl. parotis, tidis, f - quloq oldi bezi",
          "meninx, ngis, f - miya pardasi",
          "pars, partis, f - qism",
          "radix, icis, f - ildiz",
          "pelvis, is, f - tos, chanoq",
          "pelvis renalis - buyrak jomchasi",
          "pyramis, idis, f - piramida",
          "region, onis, f - soha",
          "synchondrosis, is, f - sinxondroz",
          "symphysis, is, f - birikish",
          "tuberositas, atis, f - g'adir-budirlik",
          "bilis, is, f - o't, safro",
          "extremitas, atis, f - qo'l-oyoq uchi",
          "impressio, onis, f - botiqlik",
          "iris, idis, f - ko'zning kamalak pardasi",
          "lens, lentis, f - ko'z gavhari",
          "phalanx, ngis, f - panja suyagi",
          "pubes, is, f - qov, qov suyagi"
        ].join("\n"),
        imageKeywords: ["latin notebook", "language study", "anatomy notes"],
        quizQuestion: "Appendix, auris, basis, radix kabi otlar III turlanishning qaysi rodiga kiradi?"
      },
      {
        title: "Istisno so'zlar",
        description: [
          "Qoidasi:",
          "Quyidagi otlar III turlanishda istisno sifatida alohida yod olinadi. Ayrimlari mujskoy, ayrimlari esa sredniy rod bo'lib keladi.",
          "",
          "Misollar:",
          "axis, is, m - o'q, ikkinchi bo'yin umurtqasi",
          "canalis, is, m - kanal",
          "dens, dentis, m - tish",
          "margo, inis, m - chet",
          "sanguis, inis, m - qon",
          "tendo, inis, m - pay",
          "pancreas, atis, n - me'da osti bezi",
          "vas, vasis, n - tomir",
          "coccyx, ygis, m - dum",
          "fornix, icis, m - gumbaz",
          "larynx, ngis, m - hiqildoq",
          "pharynx, ngis, m - halqum",
          "thorax, acis, m - ko'krak qafasi"
        ].join("\n"),
        imageKeywords: ["latin declension table", "grammar lesson", "medical latin vocabulary"],
        quizQuestion: "Axis, dens, thorax, larynx kabi alohida yod olinadigan otlar III turlanishda qanday guruhga kiradi?"
      },
      {
        title: "Sredniy rod",
        description: [
          "Qoidasi:",
          "III turlanishdagi sredniy rod otlar bosh kelishikda turli shaklda bo'ladi, qaratqich kelishigida esa odatda -inis, -oris, -atis, -eris, -aris kabi qo'shimchalarni oladi.",
          "",
          "Misollar:",
          "abdomen, inis, n - qorin",
          "caput, itis, n - bosh",
          "corpus, oris, n - tana",
          "diaphragma, atis, n - diafragma",
          "foramen, inis, n - teshik",
          "neoplasma, atis, n - neoplazma",
          "hepar, atis, n - jigar",
          "occiput, itis, n - ensa",
          "pectus, oris, n - ko'krak",
          "sinciput, itis, n - boshning old qismi",
          "stroma, atis, n - tayanch",
          "tempus, oris, n - chakka",
          "tegmen, inis, n - qopqoq",
          "zygoma, atis, n - yonoq",
          "viscus, eris, n - ichki organlar",
          "chiasma, atis, n - kesishma",
          "femur, oris, n - son",
          "glomus, eris, n - to'pcha",
          "systema, atis, n - tizim",
          "coma, atis, n - koma",
          "crus, cruris, n - oyoqcha",
          "thenar, aris, n - thenar",
          "calcar, aris, n - tovon tirnog'i, shpora",
          "sal, salis, n - tuz",
          "animal, alis, n - hayvon",
          "rete, retis, n - to'r"
        ].join("\n"),
        imageKeywords: ["latin chart", "study table", "medical anatomy terms"],
        quizQuestion: "Abdomen, corpus, foramen, rete kabi otlar III turlanishning qaysi rodiga kiradi?"
      },
      {
        title: "Sredniy rod istisnolari",
        description: [
          "Qoidasi:",
          "Quyidagi otlar shaklan III turlanishga mansub bo'lsa ham, jinsini alohida eslab qolish kerak bo'lgan istisno so'zlardir.",
          "",
          "Misollar:",
          "ren, renis, m - buyrak",
          "lien, lienis, m - taloq"
        ].join("\n"),
        imageKeywords: ["latin grammar page", "lecture notes", "medical dictionary"],
        quizQuestion: "Ren va lien kabi alohida eslab qolinadigan otlar III turlanishda qaysi guruhga kiradi?"
      }
    ]
  },
  {
    id: "adjective-groups",
    title: "Sifatning 1 va 2 guruhlari",
    description: "I va II guruh sifatlarini leksik minimum, qoida va tibbiy misollar bilan o'rganing.",
    glyph: "SF",
    imageKeywords: ["latin adjectives", "grammar book", "study notes"],
    palette: { from: "#FEF3C7", to: "#FED7AA", highlight: "#FDE68A", ink: "#7C2D12" },
    items: [
      {
        title: "I guruh sifatlari",
        description: [
          "Qoidasi:",
          "I guruh sifatlari odatda -us, -a, -um shaklida keladi. Ayrimlari -er, -a, -um yoki -ter, -tra, -trum ko'rinishida ham uchraydi.",
          "",
          "Misollar:",
          "cavus, a, um - bo'sh, kovak",
          "cutaneus, a, um - teriga oid",
          "ischiadicus, a, um - quymichga oid",
          "latus, a, um - keng",
          "profundus, a, um - chuqur",
          "mastoideus, a, um - so'rg'ichsimon",
          "hyoideus, a, um - til osti suyagiga oid",
          "caninus, a, um - katta oziq tishga oid",
          "hypoglossus, a, um - til osti nerviga oid",
          "submucosus, a, um - shilliq parda osti",
          "geniohyoideus, a, um - iyak-til osti",
          "stylohyoideus, a, um - bigizsimon-til osti",
          "stylopharyngeus, a, um - halqumga oid",
          "infrahyoideus, a, um - til osti ostidagi",
          "serotinus, a, um - kechki, aql",
          "palatinus, a, um - tanglayga oid"
        ].join("\n"),
        imageKeywords: ["latin grammar", "adjective table", "medical terminology notes"],
        quizQuestion: "Cavus, cutaneus, ischiadicus kabi -us, -a, -um shaklidagi sifatlar qaysi guruhga kiradi?"
      },
      {
        title: "I guruh rang va belgi sifatlari",
        description: [
          "Qoidasi:",
          "I guruhda rang, o'lcham, sifat va umumiy belgini ifodalovchi ko'plab sifatlar uchraydi.",
          "",
          "Misollar:",
          "albus, a, um - oq",
          "niger, gra, grum - qora",
          "flavus, a, um - sariq",
          "ruber, bra, brum - qizil",
          "longus, a, um - uzun",
          "magnus, a, um - katta",
          "parvus, a, um - kichik",
          "altus, a, um - baland",
          "durus, a, um - qattiq",
          "calidus, a, um - issiq",
          "frigidus, a, um - sovuq",
          "rectus, a, um - to'g'ri",
          "bonus, a, um - yaxshi",
          "malus, a, um - yomon",
          "purus, a, um - toza",
          "rotundus, a, um - yumaloq",
          "coeruleus, a, um - ko'k",
          "cinereus, a, um - kul rang",
          "amarus, a, um - achchiq",
          "acutus, a, um - o'tkir"
        ].join("\n"),
        imageKeywords: ["latin adjective chart", "study book", "color theory notes"],
        quizQuestion: "Albus, niger, flavus, ruber kabi rang va belgi bildiruvchi sifatlar qaysi guruhga mansub?"
      },
      {
        title: "I guruh anatomik sifatlar",
        description: [
          "Qoidasi:",
          "I guruh sifatlar ichida anatomiya va tibbiyotda ko'p ishlatiladigan yo'nalish va tuzilma bildiruvchi sifatlar ham bor.",
          "",
          "Misollar:",
          "laryngeus, a, um - hiqildoqqa oid",
          "pharyngeus, a, um - halqumga oid",
          "oesophageus, a, um - qizilo'ngachga oid",
          "dexter, tra, trum - o'ng",
          "sinister, tra, trum - chap",
          "obliquus, a, um - qiyshiq, egri",
          "osseus, a, um - suyakka oid",
          "palatinus, a, um - tanglayga oid",
          "thoracicus, a, um - ko'krakka oid",
          "thyreoideus, a, um - qalqonsimon",
          "transversus, a, um - ko'ndalang",
          "durus, a, um - qattiq",
          "niger, gra, grum - qora"
        ].join("\n"),
        imageKeywords: ["latin textbook", "anatomy terminology", "language notes"],
        quizQuestion: "Laryngeus, thoracicus, thyreoideus kabi anatomiya terminlarida uchraydigan sifatlar ko'proq qaysi guruhga kiradi?"
      },
      {
        title: "II guruh sifatlari",
        description: [
          "Qoidasi:",
          "II guruh sifatlari ko'proq III turlanishga yaqin tuslanadi. Ko'pchiligi -is, -e yoki -alis, -e hamda -aris, -e shaklida keladi.",
          "",
          "Misollar:",
          "auricularis, e - quloqqa oid",
          "lacrimalis, e - ko'z yoshiga oid",
          "dorsalis, e - orqaga oid",
          "lingualis, e - tilga oid",
          "facialis, e - yuzaga oid",
          "ventralis, e - oldingi",
          "superficialis, e - yuzaki",
          "proximalis, e - tanaga yaqin",
          "distalis, e - tanadan uzoq",
          "horizontalis, e - gorizontal, eniga",
          "lumbalis, e - belga oid",
          "nasalis, e - burunga oid",
          "temporalis, e - chakkaga oid",
          "occipitalis, e - ensaga oid",
          "maxillaris, e - yuqori jag'ga oid",
          "mandibularis, e - pastki jag'ga oid",
          "intestinalis, e - ichakka oid",
          "tenuis, e - ingichka",
          "vaginalis, e - qinga oid",
          "brevis, e - qisqa",
          "mollis, e - yumshoq",
          "cranialis, e - kallaga oid",
          "dentalis, e - tishga oid",
          "cardialis, e - yurakka oid",
          "pulmonalis, e - o'pkaga oid",
          "renalis, e - buyrakka oid",
          "abdominalis, e - qoringa oid",
          "brachialis, e - yelkaga oid",
          "humeralis, e - yelka suyagiga oid",
          "radialis, e - bilakka oid",
          "ulnaris, e - tirsakka oid"
        ].join("\n"),
        imageKeywords: ["latin adjective", "medical latin list", "book page"],
        quizQuestion: "Auricularis, dorsalis, facialis, dentalis kabi -is, -e shaklidagi sifatlar qaysi guruhga kiradi?"
      },
      {
        title: "II guruh maxsus shakllari",
        description: [
          "Qoidasi:",
          "II guruhda ayrim sifatlar nominativda maxsus ko'rinishda keladi va lug'atda genitiv shakli orqali yodlanadi.",
          "",
          "Misollar:",
          "simplex, icis - oddiy",
          "triceps, itis - uch boshli",
          "teres, es - aylana",
          "biceps, itis - ikki boshli",
          "quadriceps, itis - to'rt boshli",
          "alaris, e - qanotga oid",
          "cerebralis, e - miyaga oid",
          "cervicalis, e - bo'yinga tegishli",
          "frontalis, e - peshonaga oid",
          "mandibularis, e - pastki jag'ga oid",
          "nasalis, e - burunga oid",
          "occipitalis, e - ensaga oid",
          "orbitalis, e - ko'z kosasiga oid",
          "buccalis, e - lunjga oid",
          "dentalis, e - tishga oid",
          "mentalis, e - iyakka oid"
        ].join("\n"),
        imageKeywords: ["latin grammar table", "school study", "anatomy adjective chart"],
        quizQuestion: "Simplex, triceps, biceps, quadriceps kabi maxsus shakldagi sifatlar qaysi guruhda o'rganiladi?"
      }
    ]
  },
  {
    id: "tooth-anatomy",
    title: "Tish anatomiyasi va qavatlari",
    description: "Tishning lotincha anatomik atamalari, qavatlari, ildiz tuzilmalari va tish turlarini o'rganing.",
    glyph: "TA",
    image: toothAnatomyDiagram,
    fallbackImage: toothAnatomyDiagram,
    imageKeywords: ["tooth anatomy", "dental anatomy", "tooth layers"],
    palette: { from: "#DCFCE7", to: "#BFDBFE", highlight: "#FDE68A", ink: "#14532D" },
    items: [
      {
        title: "Tishning asosiy qismlari",
        description: [
          "Asosiy atamalar:",
          "dens - tish",
          "corona dentis - tish toji",
          "cervix dentis - tish bo'yni",
          "radix dentis - tish ildizi"
        ].join("\n"),
        imageKeywords: ["tooth crown anatomy"],
        quizQuestion: "Dens, corona dentis, cervix dentis va radix dentis qaysi bo'limda berilgan?"
      },
      {
        title: "Tishning ichki qavatlari",
        description: [
          "Asosiy atamalar:",
          "pulpa dentis - tish pulpasi",
          "dentinum - dentin",
          "enamelum - emal",
          "cementum - sement qavati"
        ].join("\n"),
        imageKeywords: ["tooth enamel anatomy"],
        quizQuestion: "Pulpa dentis, dentinum, enamelum va cementum qaysi bo'limda berilgan?"
      },
      {
        title: "Ildiz tuzilmalari",
        description: [
          "Asosiy atamalar:",
          "apex radicis - ildiz uchi",
          "canalis radicis - ildiz kanali"
        ].join("\n"),
        imageKeywords: ["tooth root anatomy"],
        quizQuestion: "Apex radicis va canalis radicis qaysi bo'limda berilgan?"
      },
      {
        title: "Yordamchi tuzilmalar",
        description: [
          "Asosiy atamalar:",
          "ligamentum periodontale - periodont boylami",
          "gingiva - milk",
          "nervus - nerv"
        ].join("\n"),
        imageKeywords: ["periodontal ligament gingiva"],
        quizQuestion: "Ligamentum periodontale, gingiva va nervus qaysi bo'limda berilgan?"
      },
      {
        title: "Tish turlari",
        description: [
          "Tish turlari va tuzilmalari:",
          "dens incisivus - kurak tish",
          "dens caninus - qoziq tish",
          "dens premolaris - kichik oziq tish",
          "dens molaris - katta oziq tish",
          "dens deciduus - sut tishi",
          "dens permanens - doimiy tish",
          "dens serotinus - kech chiqadigan tish, aql tish",
          "arcus dentalis - tish yoyi",
          "dens molaris tertius - uchinchi molyar tish, aql tish"
        ].join("\n"),
        imageKeywords: ["wisdom tooth dental arch"],
        quizQuestion: "Dens incisivus, dens caninus, dens premolaris, dens molaris va boshqa tish turlari qaysi bo'limda berilgan?"
      }
    ]
  },
  {
    id: "oral-cavity",
    title: "Og'iz bo'shlig'i",
    description: "Og'iz bo'shlig'ining lotincha anatomik atamalari va asosiy tuzilmalarini bo'limlar asosida o'rganing.",
    glyph: "OB",
    image: ogizImage,
    fallbackImage: ogizImage,
    imageKeywords: ["oral cavity anatomy", "mouth anatomy", "dentistry"],
    palette: { from: "#FEE2E2", to: "#FBCFE8", highlight: "#FDE68A", ink: "#7F1D1D" },
    items: [
      {
        title: "Og'iz bo'shlig'ining asosiy atamalari",
        description: [
          "Asosiy atamalar:",
          "cavitas oris - og'iz bo'shlig'i",
          "gingiva - milk",
          "alveolus dentis - tish katagi, alveolasi"
        ].join("\n"),
        imageKeywords: ["oral cavity anatomy"],
        quizQuestion: "Cavitas oris, gingiva va alveolus dentis qaysi bo'limda berilgan?"
      },
      {
        title: "Tanglay tuzilmalari",
        description: [
          "Asosiy atamalar:",
          "palatum - tanglay",
          "palatum durum - qattiq tanglay",
          "palatum molle - yumshoq tanglay",
          "uvula - tilcha"
        ].join("\n"),
        imageKeywords: ["hard soft palate anatomy"],
        quizQuestion: "Palatum, palatum durum, palatum molle va uvula qaysi bo'limda berilgan?"
      },
      {
        title: "Til, lab va lunj",
        description: [
          "Asosiy atamalar:",
          "lingua - til",
          "labium - lab",
          "labium superius - yuqori lab",
          "labium inferius - pastki lab",
          "bucca - lunj"
        ].join("\n"),
        imageKeywords: ["tongue lips cheeks anatomy"],
        quizQuestion: "Lingua, labium, labium superius, labium inferius va bucca qaysi bo'limda berilgan?"
      },
      {
        title: "Jag' suyaklari va bo'g'im",
        description: [
          "Asosiy atamalar:",
          "mandibula - pastki jag'",
          "maxilla - yuqori jag'",
          "articulatio temporomandibularis - chakka-pastki jag' bo'g'imi"
        ].join("\n"),
        imageKeywords: ["mandible maxilla tmj anatomy"],
        quizQuestion: "Mandibula, maxilla va articulatio temporomandibularis qaysi bo'limda berilgan?"
      },
      {
        title: "Qo'shimcha tuzilmalar",
        description: [
          "Asosiy atamalar:",
          "tonsilla - bodomcha bez"
        ].join("\n"),
        imageKeywords: ["tonsil anatomy mouth"],
        quizQuestion: "Tonsilla atamasi qaysi bo'limda berilgan?"
      }
    ]
  },
  {
    id: "skull-bones",
    title: "Kalla suyagi",
    description: "Kalla suyaklari, yuz suyaklari va kalla choklarini lotincha atamalar bilan o'rganing.",
    glyph: "KS",
    image: kallaImage,
    fallbackImage: kallaImage,
    imageKeywords: ["skull anatomy", "human skull bones", "cranium"],
    palette: { from: "#E2E8F0", to: "#CBD5E1", highlight: "#BFDBFE", ink: "#1E293B" },
    items: [
      {
        title: "Neurocranium",
        description: [
          "Kalla suyaklari, Ossa cranii:",
          "os frontale - peshona suyagi",
          "os parietale - tepa suyagi",
          "os temporale - chakka suyagi",
          "os occipitale - ensa suyagi",
          "os sphenoidale - ponasimon suyagi",
          "os ethmoidale - g'alvirsimon suyagi",
          "processus styloideus - bigizsimon o'siq"
        ].join("\n"),
        imageKeywords: ["neurocranium skull anatomy"],
        quizQuestion: "Os frontale, os parietale, os temporale va boshqa kalla suyaklari qaysi bo'limda berilgan?"
      },
      {
        title: "Viscerocranium",
        description: [
          "Yuz suyaklari, Ossa faciei:",
          "maxilla - yuqori jag' suyagi",
          "mandibula - pastki jag' suyagi",
          "os zygomaticum - yonoq suyagi",
          "os nasale - burun suyagi",
          "os lacrimale - ko'z yosh suyagi",
          "os palatinum - tanglay suyagi",
          "concha nasalis inferior - pastki burun chig'anog'i",
          "vomer - dimog' suyagi",
          "os hyoideum - til osti suyagi"
        ].join("\n"),
        imageKeywords: ["viscerocranium facial bones"],
        quizQuestion: "Maxilla, mandibula, os zygomaticum va boshqa yuz suyaklari qaysi bo'limda berilgan?"
      },
      {
        title: "Kalla choklari I",
        description: [
          "Kalla choklari:",
          "sutura parietomastoidea - tepa so'rg'ichsimon chok",
          "sutura occipitomastoidea - ensa so'rg'ichsimon chok",
          "sutura temporozygomatica - chakka-yonoq choki"
        ].join("\n"),
        imageKeywords: ["cranial sutures anatomy"],
        quizQuestion: "Sutura parietomastoidea, sutura occipitomastoidea va sutura temporozygomatica qaysi bo'limda berilgan?"
      },
      {
        title: "Kalla choklari II",
        description: [
          "Kalla choklari:",
          "sutura zygomaticomaxillaris - yonoq-yuqori jag' choki",
          "sutura coronalis - tojsimon chok",
          "sutura frontozygomatica - peshona-yonoq choki"
        ].join("\n"),
        imageKeywords: ["facial skull sutures"],
        quizQuestion: "Sutura zygomaticomaxillaris, sutura coronalis va sutura frontozygomatica qaysi bo'limda berilgan?"
      },
      {
        title: "Kalla choklari III",
        description: [
          "Kalla choklari:",
          "sutura sphenofrontalis - ponasimon peshona choki",
          "sutura ethmoidolacrimalis - g'alvirsimon ko'zyosh choki",
          "sutura sphenoparietalis - ponasimon tepa choki"
        ].join("\n"),
        imageKeywords: ["sphenoid frontal sutures skull"],
        quizQuestion: "Sutura sphenofrontalis, sutura ethmoidolacrimalis va sutura sphenoparietalis qaysi bo'limda berilgan?"
      }
    ]
  },
  {
    id: "dental-formula",
    title: "Yuz mushaklari",
    description: "Yuz mimika mushaklarini lotincha nomlari va o'zbekcha ma'nolari bilan bo'limlar asosida o'rganing.",
    glyph: "YM",
    image: yuzImage,
    fallbackImage: yuzImage,
    imageKeywords: ["facial muscles anatomy", "face muscles", "mimic muscles"],
    palette: { from: "#FCE7F3", to: "#E0E7FF", highlight: "#FBCFE8", ink: "#312E81" },
    items: [
      {
        title: "Peshona va ko'z atrof mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. occipitofrontalis - peshona-ensa mushagi",
          "M. orbicularis oculi - ko'z atrofidagi halqasimon mushak",
          "M. corrugator supercilii - qoshni tirishtiruvchi mushak"
        ].join("\n"),
        imageKeywords: ["forehead eye muscles anatomy"],
        quizQuestion: "M. occipitofrontalis, M. orbicularis oculi va M. corrugator supercilii qaysi bo'limda berilgan?"
      },
      {
        title: "Burun va yuqori lab mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. procerus - burun usti mushagi",
          "M. nasalis - burun mushagi",
          "M. levator labii superioris - yuqori labni ko'taruvchi mushak",
          "M. levator labii superioris alaeque nasi - yuqori lab va burun qanotini ko'taruvchi mushak"
        ].join("\n"),
        imageKeywords: ["nose upper lip muscles anatomy"],
        quizQuestion: "M. procerus, M. nasalis va yuqori labga oid mushaklar qaysi bo'limda berilgan?"
      },
      {
        title: "Yonoq va kulgi mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. zygomaticus major - katta yonoq mushagi",
          "M. zygomaticus minor - kichik yonoq mushagi",
          "M. risorius - kulgich mushagi",
          "M. buccinator - lunj mushagi"
        ].join("\n"),
        imageKeywords: ["zygomatic risorius buccinator muscles"],
        quizQuestion: "M. zygomaticus major, M. zygomaticus minor, M. risorius va M. buccinator qaysi bo'limda berilgan?"
      },
      {
        title: "Og'iz va pastki lab mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. orbicularis oris - og'iz atrofidagi halqasimon mushak",
          "M. depressor anguli oris - og'iz burchagini tushiruvchi mushak",
          "M. depressor labii inferioris - pastki labni tushiruvchi mushak"
        ].join("\n"),
        imageKeywords: ["mouth lower lip muscles anatomy"],
        quizQuestion: "M. orbicularis oris, M. depressor anguli oris va M. depressor labii inferioris qaysi bo'limda berilgan?"
      },
      {
        title: "Iyak va bo'yin mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. mentalis - iyak mushagi",
          "Platysma - bo'yinning teri osti mushagi, yuz mimikasida ham qatnashadi"
        ].join("\n"),
        imageKeywords: ["chin platysma muscles anatomy"],
        quizQuestion: "M. mentalis va Platysma qaysi bo'limda berilgan?"
      }
    ]
  },
  {
    id: "tooth-surfaces",
    title: "Bo'yin mushaklari",
    description: "Bo'yin mushaklarini lotincha nomlari va o'zbekcha ma'nolari bilan bo'limlar asosida o'rganing.",
    glyph: "BM",
    image: boyinImage,
    fallbackImage: boyinImage,
    imageKeywords: ["neck muscles anatomy", "hyoid muscles", "cervical muscles"],
    palette: { from: "#E0F2FE", to: "#E0E7FF", highlight: "#BFDBFE", ink: "#1E3A8A" },
    items: [
      {
        title: "Yonoq va kulgi mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. zygomaticus major - katta yonoq mushagi",
          "M. risorius - kulgich mushagi"
        ].join("\n"),
        imageKeywords: ["zygomaticus risorius facial muscles"],
        quizQuestion: "M. zygomaticus major va M. risorius qaysi bo'limda berilgan?"
      },
      {
        title: "Digastrik mushak qismlari",
        description: [
          "Asosiy atamalar:",
          "M. digastricus, venter anterior - ikki qorinchali mushakning oldingi qismi",
          "M. digastricus, venter posterior - ikki qorinchali mushakning orqa qismi"
        ].join("\n"),
        imageKeywords: ["digastric muscle anatomy"],
        quizQuestion: "M. digastricusning oldingi va orqa qismi qaysi bo'limda berilgan?"
      },
      {
        title: "Tilosti mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. mylohyoideus - pastki jag'-tilosti mushagi",
          "M. stylohyoideus - bigizsimon-tilosti mushagi",
          "M. sternohyoideus - to'sh-tilosti mushagi",
          "M. omohyoideus, venter superior - kurak-tilosti mushagi, yuqori qorin qismi"
        ].join("\n"),
        imageKeywords: ["hyoid muscles anatomy"],
        quizQuestion: "M. mylohyoideus, M. stylohyoideus, M. sternohyoideus va M. omohyoideus qaysi bo'limda berilgan?"
      },
      {
        title: "Asosiy bo'yin mushaklari",
        description: [
          "Asosiy atamalar:",
          "M. masseter - chaynov mushagi",
          "M. sternocleidomastoideus - to'sh-o'mrov-so'rg'ichsimon mushak",
          "M. trapezius - trapetsiyasimon mushak"
        ].join("\n"),
        imageKeywords: ["masseter sternocleidomastoid trapezius anatomy"],
        quizQuestion: "M. masseter, M. sternocleidomastoideus va M. trapezius qaysi bo'limda berilgan?"
      },
      {
        title: "Teri osti va hiqildoq mushaklari",
        description: [
          "Asosiy atamalar:",
          "Platysma - bo'yinning teri osti mushagi",
          "M. cricothyroideus - tumshuqsimon-qalqonsimon tog'ay mushagi"
        ].join("\n"),
        imageKeywords: ["platysma cricothyroid muscle anatomy"],
        quizQuestion: "Platysma va M. cricothyroideus qaysi bo'limda berilgan?"
      }
    ]
  }
];

export const topics = topicBlueprints.map((topic, topicIndex) => {
  const learnItems = topic.items.map((item, itemIndex) => ({
    id: `${topic.id}-item-${itemIndex + 1}`,
    title: item.title,
    description: item.description,
    quizQuestion: item.quizQuestion,
    image:
      item.image ??
      createInternetImage({
        width: 880,
        height: 620,
        keywords: item.imageKeywords,
        lock: (topicIndex + 1) * 100 + itemIndex + 1
      }),
    fallbackImage:
      item.fallbackImage ??
      createItemImage({
        title: item.title,
        subtitle: topic.title,
        palette: topic.palette,
        glyph: String(itemIndex + 1).padStart(2, "0")
      })
  }));

  return {
    id: topic.id,
    title: topic.title,
    glyph: topic.glyph,
    description: topic.description,
    image:
      topic.image ??
      createInternetImage({
        width: 1280,
        height: 860,
        keywords: topic.imageKeywords,
        lock: topicIndex + 1
      }),
    fallbackImage:
      topic.fallbackImage ??
      createTopicImage({
        title: topic.title,
        subtitle: "Lotin va anatomiya mavzusi",
        palette: topic.palette,
        glyph: topic.glyph
      }),
    learnItems,
    quizQuestions: buildQuizQuestions(topic.id, topic.title, learnItems)
  };
});

export const initialTopics = topics;

export const topicLookup = Object.fromEntries(topics.map((topic) => [topic.id, topic]));
export const allCertificateQuestions = topics.flatMap((topic) => topic.quizQuestions);

export const quizThresholds = {
  topic: 70,
  certificate: 70
};
