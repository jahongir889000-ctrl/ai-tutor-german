export type Locale = "ru" | "en";
export type Localized = Record<Locale, string>;
export type StageId = "beginner" | "advanced" | "expert";

export interface Word {
  de: string;
  ru: string;
  en: string;
}

export interface Topic {
  id: string;
  levelId: string;
  titleDe: string;
  title: Localized;
  grammar: { title: Localized; rule: Localized; examples: string[] };
  words: Word[];
}

export interface Level {
  id: string;
  code: string;
  stage: StageId;
  title: Localized;
  description: Localized;
  topics: Topic[];
}

export interface Stage {
  id: StageId;
  title: Localized;
  description: Localized;
  /** Free plan has access to topics of this stage only. */
  free: boolean;
}

export const STAGES: Stage[] = [
  {
    id: "beginner",
    title: { ru: "Начальный", en: "Beginner" },
    description: {
      ru: "A1–A2: знакомство, быт, базовая грамматика",
      en: "A1–A2: introductions, daily life, core grammar",
    },
    free: true,
  },
  {
    id: "advanced",
    title: { ru: "Продвинутый", en: "Advanced" },
    description: {
      ru: "B1–B2: свободное общение, работа, сложные предложения",
      en: "B1–B2: fluent conversation, work, complex sentences",
    },
    free: false,
  },
  {
    id: "expert",
    title: { ru: "Эксперт", en: "Expert" },
    description: {
      ru: "C1–C2: академический и деловой немецкий, нюансы стиля",
      en: "C1–C2: academic and business German, stylistic nuance",
    },
    free: false,
  },
];

type TopicInput = Omit<Topic, "levelId">;
type LevelInput = Omit<Level, "topics"> & { topics: TopicInput[] };

const w = (de: string, ru: string, en: string): Word => ({ de, ru, en });

const RAW_LEVELS: LevelInput[] = [
  // ---------------- BEGINNER ----------------
  {
    id: "a1-1",
    code: "A1.1",
    stage: "beginner",
    title: { ru: "Первые шаги", en: "First steps" },
    description: { ru: "Приветствия, алфавит, о себе", en: "Greetings, alphabet, about yourself" },
    topics: [
      {
        id: "begruessung",
        titleDe: "Begrüßung",
        title: { ru: "Приветствие и знакомство", en: "Greetings & introductions" },
        grammar: {
          title: { ru: "Глагол sein", en: "The verb sein" },
          rule: {
            ru: "sein (быть): ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.",
            en: "sein (to be): ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie/Sie sind.",
          },
          examples: ["Ich bin Anna.", "Bist du Student?", "Wir sind aus Berlin."],
        },
        words: [
          w("Hallo", "привет", "hello"),
          w("Guten Morgen", "доброе утро", "good morning"),
          w("Tschüss", "пока", "bye"),
          w("der Name", "имя", "name"),
          w("woher", "откуда", "where from"),
          w("danke", "спасибо", "thank you"),
        ],
      },
      {
        id: "zahlen",
        titleDe: "Zahlen und Alphabet",
        title: { ru: "Числа и алфавит", en: "Numbers & alphabet" },
        grammar: {
          title: { ru: "Вопросительные слова", en: "Question words" },
          rule: {
            ru: "W-Fragen: wer (кто), was (что), wo (где), wie (как), wie viel (сколько). Глагол стоит на 2-м месте.",
            en: "W-questions: wer (who), was (what), wo (where), wie (how), wie viel (how much). Verb in position 2.",
          },
          examples: ["Wie alt bist du?", "Wo wohnst du?", "Wie viel kostet das?"],
        },
        words: [
          w("eins", "один", "one"),
          w("zwei", "два", "two"),
          w("zehn", "десять", "ten"),
          w("hundert", "сто", "hundred"),
          w("buchstabieren", "произносить по буквам", "to spell"),
          w("die Telefonnummer", "номер телефона", "phone number"),
        ],
      },
      {
        id: "familie",
        titleDe: "Familie",
        title: { ru: "Семья", en: "Family" },
        grammar: {
          title: { ru: "Притяжательные mein/dein", en: "Possessives mein/dein" },
          rule: {
            ru: "mein/dein для der и das, meine/deine для die и множественного числа.",
            en: "mein/dein for der and das nouns, meine/deine for die and plural.",
          },
          examples: ["Das ist mein Bruder.", "Wie heißt deine Mutter?", "Meine Eltern wohnen in Wien."],
        },
        words: [
          w("die Mutter", "мама", "mother"),
          w("der Vater", "папа", "father"),
          w("die Schwester", "сестра", "sister"),
          w("der Bruder", "брат", "brother"),
          w("die Eltern", "родители", "parents"),
          w("das Kind", "ребёнок", "child"),
        ],
      },
    ],
  },
  {
    id: "a1-2",
    code: "A1.2",
    stage: "beginner",
    title: { ru: "Повседневная жизнь", en: "Everyday life" },
    description: { ru: "Еда, покупки, время", en: "Food, shopping, time" },
    topics: [
      {
        id: "essen",
        titleDe: "Essen und Trinken",
        title: { ru: "Еда и напитки", en: "Food & drinks" },
        grammar: {
          title: { ru: "Артикли в Akkusativ", en: "Articles in the accusative" },
          rule: {
            ru: "В Akkusativ меняется только мужской род: der → den, ein → einen.",
            en: "In the accusative only masculine changes: der → den, ein → einen.",
          },
          examples: ["Ich möchte einen Kaffee.", "Sie isst den Apfel.", "Hast du Brot?"],
        },
        words: [
          w("das Brot", "хлеб", "bread"),
          w("der Kaffee", "кофе", "coffee"),
          w("das Wasser", "вода", "water"),
          w("der Apfel", "яблоко", "apple"),
          w("lecker", "вкусный", "tasty"),
          w("die Rechnung", "счёт", "bill"),
        ],
      },
      {
        id: "einkaufen",
        titleDe: "Einkaufen",
        title: { ru: "Покупки", en: "Shopping" },
        grammar: {
          title: { ru: "Модальный глагол möchten", en: "Modal verb möchten" },
          rule: {
            ru: "möchten + инфинитив в конце: Ich möchte ... kaufen.",
            en: "möchten + infinitive at the end: Ich möchte ... kaufen.",
          },
          examples: ["Ich möchte Schuhe kaufen.", "Möchtest du bezahlen?", "Wir möchten zwei Kilo Tomaten."],
        },
        words: [
          w("kaufen", "покупать", "to buy"),
          w("teuer", "дорогой", "expensive"),
          w("billig", "дешёвый", "cheap"),
          w("der Supermarkt", "супермаркет", "supermarket"),
          w("bezahlen", "платить", "to pay"),
          w("die Größe", "размер", "size"),
        ],
      },
      {
        id: "uhrzeit",
        titleDe: "Uhrzeit und Tagesablauf",
        title: { ru: "Время и распорядок дня", en: "Time & daily routine" },
        grammar: {
          title: { ru: "Отделяемые приставки", en: "Separable verbs" },
          rule: {
            ru: "Приставка уходит в конец: aufstehen → Ich stehe um 7 Uhr auf.",
            en: "The prefix goes to the end: aufstehen → Ich stehe um 7 Uhr auf.",
          },
          examples: ["Ich stehe früh auf.", "Der Film fängt um acht an.", "Rufst du mich an?"],
        },
        words: [
          w("aufstehen", "вставать", "to get up"),
          w("die Uhr", "часы", "clock"),
          w("halb", "половина", "half"),
          w("der Morgen", "утро", "morning"),
          w("anfangen", "начинать", "to begin"),
          w("einkaufen", "делать покупки", "to shop"),
        ],
      },
    ],
  },
  {
    id: "a2-1",
    code: "A2.1",
    stage: "beginner",
    title: { ru: "Мой мир", en: "My world" },
    description: { ru: "Жильё, город, прошлое", en: "Home, city, the past" },
    topics: [
      {
        id: "wohnung",
        titleDe: "Wohnung",
        title: { ru: "Квартира и дом", en: "Home & flat" },
        grammar: {
          title: { ru: "Wechselpräpositionen", en: "Two-way prepositions" },
          rule: {
            ru: "in, an, auf, unter… Wo? → Dativ, Wohin? → Akkusativ.",
            en: "in, an, auf, unter… Where? → dative, where to? → accusative.",
          },
          examples: ["Das Buch liegt auf dem Tisch.", "Ich lege das Buch auf den Tisch.", "Wir wohnen in der Stadt."],
        },
        words: [
          w("die Wohnung", "квартира", "flat"),
          w("die Küche", "кухня", "kitchen"),
          w("das Schlafzimmer", "спальня", "bedroom"),
          w("die Miete", "аренда", "rent"),
          w("der Nachbar", "сосед", "neighbour"),
          w("umziehen", "переезжать", "to move house"),
        ],
      },
      {
        id: "perfekt",
        titleDe: "Perfekt",
        title: { ru: "Прошедшее время Perfekt", en: "Past tense: Perfekt" },
        grammar: {
          title: { ru: "Perfekt с haben и sein", en: "Perfekt with haben and sein" },
          rule: {
            ru: "haben/sein + Partizip II в конце. sein — с глаголами движения и изменения состояния.",
            en: "haben/sein + past participle at the end. sein with verbs of motion and change of state.",
          },
          examples: ["Ich habe Pizza gegessen.", "Wir sind nach Hamburg gefahren.", "Hast du gut geschlafen?"],
        },
        words: [
          w("gestern", "вчера", "yesterday"),
          w("gegessen", "съел(а)", "eaten"),
          w("gefahren", "поехал(а)", "driven/gone"),
          w("das Wochenende", "выходные", "weekend"),
          w("besuchen", "навещать", "to visit"),
          w("letzte Woche", "на прошлой неделе", "last week"),
        ],
      },
      {
        id: "stadt",
        titleDe: "In der Stadt",
        title: { ru: "В городе", en: "In the city" },
        grammar: {
          title: { ru: "Предлоги с Dativ", en: "Dative prepositions" },
          rule: {
            ru: "aus, bei, mit, nach, seit, von, zu — всегда Dativ. zu + dem = zum, zu + der = zur.",
            en: "aus, bei, mit, nach, seit, von, zu always take the dative. zu + dem = zum, zu + der = zur.",
          },
          examples: ["Ich fahre mit dem Bus.", "Wie komme ich zum Bahnhof?", "Sie geht zur Apotheke."],
        },
        words: [
          w("der Bahnhof", "вокзал", "station"),
          w("geradeaus", "прямо", "straight on"),
          w("links", "налево", "left"),
          w("die Haltestelle", "остановка", "stop"),
          w("die Apotheke", "аптека", "pharmacy"),
          w("die Fahrkarte", "билет", "ticket"),
        ],
      },
    ],
  },
  {
    id: "a2-2",
    code: "A2.2",
    stage: "beginner",
    title: { ru: "Уверенный старт", en: "Confident start" },
    description: { ru: "Здоровье, путешествия, сравнения", en: "Health, travel, comparisons" },
    topics: [
      {
        id: "gesundheit",
        titleDe: "Gesundheit",
        title: { ru: "Здоровье", en: "Health" },
        grammar: {
          title: { ru: "Модальные глаголы müssen, dürfen, sollen", en: "Modals müssen, dürfen, sollen" },
          rule: {
            ru: "Модальный глагол на 2-м месте, инфинитив — в конце.",
            en: "Modal verb in position 2, infinitive at the end.",
          },
          examples: ["Du musst viel Wasser trinken.", "Darf ich Sport machen?", "Sie sollen im Bett bleiben."],
        },
        words: [
          w("der Arzt", "врач", "doctor"),
          w("Kopfschmerzen", "головная боль", "headache"),
          w("krank", "больной", "ill"),
          w("das Rezept", "рецепт", "prescription"),
          w("der Termin", "запись (на приём)", "appointment"),
          w("gute Besserung", "выздоравливай", "get well soon"),
        ],
      },
      {
        id: "reisen",
        titleDe: "Reisen",
        title: { ru: "Путешествия", en: "Travel" },
        grammar: {
          title: { ru: "Придаточные с weil и dass", en: "Clauses with weil and dass" },
          rule: {
            ru: "В придаточном предложении спрягаемый глагол уходит в конец.",
            en: "In a subordinate clause the conjugated verb goes to the end.",
          },
          examples: ["Ich bleibe zu Hause, weil es regnet.", "Ich glaube, dass der Zug spät kommt."],
        },
        words: [
          w("der Urlaub", "отпуск", "holiday"),
          w("das Hotel", "отель", "hotel"),
          w("der Koffer", "чемодан", "suitcase"),
          w("buchen", "бронировать", "to book"),
          w("der Flughafen", "аэропорт", "airport"),
          w("die Verspätung", "опоздание", "delay"),
        ],
      },
      {
        id: "vergleiche",
        titleDe: "Vergleiche",
        title: { ru: "Сравнения", en: "Comparisons" },
        grammar: {
          title: { ru: "Komparativ и Superlativ", en: "Comparative & superlative" },
          rule: {
            ru: "schnell → schneller → am schnellsten. als — «чем», wie — «как».",
            en: "schnell → schneller → am schnellsten. als = than, wie = as.",
          },
          examples: ["Berlin ist größer als München.", "Er läuft am schnellsten.", "Sie ist so alt wie ich."],
        },
        words: [
          w("größer", "больше", "bigger"),
          w("besser", "лучше", "better"),
          w("am liebsten", "больше всего (люблю)", "most of all"),
          w("älter", "старше", "older"),
          w("gleich", "одинаковый", "same"),
          w("der Unterschied", "разница", "difference"),
        ],
      },
    ],
  },
  // ---------------- ADVANCED ----------------
  {
    id: "b1-1",
    code: "B1.1",
    stage: "advanced",
    title: { ru: "Самостоятельность", en: "Independence" },
    description: { ru: "Работа, мнения, Präteritum", en: "Work, opinions, Präteritum" },
    topics: [
      {
        id: "arbeit",
        titleDe: "Arbeit und Beruf",
        title: { ru: "Работа и профессия", en: "Work & career" },
        grammar: {
          title: { ru: "Präteritum", en: "Simple past (Präteritum)" },
          rule: {
            ru: "В письменной речи: ich arbeitete, ich ging, ich war, ich hatte.",
            en: "Used in writing: ich arbeitete, ich ging, ich war, ich hatte.",
          },
          examples: ["Früher arbeitete ich in einer Bank.", "Er hatte keine Zeit.", "Wir gingen spät nach Hause."],
        },
        words: [
          w("die Bewerbung", "заявление о приёме на работу", "application"),
          w("das Gehalt", "зарплата", "salary"),
          w("der Kollege", "коллега", "colleague"),
          w("kündigen", "увольняться", "to resign"),
          w("die Erfahrung", "опыт", "experience"),
          w("das Vorstellungsgespräch", "собеседование", "job interview"),
        ],
      },
      {
        id: "meinung",
        titleDe: "Meinung äußern",
        title: { ru: "Выражение мнения", en: "Expressing opinions" },
        grammar: {
          title: { ru: "Konjunktiv II: würde, hätte, wäre", en: "Konjunktiv II: würde, hätte, wäre" },
          rule: {
            ru: "Вежливость и нереальность: Ich würde ... + инфинитив; Ich hätte gern...; Das wäre toll.",
            en: "Politeness and hypotheticals: Ich würde ... + infinitive; Ich hätte gern...; Das wäre toll.",
          },
          examples: ["Ich würde lieber zu Hause bleiben.", "Wenn ich Zeit hätte, käme ich mit.", "Das wäre super!"],
        },
        words: [
          w("meiner Meinung nach", "по моему мнению", "in my opinion"),
          w("zustimmen", "соглашаться", "to agree"),
          w("der Vorteil", "преимущество", "advantage"),
          w("der Nachteil", "недостаток", "disadvantage"),
          w("überzeugen", "убеждать", "to convince"),
          w("einerseits … andererseits", "с одной стороны … с другой", "on one hand … on the other"),
        ],
      },
      {
        id: "medien",
        titleDe: "Medien",
        title: { ru: "Медиа и технологии", en: "Media & technology" },
        grammar: {
          title: { ru: "Relativsätze", en: "Relative clauses" },
          rule: {
            ru: "Относительное местоимение (der/die/das) берёт род от слова, падеж — от придаточного.",
            en: "The relative pronoun takes gender from the noun and case from its clause.",
          },
          examples: ["Das ist die App, die ich täglich benutze.", "Der Mann, dem ich geholfen habe, ist Arzt."],
        },
        words: [
          w("die Nachricht", "новость, сообщение", "news, message"),
          w("herunterladen", "скачивать", "to download"),
          w("die Werbung", "реклама", "advertising"),
          w("der Bildschirm", "экран", "screen"),
          w("süchtig", "зависимый", "addicted"),
          w("der Datenschutz", "защита данных", "data privacy"),
        ],
      },
    ],
  },
  {
    id: "b1-2",
    code: "B1.2",
    stage: "advanced",
    title: { ru: "Общество", en: "Society" },
    description: { ru: "Экология, образование, Passiv", en: "Environment, education, passive" },
    topics: [
      {
        id: "umwelt",
        titleDe: "Umwelt",
        title: { ru: "Экология", en: "Environment" },
        grammar: {
          title: { ru: "Passiv Präsens", en: "Present passive" },
          rule: {
            ru: "werden + Partizip II: Der Müll wird getrennt.",
            en: "werden + past participle: Der Müll wird getrennt.",
          },
          examples: ["Plastik wird recycelt.", "Hier werden Bäume gepflanzt.", "Strom wird gespart."],
        },
        words: [
          w("der Klimawandel", "изменение климата", "climate change"),
          w("die Umwelt", "окружающая среда", "environment"),
          w("trennen", "сортировать", "to separate"),
          w("die Energie", "энергия", "energy"),
          w("nachhaltig", "устойчивый", "sustainable"),
          w("verschwenden", "растрачивать", "to waste"),
        ],
      },
      {
        id: "bildung",
        titleDe: "Bildung",
        title: { ru: "Образование", en: "Education" },
        grammar: {
          title: { ru: "Infinitiv mit zu, um … zu", en: "Infinitive with zu, um … zu" },
          rule: {
            ru: "Es ist wichtig, … zu lernen. um … zu — цель (чтобы).",
            en: "Es ist wichtig, … zu lernen. um … zu expresses purpose (in order to).",
          },
          examples: ["Ich lerne Deutsch, um in Berlin zu studieren.", "Es ist schwer, früh aufzustehen."],
        },
        words: [
          w("das Studium", "учёба в вузе", "university studies"),
          w("die Prüfung", "экзамен", "exam"),
          w("bestehen", "сдать (экзамен)", "to pass"),
          w("die Ausbildung", "профобучение", "vocational training"),
          w("das Zeugnis", "аттестат", "certificate"),
          w("sich bewerben", "подавать заявку", "to apply"),
        ],
      },
      {
        id: "beziehungen",
        titleDe: "Beziehungen",
        title: { ru: "Отношения", en: "Relationships" },
        grammar: {
          title: { ru: "Глаголы с предлогами", en: "Verbs with prepositions" },
          rule: {
            ru: "sich freuen auf/über, warten auf, denken an. Вопрос: Worauf? Woran? Ответ: darauf, daran.",
            en: "sich freuen auf/über, warten auf, denken an. Questions: Worauf? Woran? Answers: darauf, daran.",
          },
          examples: ["Ich freue mich auf den Urlaub.", "Woran denkst du?", "Ich warte schon lange darauf."],
        },
        words: [
          w("sich verlieben", "влюбиться", "to fall in love"),
          w("der Streit", "ссора", "argument"),
          w("vertrauen", "доверять", "to trust"),
          w("die Freundschaft", "дружба", "friendship"),
          w("sich trennen", "расстаться", "to break up"),
          w("eifersüchtig", "ревнивый", "jealous"),
        ],
      },
    ],
  },
  {
    id: "b2-1",
    code: "B2.1",
    stage: "advanced",
    title: { ru: "Свобода выражения", en: "Fluent expression" },
    description: { ru: "Аргументация, Konjunktiv, Genitiv", en: "Argumentation, Konjunktiv, genitive" },
    topics: [
      {
        id: "argumentieren",
        titleDe: "Argumentieren",
        title: { ru: "Аргументация", en: "Argumentation" },
        grammar: {
          title: { ru: "Двойные союзы", en: "Two-part conjunctions" },
          rule: {
            ru: "sowohl … als auch, weder … noch, nicht nur … sondern auch, je … desto.",
            en: "sowohl … als auch, weder … noch, nicht nur … sondern auch, je … desto.",
          },
          examples: ["Je mehr ich lese, desto mehr verstehe ich.", "Er spricht weder Englisch noch Französisch."],
        },
        words: [
          w("die These", "тезис", "thesis"),
          w("widersprechen", "возражать", "to contradict"),
          w("die Begründung", "обоснование", "justification"),
          w("abwägen", "взвешивать", "to weigh up"),
          w("folglich", "следовательно", "consequently"),
          w("zwar … aber", "хотя … но", "admittedly … but"),
        ],
      },
      {
        id: "konjunktiv-vergangenheit",
        titleDe: "Konjunktiv II der Vergangenheit",
        title: { ru: "Нереальное прошлое", en: "Unreal past" },
        grammar: {
          title: { ru: "hätte/wäre + Partizip II", en: "hätte/wäre + past participle" },
          rule: {
            ru: "Сожаление о прошлом: Wenn ich das gewusst hätte, wäre ich gekommen.",
            en: "Regret about the past: Wenn ich das gewusst hätte, wäre ich gekommen.",
          },
          examples: ["Ich hätte früher anfangen sollen.", "Wärst du doch mitgekommen!"],
        },
        words: [
          w("bereuen", "сожалеть", "to regret"),
          w("die Chance", "шанс", "chance"),
          w("verpassen", "упустить", "to miss"),
          w("rechtzeitig", "вовремя", "in time"),
          w("die Entscheidung", "решение", "decision"),
          w("anders", "иначе", "differently"),
        ],
      },
      {
        id: "wirtschaft",
        titleDe: "Wirtschaft",
        title: { ru: "Экономика и финансы", en: "Economy & finance" },
        grammar: {
          title: { ru: "Genitiv и предлоги с ним", en: "Genitive & its prepositions" },
          rule: {
            ru: "wegen, trotz, während, innerhalb + Genitiv: trotz des Regens.",
            en: "wegen, trotz, während, innerhalb + genitive: trotz des Regens.",
          },
          examples: ["Wegen der Inflation steigen die Preise.", "Während des Meetings klingelte das Telefon."],
        },
        words: [
          w("die Inflation", "инфляция", "inflation"),
          w("der Umsatz", "оборот", "turnover"),
          w("die Steuer", "налог", "tax"),
          w("investieren", "инвестировать", "to invest"),
          w("der Verbraucher", "потребитель", "consumer"),
          w("die Konkurrenz", "конкуренция", "competition"),
        ],
      },
    ],
  },
  {
    id: "b2-2",
    code: "B2.2",
    stage: "advanced",
    title: { ru: "Профессиональный уровень", en: "Professional level" },
    description: { ru: "Наука, право, пассивные конструкции", en: "Science, law, passive alternatives" },
    topics: [
      {
        id: "wissenschaft",
        titleDe: "Wissenschaft",
        title: { ru: "Наука", en: "Science" },
        grammar: {
          title: { ru: "Passiv с модальными глаголами", en: "Passive with modals" },
          rule: {
            ru: "Модальный + Partizip II + werden: Das Experiment muss wiederholt werden.",
            en: "Modal + past participle + werden: Das Experiment muss wiederholt werden.",
          },
          examples: ["Die Daten müssen geprüft werden.", "Das Problem konnte gelöst werden."],
        },
        words: [
          w("die Forschung", "исследование", "research"),
          w("das Ergebnis", "результат", "result"),
          w("die Hypothese", "гипотеза", "hypothesis"),
          w("beweisen", "доказывать", "to prove"),
          w("untersuchen", "исследовать", "to examine"),
          w("die Studie", "исследование (работа)", "study"),
        ],
      },
      {
        id: "passiversatz",
        titleDe: "Passiversatzformen",
        title: { ru: "Замены пассива", en: "Passive alternatives" },
        grammar: {
          title: { ru: "sich lassen, -bar, sein + zu", en: "sich lassen, -bar, sein + zu" },
          rule: {
            ru: "Das lässt sich lösen = Das ist lösbar = Das ist zu lösen.",
            en: "Das lässt sich lösen = Das ist lösbar = Das ist zu lösen.",
          },
          examples: ["Der Text ist leicht verständlich.", "Die Aufgabe ist bis Montag zu erledigen."],
        },
        words: [
          w("machbar", "выполнимый", "feasible"),
          w("erledigen", "выполнять", "to get done"),
          w("die Vorschrift", "предписание", "regulation"),
          w("vermeidbar", "избегаемый", "avoidable"),
          w("umsetzen", "реализовать", "to implement"),
          w("die Frist", "срок", "deadline"),
        ],
      },
      {
        id: "gesellschaft",
        titleDe: "Gesellschaft und Politik",
        title: { ru: "Общество и политика", en: "Society & politics" },
        grammar: {
          title: { ru: "Konjunktiv I в косвенной речи", en: "Konjunktiv I in reported speech" },
          rule: {
            ru: "В новостях: Der Minister sagte, er sei zufrieden und habe keine Zeit.",
            en: "In news reports: Der Minister sagte, er sei zufrieden und habe keine Zeit.",
          },
          examples: ["Sie erklärte, das Gesetz werde geändert.", "Er behauptet, er wisse nichts davon."],
        },
        words: [
          w("die Wahl", "выборы", "election"),
          w("die Regierung", "правительство", "government"),
          w("das Gesetz", "закон", "law"),
          w("die Gleichberechtigung", "равноправие", "equality"),
          w("fordern", "требовать", "to demand"),
          w("die Mehrheit", "большинство", "majority"),
        ],
      },
    ],
  },
  // ---------------- EXPERT ----------------
  {
    id: "c1-1",
    code: "C1.1",
    stage: "expert",
    title: { ru: "Академический немецкий", en: "Academic German" },
    description: { ru: "Номинализация, научный стиль", en: "Nominalisation, academic style" },
    topics: [
      {
        id: "nominalisierung",
        titleDe: "Nominalisierung",
        title: { ru: "Номинализация", en: "Nominalisation" },
        grammar: {
          title: { ru: "Verbalstil → Nominalstil", en: "Verbal style → nominal style" },
          rule: {
            ru: "Weil die Preise steigen → Wegen des Anstiegs der Preise.",
            en: "Weil die Preise steigen → Wegen des Anstiegs der Preise.",
          },
          examples: ["Nach der Durchführung der Studie …", "Bei der Planung des Projekts …"],
        },
        words: [
          w("die Durchführung", "проведение", "execution"),
          w("der Anstieg", "рост", "increase"),
          w("die Berücksichtigung", "учёт", "consideration"),
          w("die Verbesserung", "улучшение", "improvement"),
          w("im Hinblick auf", "в отношении", "with regard to"),
          w("die Auswirkung", "последствие", "effect"),
        ],
      },
      {
        id: "partizipialattribute",
        titleDe: "Partizipialattribute",
        title: { ru: "Распространённые определения", en: "Extended participial attributes" },
        grammar: {
          title: { ru: "Partizip I и II как определение", en: "Participles as attributes" },
          rule: {
            ru: "die steigenden Kosten; die im letzten Jahr veröffentlichte Studie.",
            en: "die steigenden Kosten; die im letzten Jahr veröffentlichte Studie.",
          },
          examples: ["Das seit Jahren diskutierte Problem bleibt ungelöst.", "Die zunehmende Digitalisierung …"],
        },
        words: [
          w("veröffentlichen", "публиковать", "to publish"),
          w("zunehmend", "возрастающий", "increasing"),
          w("weitreichend", "далеко идущий", "far-reaching"),
          w("vorliegend", "настоящий, имеющийся", "present, at hand"),
          w("umstritten", "спорный", "controversial"),
          w("die Erkenntnis", "вывод, познание", "insight"),
        ],
      },
      {
        id: "praesentation",
        titleDe: "Präsentieren und Diskutieren",
        title: { ru: "Презентации и дискуссии", en: "Presenting & discussing" },
        grammar: {
          title: { ru: "Модальные частицы", en: "Modal particles" },
          rule: {
            ru: "doch, ja, eben, halt, wohl, eigentlich — придают оттенок и естественность речи.",
            en: "doch, ja, eben, halt, wohl, eigentlich add nuance and make speech natural.",
          },
          examples: ["Das ist ja interessant!", "Komm doch mal vorbei.", "Das ist halt so."],
        },
        words: [
          w("die Gliederung", "структура", "outline"),
          w("zusammenfassen", "резюмировать", "to summarise"),
          w("hervorheben", "подчёркивать", "to emphasise"),
          w("der Einwand", "возражение", "objection"),
          w("eingehen auf", "останавливаться на", "to address"),
          w("abschließend", "в заключение", "in conclusion"),
        ],
      },
    ],
  },
  {
    id: "c1-2",
    code: "C1.2",
    stage: "expert",
    title: { ru: "Деловой немецкий", en: "Business German" },
    description: { ru: "Переговоры, корреспонденция, идиомы", en: "Negotiation, correspondence, idioms" },
    topics: [
      {
        id: "verhandlung",
        titleDe: "Verhandlungen",
        title: { ru: "Переговоры", en: "Negotiations" },
        grammar: {
          title: { ru: "Функциональные глаголы", en: "Light-verb constructions" },
          rule: {
            ru: "in Frage kommen, zur Verfügung stellen, eine Entscheidung treffen, in Kraft treten.",
            en: "in Frage kommen, zur Verfügung stellen, eine Entscheidung treffen, in Kraft treten.",
          },
          examples: ["Wir stellen Ihnen die Unterlagen zur Verfügung.", "Diese Option kommt nicht in Frage."],
        },
        words: [
          w("das Angebot", "предложение", "offer"),
          w("der Kompromiss", "компромисс", "compromise"),
          w("die Bedingung", "условие", "condition"),
          w("entgegenkommen", "идти навстречу", "to accommodate"),
          w("der Vertrag", "договор", "contract"),
          w("verbindlich", "обязательный", "binding"),
        ],
      },
      {
        id: "korrespondenz",
        titleDe: "Geschäftskorrespondenz",
        title: { ru: "Деловая переписка", en: "Business correspondence" },
        grammar: {
          title: { ru: "Формальный стиль", en: "Formal register" },
          rule: {
            ru: "Sehr geehrte Damen und Herren; Bezug nehmend auf …; Mit freundlichen Grüßen.",
            en: "Sehr geehrte Damen und Herren; Bezug nehmend auf …; Mit freundlichen Grüßen.",
          },
          examples: ["Bezug nehmend auf Ihre Anfrage teilen wir Ihnen mit …", "Für Rückfragen stehen wir gern zur Verfügung."],
        },
        words: [
          w("die Anfrage", "запрос", "inquiry"),
          w("die Mitteilung", "уведомление", "notice"),
          w("beiliegend", "в приложении", "enclosed"),
          w("die Beschwerde", "жалоба", "complaint"),
          w("umgehend", "незамедлительно", "promptly"),
          w("die Rückmeldung", "обратная связь", "feedback"),
        ],
      },
      {
        id: "redewendungen",
        titleDe: "Redewendungen",
        title: { ru: "Идиомы и фразеология", en: "Idioms" },
        grammar: {
          title: { ru: "Устойчивые выражения", en: "Fixed expressions" },
          rule: {
            ru: "Идиомы нельзя переводить дословно: Ich verstehe nur Bahnhof = ничего не понимаю.",
            en: "Idioms can't be translated literally: Ich verstehe nur Bahnhof = it's all Greek to me.",
          },
          examples: ["Da steppt der Bär!", "Das ist nicht mein Bier.", "Er hat Schwein gehabt."],
        },
        words: [
          w("Tomaten auf den Augen haben", "ничего не замечать", "to be oblivious"),
          w("die Daumen drücken", "держать кулачки", "to keep fingers crossed"),
          w("ins Fettnäpfchen treten", "попасть впросак", "to put one's foot in it"),
          w("auf dem Holzweg sein", "заблуждаться", "to be on the wrong track"),
          w("um den heißen Brei reden", "ходить вокруг да около", "to beat around the bush"),
          w("Schwein haben", "повезти", "to be lucky"),
        ],
      },
    ],
  },
  {
    id: "c2",
    code: "C2",
    stage: "expert",
    title: { ru: "Мастерство", en: "Mastery" },
    description: { ru: "Литература, стилистика, диалекты", en: "Literature, style, dialects" },
    topics: [
      {
        id: "literatur",
        titleDe: "Literatur",
        title: { ru: "Литература", en: "Literature" },
        grammar: {
          title: { ru: "Порядок слов и стилистические инверсии", en: "Word order & stylistic inversion" },
          rule: {
            ru: "Вынос на первое место для акцента: Nie hätte ich gedacht, dass …",
            en: "Fronting for emphasis: Nie hätte ich gedacht, dass …",
          },
          examples: ["Kaum war er angekommen, begann es zu regnen.", "Selten hat man so etwas gesehen."],
        },
        words: [
          w("die Erzählung", "повесть", "narrative"),
          w("der Ich-Erzähler", "рассказчик от 1-го лица", "first-person narrator"),
          w("die Metapher", "метафора", "metaphor"),
          w("schildern", "описывать", "to depict"),
          w("vieldeutig", "многозначный", "ambiguous"),
          w("die Sehnsucht", "тоска, томление", "longing"),
        ],
      },
      {
        id: "stilistik",
        titleDe: "Stilistik",
        title: { ru: "Стилистика и регистры", en: "Style & register" },
        grammar: {
          title: { ru: "Регистры речи", en: "Speech registers" },
          rule: {
            ru: "Одна мысль — разные регистры: kriegen (разг.) / bekommen (нейтр.) / erhalten (офиц.).",
            en: "One idea, different registers: kriegen (colloquial) / bekommen (neutral) / erhalten (formal).",
          },
          examples: ["Ich hab's kapiert. / Ich habe es verstanden. / Mir ist der Sachverhalt bewusst."],
        },
        words: [
          w("umgangssprachlich", "разговорный", "colloquial"),
          w("gehoben", "возвышенный", "elevated"),
          w("die Nuance", "нюанс", "nuance"),
          w("der Ausdruck", "выражение", "expression"),
          w("prägnant", "ёмкий", "concise"),
          w("salopp", "небрежный, развязный", "slangy"),
        ],
      },
      {
        id: "dialekte",
        titleDe: "Dialekte und Varietäten",
        title: { ru: "Диалекты: Австрия, Швейцария", en: "Dialects: Austria, Switzerland" },
        grammar: {
          title: { ru: "Варианты немецкого", en: "Varieties of German" },
          rule: {
            ru: "Австрия: Jänner, Paradeiser, Grüß Gott. Швейцария: Grüezi, Velo, parkieren; нет ß.",
            en: "Austria: Jänner, Paradeiser, Grüß Gott. Switzerland: Grüezi, Velo, parkieren; no ß.",
          },
          examples: ["Grüß Gott, an Kaffee bitte!", "Grüezi mitenand!", "Moin! (Norddeutschland)"],
        },
        words: [
          w("der Paradeiser", "помидор (австр.)", "tomato (Austrian)"),
          w("das Velo", "велосипед (швейц.)", "bicycle (Swiss)"),
          w("Grüezi", "здравствуйте (швейц.)", "hello (Swiss)"),
          w("der Jänner", "январь (австр.)", "January (Austrian)"),
          w("Moin", "привет (сев. Германия)", "hi (North German)"),
          w("das Brötchen / die Semmel", "булочка", "bread roll"),
        ],
      },
    ],
  },
];

export const LEVELS: Level[] = RAW_LEVELS.map((l) => ({
  ...l,
  topics: l.topics.map((t) => ({ ...t, levelId: l.id })),
}));

export const ALL_TOPICS: Topic[] = LEVELS.flatMap((l) => l.topics);

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getTopic(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function getStage(id: StageId): Stage {
  return STAGES.find((s) => s.id === id)!;
}

export function levelsOfStage(stage: StageId): Level[] {
  return LEVELS.filter((l) => l.stage === stage);
}

/** Is this topic a "basic" one, i.e. open on the Free plan? */
export function isBasicTopic(topic: Topic): boolean {
  const level = getLevel(topic.levelId);
  return level ? getStage(level.stage).free : false;
}

export function isBasicLevel(level: Level): boolean {
  return getStage(level.stage).free;
}
