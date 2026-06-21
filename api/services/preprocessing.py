import re
import unicodedata

import pandas as pd
from unidecode import unidecode
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import (
    StopWordRemoverFactory,
)

from pathlib import Path

# =========================================================
# CLEANING
# =========================================================

def decode_flag_letters(text):
    result = []

    for char in text:
        code = ord(char)

        # Regional Indicator Symbol A-Z
        if 0x1F1E6 <= code <= 0x1F1FF:
            result.append(
                chr(ord("a") + code - 0x1F1E6)
            )
        else:
            result.append(char)

    return "".join(result)

def clean_text(text):
    if not isinstance(text, str):
        return ""

    # 0. Decode regional indicator emoji
    text = decode_flag_letters(text)
    
    # 1. lindungi boundary emoji/simbol
    text = re.sub(
        r"([^\w\s])",
        r" \1 ",
        text
    )

    # 2. Homoglyph normalization
    text = unidecode(text)

    # 3. Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # 4. Lowercase
    text = text.lower()

    # 5. Remove URL
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)

    # 6. Remove mention & hashtag
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#\w+", "", text)

    # 7. Remove emoji
    text = re.sub(r"[\U00010000-\U0010ffff]", " ", text)

    # 8. Keep alphanumeric
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    # 9. Normalize spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


# =========================================================
# OBFUSCATION NORMALIZATION
# =========================================================

# =========================================================
# Regex-based obfuscation normalization
# =========================================================
OBFUSCATION_RULES = [
    (r"j[uuv]d[i1!]", "judi"),
    (r"[o0]nl[i1]ne", "online"),
    (r"g[a4]c[o0]r", "gacor"),
    (r"sl[o0]t", "slot"),
    (r"m[a4]xw[i1]n", "maxwin"),
]

# =========================================================
# Suspicious keywords
# =========================================================
SUSPICIOUS_WORDS = [
    "gacor",
    "slot",
    "scatter",
    "maxwin",
    "bonus",
    "jackpot",
    "wild",
    "spin",
]

def normalize_obfuscation(text):

    if not isinstance(text, str):
        return ""

    # 1. Repetition reduction
    text = re.sub(
        r"(.)\1{2,}",
        r"\1",
        text
    )

    # 2. Merge spaced characters
    pattern = r"\b(?:[A-Za-z0-9]\s+){2,}[A-Za-z0-9]\b"

    text = re.sub(
        pattern,
        lambda m: re.sub(r"\s+", "", m.group(0)),
        text
    )

    # 3. Merge suspicious spaced words
    for word in SUSPICIOUS_WORDS:

        spaced_pattern = r"\s*".join(list(word))

        text = re.sub(
            spaced_pattern,
            word,
            text,
            flags=re.IGNORECASE
        )

    # 4. Contextual obfuscation normalization
    for pattern, replacement in OBFUSCATION_RULES:

        text = re.sub(
            pattern,
            replacement,
            text,
            flags=re.IGNORECASE
        )

    # 5. Normalize whitespace    
    text = " ".join(text.split())

    return text


# =========================================================
# UNSLANG
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

SLANG_FILE = BASE_DIR / "resources" / "slang_indo.csv"

df_slang = pd.read_csv(
    SLANG_FILE,
    header=None
)

df_slang.columns = [
    "slang",
    "formal"
]

df_slang["slang"] = (
    df_slang["slang"]
    .astype(str)
    .str.strip()
)

df_slang["formal"] = (
    df_slang["formal"]
    .astype(str)
    .str.strip()
)

slang_dict = dict(
    zip(
        df_slang["slang"],
        df_slang["formal"]
    )
)


def unslang(text):
    words = text.split()

    normalized = [
        slang_dict.get(word, word).strip()
        for word in words
    ]

    return " ".join(normalized).strip()


# =========================================================
# STOPWORD REMOVAL & STEMMING
# =========================================================

stemmer = (
    StemmerFactory()
    .create_stemmer()
)

stopwords = set(
    StopWordRemoverFactory()
    .get_stop_words()
)


def remove_stopwords(text):
    if not isinstance(text, str):
        return ""

    words = text.split()

    filtered = [
        word
        for word in words
        if word not in stopwords
    ]

    return " ".join(filtered)


def stemming(text):
    if not isinstance(text, str):
        return ""

    return stemmer.stem(text)


# =========================================================
# MAIN PREPROCESSING PIPELINE
# =========================================================

def preprocess_text(text):
    if not isinstance(text, str):
        return ""

    text = clean_text(text)
    text = normalize_obfuscation(text)
    text = unslang(text)
    # text = remove_stopwords(text)
    # text = stemming(text)

    return text