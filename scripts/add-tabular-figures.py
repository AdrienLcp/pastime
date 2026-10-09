"""Give the hand font tabular figures and a family name of its own.

Gochi Hand ships proportional digits only and no `tnum` feature, so a time the
player wrote changes width as its digits change, though the hand voice inherits
`font-variant-numeric: tabular-nums`. This adds `zero.tf` to `nine.tf`: each a
composite of its digit, centred on the widest digit's advance, reached from the
digits by a `tnum` single substitution in every script and language.

Gochi Hand's license reserves the names "Gochi" and "Gochi Hand" (SIL OFL 1.1,
public/fonts/gochi-hand-OFL.txt), so the modified file is renamed Pastime Hand;
the copyright notice and the license stay as they were.

Regenerate from the subset first committed, never from the served file, which
already holds the figures:

    git show 9266f79:public/fonts/gochi-hand-latin.woff2 > gochi-hand-original.woff2
    python -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/add-tabular-figures.py gochi-hand-original.woff2 public/fonts/gochi-hand-latin.woff2
"""

import sys

from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent

DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
TABULAR_SUFFIX = ".tf"
FAMILY = "Pastime Hand"
POSTSCRIPT_NAME = "PastimeHand-Regular"
MODIFICATION_NOTICE = "Modified from Gochi Hand for Pastime: tabular figures (tnum) added, family renamed."
BASE_GLYPH_CLASS = 1


def tabular_name(digit):
    return digit + TABULAR_SUFFIX


def add_tabular_glyphs(font):
    glyf = font["glyf"]
    hmtx = font["hmtx"]
    if tabular_name(DIGITS[0]) in glyf:
        sys.exit("The font already has tabular figures: start from the original subset.")

    advance = max(hmtx[digit][0] for digit in DIGITS)
    for digit in DIGITS:
        digit_advance, digit_bearing = hmtx[digit]
        shift = round((advance - digit_advance) / 2)
        component = GlyphComponent()
        component.glyphName = digit
        component.x = shift
        component.y = 0
        component.flags = 0x4
        composite = Glyph()
        composite.numberOfContours = -1
        composite.components = [component]
        glyf[tabular_name(digit)] = composite
        hmtx[tabular_name(digit)] = (advance, digit_bearing + shift)
    font.setGlyphOrder(glyf.glyphOrder)
    return advance


def classify_as_base(font):
    if "GDEF" not in font:
        return
    class_def = font["GDEF"].table.GlyphClassDef
    if class_def is not None:
        for digit in DIGITS:
            class_def.classDefs[tabular_name(digit)] = BASE_GLYPH_CLASS


def add_tnum_feature(font):
    gsub = font["GSUB"].table
    substitution = otTables.SingleSubst()
    substitution.Format = 1
    substitution.mapping = {digit: tabular_name(digit) for digit in DIGITS}
    lookup = otTables.Lookup()
    lookup.LookupType = 1
    lookup.LookupFlag = 0
    lookup.SubTable = [substitution]
    lookup.SubTableCount = 1
    gsub.LookupList.Lookup.append(lookup)
    gsub.LookupList.LookupCount = len(gsub.LookupList.Lookup)

    feature = otTables.Feature()
    feature.FeatureParams = None
    feature.LookupListIndex = [gsub.LookupList.LookupCount - 1]
    feature.LookupCount = 1
    record = otTables.FeatureRecord()
    record.FeatureTag = "tnum"
    record.Feature = feature
    records = gsub.FeatureList.FeatureRecord
    records.append(record)
    records.sort(key=lambda each: each.FeatureTag)
    gsub.FeatureList.FeatureCount = len(records)
    reindex_language_systems(gsub, records.index(record))


def reindex_language_systems(gsub, tnum_index):
    for script_record in gsub.ScriptList.ScriptRecord:
        script = script_record.Script
        language_systems = [script.DefaultLangSys] + [each.LangSys for each in script.LangSysRecord]
        for language_system in language_systems:
            if language_system is None:
                continue
            shifted = [index + 1 if index >= tnum_index else index for index in language_system.FeatureIndex]
            language_system.FeatureIndex = sorted(shifted + [tnum_index])
            language_system.FeatureCount = len(language_system.FeatureIndex)


def rename_family(font):
    name = font["name"]
    version = name.getDebugName(5)
    for platform in ((3, 1, 0x409), (1, 0, 0)):
        if name.getName(1, *platform) is None:
            continue
        name.setName(FAMILY, 1, *platform)
        name.setName("Regular", 2, *platform)
        name.setName(f"{version} : {FAMILY}", 3, *platform)
        name.setName(FAMILY, 4, *platform)
        name.setName(POSTSCRIPT_NAME, 6, *platform)
        name.setName(MODIFICATION_NOTICE, 10, *platform)
    for name_id in (16, 17, 21, 22):
        name.removeNames(nameID=name_id)


def main(source, target):
    font = TTFont(source)
    advance = add_tabular_glyphs(font)
    classify_as_base(font)
    add_tnum_feature(font)
    rename_family(font)
    font.flavor = "woff2"
    font.save(target)
    print(f"{target}: tabular figures 0-9 at {advance} units, family {FAMILY}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: add-tabular-figures.py <original.woff2> <output.woff2>")
    main(sys.argv[1], sys.argv[2])
