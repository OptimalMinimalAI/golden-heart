export interface Verse {
    id: number;
    arabic: string;
    transliteration: string;
    translation: string;
}

export interface SurahContent {
    id: number;
    name: string;
    arabicName: string;
    translation: string;
    verses: Verse[];
}

// NOTE: Only a subset of Surahs have their full content here for the dialog display.
// The full list of Surah names for the 'Add Surah' dialog is in `all-surahs.ts`
export const SURAHS_CONTENT: SurahContent[] = [
    {
        id: 1,
        name: "Al-Fatiha",
        arabicName: "ٱلْفَاتِحَة",
        translation: "The Opening",
        verses: [
            {
                id: 1,
                arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
                transliteration: "Bismi-llāhi r-raḥmāni r-raḥīm",
                translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
            },
            {
                id: 2,
                arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
                transliteration: "Al-ḥamdu li-llāhi rabbi l-ʿālamīn",
                translation: "All praise is for Allah, Lord of all worlds."
            },
            {
                id: 3,
                arabic: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
                transliteration: "Ar-raḥmāni r-raḥīm",
                translation: "The Entirely Merciful, the Especially Merciful."
            },
            {
                id: 4,
                arabic: "مَـٰلِكِ يَوْمِ ٱلدِّينِ",
                transliteration: "Māliki yawmi d-dīn",
                translation: "Master of the Day of Judgment."
            },
            {
                id: 5,
                arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                transliteration: "Iyyāka naʿbudu wa-iyyāka nastaʿīn",
                translation: "It is You we worship, and You we ask for help."
            },
            {
                id: 6,
                arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
                transliteration: "Ihdinā ṣ-ṣirāṭa l-mustaqīm",
                translation: "Guide us to the straight path."
            },
            {
                id: 7,
                arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
                transliteration: "Ṣirāṭa-lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn",
                translation: "The path of those You have blessed—not of those who have earned Your anger, nor of those who are astray."
            },
        ]
    },
    {
        id: 113,
        name: "Al-Falaq",
        arabicName: "ٱلْفَلَقِ",
        translation: "The Daybreak",
        verses: [
            {
                id: 1,
                arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
                transliteration: "Qul aʿūdhu bi-rabbi l-falaq",
                translation: "Say, 'I seek refuge in the Lord of the daybreak'"
            },
            {
                id: 2,
                arabic: "مِن شَرِّ مَا خَلَقَ",
                transliteration: "Min sharri mā khalaq",
                translation: "From the evil of what He has created"
            },
            {
                id: 3,
                arabic: "وَمِن شَرِّ غَاسِqٍ إِذَا وَقَبَ",
                transliteration: "Wa-min sharri ghāsiqin idhā waqab",
                translation: "And from the evil of darkness when it settles"
            },
            {
                id: 4,
                arabic: "وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ",
                transliteration: "Wa-min sharri n-naffāthāti fi l-ʿuqad",
                translation: "And from the evil of the blowers in knots"
            },
            {
                id: 5,
                arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
                transliteration: "Wa-min sharri ḥāsidin idhā ḥasad",
                translation: "And from the evil of an envier when he envies"
            }
        ]
    },
    {
        id: 114,
        name: "An-Nas",
        arabicName: "النَّاسِ",
        translation: "Mankind",
        verses: [
            {
                id: 1,
                "arabic": "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
                "transliteration": "Qul a'uzu birabbin nas",
                "translation": "Say, I seek refuge in the Lord of mankind,"
            },
            {
                id: 2,
                "arabic": "مَلِكِ النَّاسِ",
                "transliteration": "Malikin nas",
                "translation": "The King of mankind,"
            },
            {
                id: 3,
                "arabic": "إِلَٰهِ النَّاسِ",
                "transliteration": "Ilahin nas",
                "translation": "The god of mankind,"
            },
            {
                id: 4,
                "arabic": "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
                "transliteration": "Min sharril waswasil khannas",
                "translation": "From the evil of the retreating whisperer,"
            },
            {
                id: 5,
                "arabic": "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
                "transliteration": "Allathee yuwaswisu fee sudoorin nas",
                "translation": "Who whispers [evil] into the breasts of mankind,"
            },
            {
                id: 6,
                "arabic": "مِنَ الْجِنَّةِ وَالنَّاسِ",
                "transliteration": "Minal jinnati wannas",
                "translation": "From among the jinn and mankind."
            }
        ]
    }
];

